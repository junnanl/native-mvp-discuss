# patch-v1.0.7 薄 MCP 与动作库设计（基于 DrissionPage 4.0.5.6）

本文档是 `PLAN.md` 第 5 节的细化实现设计。API 依据：`docs/reference/DrissionPageDocs4.0.5.6/`，已逐项核对。

## 1. 连接与会话模型

- MCP 进程内维护**单例 `ChromiumPage`**，地址来自环境变量 `DP_BROWSER_ADDRESS`（默认 `browser:9222`，即 compose 内浏览器容器的服务名:端口）。
- 创建参数：`ChromiumOptions().set_address(...).existing_only(True)`。`existing_only` 保证 MCP **永远不会**在 CowAgent 容器内拉起浏览器——架构红线由 API 强制执行。
- **当前工作 tab** 概念：会话内保存 `current_tab_id`，所有动作可传 `tab_id` 覆盖；不传则用当前 tab。切换通过 `select_tab` 或 `get_tab` 自动更新。
- **元素注册表**：`browser_snapshot` 等动作找到的元素缓存为 `e1/e2/...` 短引用，交互动作可传 `ref`（复用缓存元素）或 `locator`（现查）。元素 `states.is_alive` 为 `False` 时自动按原 locator 重查一次。
- 浏览器容器重启后：现有 `ChromiumPage` 连接失效，动作层捕获异常后自动重建连接（`ChromiumPage` 重新接管），登录态由 profile 卷恢复。

## 2. MCP 工具（固定 4 个）

| 工具 | 参数 | 行为 |
|---|---|---|
| `browser_run` | `action: str, params: object` | 分发到动作库；未知 action 返回 action 清单 |
| `browser_snapshot` | `locator?, max_elements?` | 返回当前 tab 结构化摘要 + 可交互元素清单（带 `ref`） |
| `browser_screenshot` | `full?, max_dim?` | `get_screenshot(as_bytes='jpg'/png)`，Pillow 缩放至 max_dim，返回 base64 图片 |
| `browser_exec` | `code: str` | 逃生舱：在受控 namespace 执行 Python，`page/tab/actions/Keys/result` 可用；代码必须给 `result` 赋值以返回数据 |

所有返回统一包一层：`{ok: bool, action?, data?, error?}`。异常不抛出裸栈，转结构化错误（含 DrissionPage 异常类型名），便于 Agent 自恢复。

## 3. 动作库清单 v2

除特别标注外，`locator` 支持 DrissionPage 全部定位语法（`#id`、`.class`、`t:tag`、`@attr=`、`text:`、`x:`、`c:` 及组合），`tab_id` 为可选公共参数。

### 3.1 导航类
| action | 参数 | 说明 |
|---|---|---|
| `goto` | `url, timeout?, retry?` | `page.get()`，返回是否成功 + url_available |
| `back` / `forward` | `steps?` | 历史前进后退 |
| `refresh` | `ignore_cache?` | 刷新 |
| `wait_ready` | `timeout?` | `wait.doc_loaded()` |
| `wait_url` | `text, timeout?` | `wait.url_change()` |
| `wait_title` | `text, timeout?` | `wait.title_change()` |
| `stop_loading` | 无 | 强制停止加载 |

### 3.2 标签页类
| action | 参数 | 说明 |
|---|---|---|
| `list_tabs` | 无 | `tab_ids` + 各 tab 的 url/title |
| `new_tab` | `url?, background?, new_context?` | 新建并设为当前 tab |
| `select_tab` | `tab_id 或 index/url/title 匹配` | `get_tab()`，设为当前 |
| `close_tabs` | `tab_ids?, others?` | `close_tabs()` |
| `tab_to_front` | `tab_id?` | `set.tab_to_front()` |

### 3.3 读取类
| action | 参数 | 说明 |
|---|---|---|
| `page_info` | 无 | url/title/ready_state/tab_id/browser_version/has_alert/is_loading |
| `read_text` | `locator?, max_len?` | 页面或元素 `.text` |
| `read_html` | `locator?, max_len?` | `.html`（截断保护上下文） |
| `read_table` | `locator, max_rows?` | 解析 `<table>` 为二维数组 |
| `read_json` | 无 | `.json` |
| `get_cookies` | `all_domains?, as_dict?` | `cookies()`；**Skill 层红线：不得写日志/回复** |
| `get_storage` | `type: session/local, item?` | session_storage / local_storage |
| `save_page` | `as_pdf?, path, name?` | `save()`，mhtml 或 pdf |

### 3.4 查找与交互类
| action | 参数 | 说明 |
|---|---|---|
| `find_element` | `locator, timeout?, index?` | 返回元素摘要（tag/text/attrs/rect/状态）并登记 `ref` |
| `find_elements` | `locator, max_count?` | 批量，返回摘要数组 |
| `click` | `ref 或 locator, by_js?, timeout?` | 默认模拟点击；失败自动回退 js（对齐 `click()` 语义） |
| `click_at` | `ref/locator, offset_x?, offset_y?, button?` | `click.at()` |
| `input_text` | `ref/locator, text, clear?, by_js?` | `input()`；文本末尾 `\n` 即回车提交 |
| `clear_input` | `ref/locator` | `clear()` |
| `press_key` | `keys: str 或组合键数组` | `page.actions.key_down/key_up`；组合键如 `["CTRL","a"]` |
| `select_option` | `ref/locator, by: text/value/index, value` | `select.by_text/by_value/by_index` |
| `hover` | `ref/locator, offset_x?, offset_y?` | `hover()` |
| `scroll_page` | `to: top/bottom/location, x?, y?, pixel?, direction?` | 页面 `scroll.*` |
| `scroll_element` | `ref/locator, 同上` | 元素 `scroll.*` |
| `scroll_to_see` | `ref/locator, center?` | `scroll.to_see()` |
| `drag` | `ref/locator, offset_x, offset_y, duration?` | `drag()` |

