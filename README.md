# 只展示源码和自动上传用，自用别乱加星

https://qbsg.top/

墨水屏固件管理平台的前端项目，基于 Vue 3 + Vite 构建。

ui照搬 https://my.xfltd.org/

## 功能

- **主页** — 版本更新日志、商品推荐
- **教程** — 各固件控制平台入口及使用说明
- **固件** — 浏览、筛选、下载墨水屏固件
- **激活码** — 填写设备 MAC 地址，消耗积分获取固件激活码
- **我的** — 账号信息、积分查询、密码修改、账号注销

## 技术栈

- Vue 3 + Vue Router
- Vite
- NProgress

## 开发

```bash
npm install
npm run dev
```

## 配置

在 `src/config/app.js` 中修改：

- `APP_BASE_PATH` — 部署子目录
- `API_BASE_URL` — 本地开发时的后端代理地址