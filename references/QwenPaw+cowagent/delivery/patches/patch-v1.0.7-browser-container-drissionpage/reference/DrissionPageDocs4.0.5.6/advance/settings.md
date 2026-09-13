---
id: settings
title: '⚙️ 全局设置'
---

<div class="wwads-cn wwads-horizontal" data-id="317"></div><br/>

有一些运行时的全局设置，可以控制程序某些行为。

## ✅️️ 使用方式

全局设置在`DrissionPage.common`路径中。

以赋值的方式对`Settings`的属性进行设置。

使用方法：

```python
from DrissionPage.common import Settings

Settings.raise_when_wait_failed = True
```

---

## ✅️️ 设置项

### 📌 `raise_when_ele_not_found`

设置找不到元素时，是否抛出异常。默认为`False`。

---

### 📌 `raise_when_click_failed`

设置点击失败时，是否抛出异常。默认为`False`。

---

### 📌 `raise_when_wait_failed`

设置等待失败时，是否抛出异常。默认为`False`。

---

### 📌 `singleton_tab_obj`

设置 Tab 对象是否使用单例模式。默认为`True`。

---

### 📌 `cdp_timeout`

cdp 执行超时设置，默认为`30`。

---

## ✅️️ 示例

此示例设置找不到元素时立刻抛出异常（如不设置返回`NoneElement`）。

可直接执行查看效果。

```python
from DrissionPage import SessionPage
from DrissionPage.common import Settings

Settings.raise_when_ele_not_found = True

page = SessionPage()
page.get('https://www.baidu.com')
ele = page('#abcd')
```

**输出：**

```shell
...前面省略...
DrissionPage.errors.ElementNotFoundError: 
没有找到元素。
method: ele()
args: {'locator': '#abcd'}
```
