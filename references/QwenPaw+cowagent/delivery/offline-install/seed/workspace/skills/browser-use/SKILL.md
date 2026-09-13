---
name: browser-use
description: "Use the local browser-use CLI-MCP for web interaction when a task needs reliable clicking, typing, JavaScript-rendered pages, an existing login session, screenshots, uploads, or browser verification. Keep CowAgent as the only task planner; use the browser-use MCP tools for browser execution."
---

# browser-use 浏览器执行 Skill

这是 CowAgent 对官方 `browser-use` CLI-MCP 的离线适配层。它补强网页元素识别、可访问性树、坐标点击和点击后验证；不替换 CowAgent 原生 `browser` 工具，也不启动 Browser Use Cloud。

## 使用边界

- 普通公开页面、API 或静态文档优先使用 `web_fetch` 或 `web_search`，不要无谓启动浏览器。
- 需要点击、输入、登录态、JavaScript 渲染、下载、上传、弹层或复杂组件时使用本 Skill。
- CowAgent 负责规划和判断目标；`browser_exec` 只负责执行浏览器代码。
- 不调用 `uvx`、`pip install`、`playwright install`、Cloud API、tunnel、Cookie 导出或在线 Skill 安装。
- 不把密码、Cookie、令牌或完整页面敏感数据写入回复、日志或临时文件。

## MCP 工具

已注册的 MCP server 名称为 `browser-use`，固定只提供：

- `browser_exec(code)`：在持久化 browser-harness namespace 执行 Python。可用 `new_tab`、`goto_url`、`page_info`、`click_at_xy`、`type_text`、`fill_input`、`press_key`、`scroll`、`js`、`cdp`、`wait_for_load`、`list_tabs` 等 helper。
- `browser_screenshot(full, max_dim)`：获取当前页面截图。截图只用于确认布局、图像和最终状态，不替代 DOM/可访问性定位。

## 标准流程

1. 用 `browser_exec` 执行 `new_tab(url)`，首次导航不要直接假设已有页面。
2. 执行 `wait_for_load()`，再用 `page_info()` 或 CDP Accessibility Tree 获取当前页面状态。
3. 优先从 `cdp("Accessibility.getFullAXTree")` 按 role/name 找目标元素。
4. 用 `cdp("DOM.getBoxModel", backendNodeId=...)` 计算可见区域中心，再调用 `click_at_xy(x, y)`。不要凭截图猜坐标。
5. 点击、输入或提交后，必须用 targeted `js(...)`、`page_info()` 或再次读取 Accessibility Tree 验证结果。
6. 页面重绘、弹层切换、分页或滚动后，重新读取状态；不要复用过期的 backendNodeId 或坐标。
7. 遇到 iframe、Shadow DOM、下拉框、文件上传或对话框时，先读取对应 interaction skill 参考，再执行。

## 推荐代码形态

```python
new_tab("https://example.com")
wait_for_load()
print(page_info())
```

定位和点击应遵循：

```python
nodes = cdp("Accessibility.getFullAXTree")["nodes"]
# 过滤 role/name 后取得 backendDOMNodeId，再读取 DOM.getBoxModel。
# 计算 content quad 中心后 click_at_xy(x, y)，最后用 js/page_info 验证。
```

## 登录和危险操作

- 已有浏览器会话可以复用当前本地 profile，但不得导出或打印 Cookie。
- 遇到密码、MFA、验证码、授权确认或账号选择时暂停并请求用户处理；已有明确 SSO 且无需输入秘密时可以继续。
- 删除、提交、发送、支付、发布和外部系统写操作执行前，遵循 CowAgent 的确认规则。
- 浏览器连接失败时先读取 MCP 错误和 `page_info()`，不要循环重试；必要时关闭当前 browser-harness session 后再重开。

## 与原生 browser 的关系

简单导航、读取和 CowAgent 已经稳定覆盖的页面可以继续使用原生 `browser`。当页面点击不准、组件复杂或需要 Accessibility Tree + 坐标点击时优先使用本 Skill；失败后可以回退到原生工具或向用户报告阻塞。
