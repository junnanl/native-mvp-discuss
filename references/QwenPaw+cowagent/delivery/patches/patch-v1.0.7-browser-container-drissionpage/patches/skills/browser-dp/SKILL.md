---
name: browser-dp
description: "Use the browser-dp MCP (DrissionPage over CDP) when a task needs reliable clicking, typing, form filling, table extraction, file download/upload, JavaScript-rendered pages, login sessions, or page verification. The browser runs in a dedicated container that survives MCP restarts. Keep CowAgent as the only task planner; use browser-dp tools for browser execution."
---

# browser-dp 浏览器执行 Skill

CowAgent 对 DrissionPage 4.0.5.6 的离线适配层。浏览器运行在独立容器中（Chromium 120 常驻，CDP 接管），MCP 重启不影响浏览器与登录态。引擎为 DrissionPage，定位语法、元素交互、下载上传全部走固化动作。

## 使用边界

- 普通公开页面、API 或静态文档优先使用 `web_fetch` 或 `web_search`，不要无谓启动浏览器动作。
- 需要点击、输入、登录态、JavaScript 渲染、下载、上传、弹层或复杂组件时使用本 Skill。
- CowAgent 负责规划和判断目标；browser-dp 只负责执行。
- 不把密码、Cookie、令牌或完整页面敏感数据写入回复、日志或临时文件；`get_cookies` 结果只可用于当次浏览器操作上下文。
- 文件路径规则：上传文件放在 `/home/agent/cow/browser-dp/uploads/`，下载文件出现在 `/home/agent/cow/browser-dp/downloads/`（与浏览器容器共享，MCP 自动映射到容器内 `/data/uploads`、`/data/downloads`）。

## MCP 工具（固定 4 个）

- `browser_run(action, params)`：执行固化动作。action 清单见下节；未知 action 会返回完整清单。
- `browser_snapshot(locator?, max_elements?)`：读取当前标签页摘要与可交互元素清单，每个元素带 `ref`（如 `e12`），后续动作用 `ref` 复用。
- `browser_screenshot(full?, max_dim?)`：截图，返回 base64 JPEG。
- `browser_exec(code)`：逃生舱。在受控 namespace 执行 Python，可用 `browser`（ChromiumPage 总管）、`page`（当前 tab）、`actions`、`Keys`、`run_cdp`，把返回值赋给 `result`。禁止 `import os/subprocess/socket` 等。跑通且值得复用的逻辑应建议固化为新 action。

## 标准流程

1. 先 `browser_run("health_check")` 确认浏览器可达；失败时把错误报告给用户（浏览器容器可能未启动）。
2. `browser_run("new_tab", {"url": "..."})` 或 `goto` 打开目标页；`goto` 已内置等待加载。
3. 用 `browser_snapshot` 获取元素和 `ref`。**优先用 snapshot 的 ref 交互，不要凭截图猜坐标。**
4. 交互：`click` / `input_text` / `select_option` / `press_key` / `hover`。`input_text` 文本末尾加 `\n` 可直接回车提交。
5. 每次交互后用 `page_info`、`snapshot` 或 `wait_element` 验证结果；页面跳转后 ref 会失效，MCP 会按原 locator 自动重查，但 DOM 变化大时应重新 snapshot。
6. 表格用 `read_table`；页面文本用 `read_text`；需要 JSON 接口数据时用 `listen_start`+操作+`listen_wait` 抓包。
7. 下载：`download_by_click`（传 MCP 侧路径 `/home/agent/cow/browser-dp/downloads/xx`）；上传：先把文件写入 uploads 目录再 `upload_by_click`。
8. 结束后 `browser_run("close_tabs")` 关闭当前 tab，长会话定期 `cleanup_tabs` 控制内存。

## 动作清单（按类）

- **导航**：`goto(url)`、`back`、`forward`、`refresh`、`wait_ready`、`wait_url(text)`、`wait_title(text)`、`stop_loading`
- **标签页**：`list_tabs`、`new_tab(url)`、`select_tab(tab_id|index|url=|title=)`、`close_tabs(tab_ids?, others?)`、`tab_to_front`
- **读取**：`page_info`、`read_text`、`read_html`、`read_table(locator)`、`read_json`、`get_cookies`、`get_storage(type)`、`save_page(path, as_pdf?)`
- **查找与交互**：`find_element(locator)`、`find_elements(locator)`、`click(ref|locator, by_js?)`、`click_at(ref, offset_x, offset_y)`、`input_text(ref, text, clear?)`、`clear_input(ref)`、`press_key(keys)`（如 `["CTRL","a"]`）、`select_option(ref, by=text/value/index, value)`、`hover(ref)`、`scroll_page(to|pixel+direction)`、`scroll_element(...)`、`scroll_to_see(ref)`、`drag(ref, offset_x, offset_y)`
- **等待**：`wait_element(locator, state=displayed/hidden/deleted/not_covered/clickable)`、`wait_new_tab`、`wait_downloads_done`
- **弹窗**：`handle_alert(accept?, send?)`、`set_auto_alert(on_off)`（内网系统弹窗多时可预先开启）
- **脚本**：`run_js(script)`（需 `return` 取值）、`run_cdp(cmd, args)`
- **文件**：`download_by_click(ref, save_path)`、`upload_by_click(ref, file_paths)`、`set_download_path(path)`
- **监听**：`listen_start(targets)`、`listen_wait(count, with_body?)`、`listen_results`、`listen_stop`
- **治理**：`health_check`、`cleanup_tabs(max_tabs=8)`、`set_timeouts`、`set_load_mode(mode)`、`set_window`、`set_user_agent`

## 定位语法速查（DrissionPage 4.0.5.6）

| 写法 | 含义 |
|---|---|
| `#kw` / `.btn` | 按 id / class |
| `t:input` / `tag:input` | 按标签 |
| `@name=user` / `@placeholder:` | 按属性（`=`精确 `:`模糊 `^`开头 `$`结尾） |
| `text:登录` / `tx:登录` | 按文本 |
| `@@name=user@@type=password` | 多属性与 |
| `x://div[@id='x']` / `c:div>a` | xpath / css selector |
| `c:input,select,textarea,[role=button]` | css 多类型 |

## 故障恢复

- `ok: false` 时先读 `error.type`：`PageDisconnectedError`/连接类错误说明浏览器容器重启过，直接重试动作（MCP 自动重建连接，登录态由 profile 卷保留）。
- 元素找不到：先 `wait_element(locator, "displayed")`；iframe 内元素可直接用页面级 locator 查找（DrissionPage 支持跨 iframe）。
- 页面卡死：`stop_loading`，或 `set_load_mode("eager")` 后重试。
- 不要循环重试同一失败动作超过 2 次；两次失败后换思路（重新 snapshot、换 locator）或报告阻塞。

## 与原生 browser / browser-use 的关系

- 简单导航、读取可继续用 CowAgent 原生 `browser` 工具。
- 旧的 browser-use MCP 已停用（`disabled: true`，保留可回滚）。需要精确交互时一律走本 Skill。
