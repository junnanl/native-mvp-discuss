# 数字员工平台完整离线交付包

## 适用环境

- Linux x86_64
- glibc 2.28 或更高版本
- 无需预装 Node.js、pnpm，也无需连接公网
- Evo-Harness 需要单独部署并能被本机访问

该包包含源码、生产构建、完整 `node_modules`（含开发依赖）、Node.js 运行时和 pnpm。可以直接启动，也可以在离线环境重新类型检查和构建。

## 首次部署

1. 解压交付包并进入目录。
2. 按现场地址修改 `config.env`。
3. 运行 `./verify.sh` 检查包结构。
4. 运行 `./start.sh` 启动服务。
5. 浏览器访问 `http://服务器地址:3010`。

管理员页面地址为 `/admin`，原型账号和密码均为 `admin`。

## 运维命令

```bash
./start.sh
./status.sh
./stop.sh
./rebuild.sh
tail -f logs/application.log
```

`rebuild.sh` 只使用包内的 Node.js、pnpm 和现有 `node_modules`，不会联网安装依赖。重新构建前应先执行 `./stop.sh`，构建结束后再执行 `./start.sh`。

## 可写数据

- 员工配置：`app/data/employees.json`
- 员工头像：`app/public/avatars/`
- 运行日志：`logs/application.log`
- 进程文件：`run/digital-employee.pid`

升级或覆盖部署前应备份员工配置和头像目录。

## 配置项

- `HOSTNAME`：监听地址，默认 `0.0.0.0`
- `PORT`：服务端口，默认 `3010`
- `COWAGENT_BASE_URL`：Evo-Harness 地址，默认 `http://127.0.0.1:19989`
- `COWAGENT_WEB_PASSWORD`：Evo-Harness Web 密码，无密码时留空

管理页编辑每个员工时可以单独填写 `Evo-Harness 地址` 和 `Evo-Harness 访问密码`。员工字段优先于这里的默认配置；留空地址继承 `COWAGENT_BASE_URL`，留空密码继承 `COWAGENT_WEB_PASSWORD`。地址和密码只由服务端读取，公开员工接口不会返回。

## 边界

本交付包只包含数字员工 MVP。Evo-Harness/CowAgent、模型服务以及它们的运行依赖不在本包中，需要现场已有对应服务。