### 3.5 等待类
| action | 参数 | 说明 |
|---|---|---|
| `wait_element` | `locator, state: displayed/hidden/deleted/not_covered/clickable, timeout?` | 页面级 `wait.ele_*` |
| `wait_new_tab` | `timeout?` | `wait.new_tab()`，返回新 tab id |
| `wait_downloads_done` | `timeout?` | `wait.all_downloads_done()` |

### 3.6 弹窗类
| action | 参数 | 说明 |
|---|---|---|
| `handle_alert` | `accept?, send?, timeout?` | `handle_alert()`，返回弹窗文本 |
| `set_auto_alert` | `on_off?, accept?, all_tabs?` | `set.auto_handle_alert()` |

### 3.7 脚本与协议类
| action | 参数 | 说明 |
|---|---|---|
| `run_js` | `script, args?` | 页面 `run_js()`，需 `return` 取值 |
| `run_cdp` | `cmd, args?` | `run_cdp()`，逃生舱的协议级补充 |

### 3.8 文件类
| action | 参数 | 说明 |
|---|---|---|
| `download_by_click` | `ref/locator, save_path, rename?, suffix?, new_tab?, timeout?` | `click.to_download()` + `mission.wait()`，返回文件路径 |
| `upload_by_click` | `ref/locator, file_paths, by_js?` | `click.to_upload()`；文件须位于浏览器容器内挂载路径（见第 5 节） |
| `set_download_path` | `path` | `set.download_path()` |

### 3.9 网络监听类（参考 DrissionPageMCP 能力面）
| action | 参数 | 说明 |
|---|---|---|
| `listen_start` | `targets, is_regex?, method?` | `listen.start()` |
| `listen_wait` | `count?, timeout?` | `listen.wait()`，返回包摘要（url/method/status）+ 可选 body |
| `listen_results` | 无 | `listen.results()` |
| `listen_stop` | 无 | `listen.stop()` |

### 3.10 治理类（本次故障的针对性能力）
| action | 参数 | 说明 |
|---|---|---|
| `health_check` | 无 | CDP 连通、browser_version、tabs_count、当前 tab alive、连接自动重建结果 |
| `cleanup_tabs` | `keep: current/none, max_tabs?` | 超过上限（默认 8）关闭最旧非活动 tab；返回清理明细 |
| `set_timeouts` | `base?, page_load?, script?` | `set.timeouts()` |
| `set_load_mode` | `mode: normal/eager/none` | `set.load_mode()` |
| `set_window` | `width?, height?, maximize?` | `set.window.*` |
| `set_user_agent` | `ua` | `set.user_agent()` |
| `ignore_cert_errors` | — | 连接层选项，创建前由 env `DP_IGNORE_CERT_ERRORS=1` 控制（内网自签证书常见） |

## 4. 依赖闭包（Python 3.11）

DrissionPage 4.0.5.6 及其依赖（以 pip 实际解析为准，制包时固化为 `requirements.lock`）：

- `DrissionPage==4.0.5.6`（内部含 DownloadKit）
- `lxml`（browser-use site-packages 已有，但本 toolpack 独立自包含，重新固化）
- `websocket-client` / `requests`（以 pip resolve 结果为准）
- `Pillow`（仅 `browser_screenshot` 缩放用）

固化方式与 1.0.4/1.0.6 相同：开发环境 `pip download` → wheel 内嵌 → 现场解包到 `toolpacks/python/drissionpage/site-packages`，运行时 `PYTHONPATH` 指向，**现场零安装**。

## 5. 跨容器路径约定

- 上传/下载路径一律指**浏览器容器内**路径。浏览器容器挂载宿主机 `storage/browser/files`（下载）与 `storage/browser/uploads`（上传），容器内固定映射为 `/data/downloads` 与 `/data/uploads`。
- 动作层对 `save_path` 做白名单校验：只允许 `/data/downloads`、`/data/uploads` 及其子路径，防止越权写。
- CowAgent 侧如需取回文件，走既有文件中心/共享卷机制，不在本 MCP 职责内。

## 6. `browser_exec` 逃生舱边界

- 执行环境提供：`page`（当前 tab 的 Tab 对象）、`browser`（ChromiumPage 总管）、`actions`、`Keys`、`result`（初始 `None`）。
- 禁止项（静态检查拒绝）：`import os`/`subprocess`/`socket`（防越出浏览器域）、写 `/data` 白名单外路径。允许 `import DrissionPage.*` 与纯计算模块。
- SKILL.md 明确：逃生舱跑通的逻辑，值得复用的应建议固化为新 action（现场整理后进下个补丁）。
