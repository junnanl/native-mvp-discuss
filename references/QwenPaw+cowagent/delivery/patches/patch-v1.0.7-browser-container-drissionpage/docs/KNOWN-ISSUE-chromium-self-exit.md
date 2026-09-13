# 根因报告：浏览器容器"自退"——已解决

状态：**已解决**（2026-09-07）。本文档从"已知问题记录"升级为"根因报告"。

---

## 根因

**DrissionPage 4.0.5.6 `ChromiumPage._run_browser()` 的接管启发式：**
接管已存在的无头浏览器时，若 `ChromiumOptions` 未声明 `--headless`，
`connect_browser` 会把 `option._headless` 置 `False`，而 UA 中含
`HeadlessChrome`，于是三条件全中：

```python
# chromium_page.py:76
if self._is_exist and self._chromium_options._headless is False \
        and 'headless' in r['userAgent'].lower():
    self._browser.quit(3)   # → CDP Browser.close，优雅退出 rc=0
    connect_browser(self._chromium_options)  # existing_only 下重连失败
```

即：**每次 ChromiumPage 构造都会对被接管的浏览器发 `Browser.close`**
（优雅关闭，退出码 0，日志无痕），随后 `existing_only` 挡住自启 → 报
BrowserConnectError。容器 `restart: on-failure` 又把浏览器拉起——整个
循环即此前观察到的"偶发自退、时间不定、RestartCount 累积"。

上游佐证：g1879/DrissionPage PR #692（作者确认已在 4.1.x 分支修复该行为）。

## 排查过程中的其他确认项

1. **GWP-ASan heap-use-after-free（真实存在，与本问题独立）**：Chromium 120
   （Debian bullseye 最终版，已 EOL）存在 120 时代 UAF（CVE-2024-1077/1284/2883
   等，修复于 121.0.6167.160+ / 123.0.6312.86+）。GWP-ASan 低采样率导致其
   表现偶发（segfault 或 rc=0）。**browser-use 时代的内网"浏览器挂掉"与该
   UAF 相关**。规避：升级 Chromium（建议 Chrome for Testing 152 或更高，
   下一基线升级时评估）；`restart: on-failure` 兜底保留。
2. Chromium 110+ 三道 CDP 安全闸（环回绑定 / Host 校验 / WS Origin 校验）
   的过法已固化在交付物中（转发器 + IP 预解析 + `--remote-allow-origins=*`）。
3. 容器内无 dbus、nofile=1024 耗尽、SingletonLock 残留、profile Crashed 状态
   等均为排查途中真实遇到并已修复的独立小问题（保留在 entrypoint/compose 中）。

## 修复内容（已实测）

| 修复 | 位置 | 说明 |
|---|---|---|
| `co.set_argument('--headless', 'new')` | session.py `browser` 属性 | 使 `_headless` 为真值，跳过杀浏览器启发式。**Chromium 120 30 轮接管-断开 0 重启（修复前 28 次）、CfT 152 30/30 存活** |
| close_tabs 空浏览器保护 | actions.py `close_tabs` | 4.0.5.6 的 close_tabs 在"将关闭最后一个 tab"时转调 `quit()` 杀整个浏览器；动作层拒绝关闭最后一个 tab |
| 顺带确认无害 | — | HTTP 轮询、裸 ws 会话、`SystemInfo.getProcessInfo`/`Target.setDiscoverTargets`/`DOM.*`/`Page.*` 全序列手工会话均不触发 |

## 验证结果（修复后）

- Chromium 120.0.6099.224（现场同版本）：30 轮接管-点击-断开，RestartCount 28→28（零新增）
- Chrome for Testing 152：30/30 存活
- 全量 verify 10/10（握手/工具/接管/导航/快照/ref 点击/JS/截图/守卫/逃生舱）

## 结论与遗留

- 本问题**不涉及 Chromium 升级**：4.0.5.6 + 现场既有 Chromium 120 即可稳定运行。
- **升级建议（下一基线）**：Chromium 120 已 EOL，存在多个已公开 UAF。建议后续
  基线升级时改用 Chrome for Testing（152.0.7977.82 实测可在 2.1.7 镜像内直接
  运行，二进制约 190MB，可随补丁卷挂载分发，不动镜像）。
- browser-use 时代内网故障复盘：Launcher 的 trap 杀浏览器 + 本 UAF 叠加，
  已被本补丁架构（独立容器 + 常驻 + on-failure）连同根因一起解决。
