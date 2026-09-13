---
id: get_page_info
title: '🚄 获取页面信息'
---

<div class="wwads-cn wwads-horizontal" data-id="317"></div><br/>

成功访问网页后，可使用`SessionPage`自身属性和方法获取页面信息。

```python
from DrissionPage import SessionPage

page = SessionPage()
page.get('http://www.baidu.com')
# 获取页面标题
print(page.title)
# 获取页面html
print(page.html)
```

**输出：**

```shell
百度一下，你就知道
<!DOCTYPE html>
<!--STATUS OK--><html> <head><meta http-equi...
```

---

## ✅️️ 页面信息

### 📌 `url`

此属性返回当前访问的 url。

**类型：**`str`

---

### 📌 `url_available`

此属性以布尔值返回当前链接是否可用。

**类型：**`bool`

---

### 📌 `title`

此属性返回当前页面`title`文本。

**类型：**`str`

---

### 📌 `raw_data`

此属性返回访问到的元素数据，即`Response`对象的`content`属性。

**类型：**`bytes`

---

### 📌 `html`

此属性返回当前页面 html 文本。

**类型：**`str`

---

### 📌 `json`

此属性把返回内容解析成 json。  
比如请求接口时，若返回内容是 json 格式，用`html`属性获取的话会得到一个字符串，用此属性获取可将其解析成`dict`。
支持访问 `*.json` 文件，也支持 API 返回的json字符串。

**类型：**`dict`

---

### 📌 `user_agent`

此属性返回当前页面 user_agent 信息。  

**类型：**`str`

---

## ✅️️ 运行参数信息

### 📌 `timeout`

此属性返回网络请求超时时间。默认为 10，可对其赋值设置。

**类型：**`int`、`float`

```python
# 创建页面对象时指定
page = SessionPage(timeout=5)

# 修改 timeout
page.timeout = 20
```

---

### 📌 `retry_times`

此属性为网络连接失败时的重试次数。默认为 3，可对其赋值。

**类型：**`int`

```python
# 修改重试次数
page.retry_times = 5
```

---

### 📌 `retry_interval`

此属性为网络连接失败时的重试等待间隔秒数。默认为 2，可对其赋值。

**类型：**`int`、`float`

```python
# 修改重试等待间隔时间
page.retry_interval = 1.5
```

---

### 📌 `encoding`

此属性返回用户主动设置的编码格式。

---

## ✅️️ cookies 信息

### 📌 `cookies()`

此方法返回 cookies 信息。

**类型：**`dict`、`list`

| 参数名称          | 类型     | 默认值     | 说明                                                                            |
|:-------------:|:------:|:-------:|-------------------------------------------------------------------------------|
| `as_dict`     | `bool` | `False` | 是否以字典方式返回结果。为`True`时返回由`{name: value}`键值对组成的`dict`，且`all_info`参数无效；为`False`返回 cookie 组成的`list` |
| `all_domains` | `bool` | `False` | 是否返回所有域的 cookies，为`False`则指返回当前域名的                                            |
| `all_info`    | `bool` | `False` | 返回的 cookies 是否包含所有信息，`False`时只包含`name`、`value`、`domain`信息                     |

| 返回类型   | 说明                                  |
|:------:| ----------------------------------- |
| `dict` | `as_dict`为`True`时，返回字典格式 cookies    |
| `list` | `as_dict`为`False`时，返回 cookies 组成的列表 |

**示例：**

```python
from DrissionPage import SessionPage

page = SessionPage()
page.get('http://www.baidu.com')
page.get('http://gitee.com')

for i in page.cookies(as_dict=False, all_domains=True):
    print(i)
```

**输出：**

```
{'domain': '.baidu.com', 'domain_specified': True, ......}
......
{'domain': 'gitee.com', 'domain_specified': False, ......}
......
```

---

## ✅️️ 内嵌对象

### 📌 `session`

此属性返回当前页面对象使用的`Session`对象。

**类型：**`Session`

---

### 📌 `response`

此属性为请求网页后生成的`Response`对象，本库没实现的功能可直接获取此属性调用 requests 库的原生功能。

**类型：**`Response`

```python
# 打印连接状态
r = page.response
print(r.status_code)
```
