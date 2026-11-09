# TrueSight 官网

Windows 桌面客户端官网，纯静态站，无构建步骤、无外部 CDN。

## 页面

- Hero：客户端定位、版本、Windows 要求与主下载按钮；
- 功能：桌面客户端、AI 提供商、时间轴、对位、出装/团战、隐私；
- 界面：主页、时间轴、天赋、团战截图；
- 下载：安装版、便携版、源码/Releases；
- 开始使用：下载 → 启动 → 选择比赛 → 配置 AI；
- FAQ：安装版/便携版、运行时、SmartScreen、更新与卸载。

## 文件

```text
website/
├─ index.html       页面结构
├─ styles.css       视觉样式与响应式布局
├─ main.js          导航、滚动动效、复制、主题
├─ assets/          品牌与界面截图
└─ README.md
```

## 本地预览

```powershell
python -m http.server 4173 --directory website
```

打开 <http://127.0.0.1:4173/>。

本地预览时 `/downloads/...` 会 404；下载由线上 Cloudflare Worker 的 R2 绑定提供。

## 下载文件

线上下载地址：

```text
/downloads/TrueSight-Setup-0.1.0-x64.exe
/downloads/TrueSight-Portable-0.1.0-x64.exe
```

R2 bucket：`truesight-downloads`，Worker 绑定：`DOWNLOADS`。

上传新版本：

```powershell
npx wrangler r2 object put "truesight-downloads/TrueSight-Setup-0.1.0-x64.exe" `
  --file="desktop\release\TrueSight-Setup-0.1.0-x64.exe" `
  --content-type="application/octet-stream" `
  --cache-control="public, max-age=3600" --remote

npx wrangler r2 object put "truesight-downloads/TrueSight-Portable-0.1.0-x64.exe" `
  --file="desktop\release\TrueSight-Portable-0.1.0-x64.exe" `
  --content-type="application/octet-stream" `
  --cache-control="public, max-age=3600" --remote
```

版本更新时需要同步：

1. `website/index.html` 中的下载文件名、版本号与大小；
2. `cloudflare/worker.js` 的 `DOWNLOAD_FILES` 白名单；
3. 上传新的 R2 对象；
4. `npx wrangler deploy`。

## 主题

- **TrueSight**：祖母绿品牌主题（默认）；
- **标准**：中性蓝灰主题；
- 选择写入 `localStorage` 的 `truesight.site.theme`。

## 部署

```powershell
npx wrangler deploy
```

线上地址：

<https://truesight.carloswhitea1e.workers.dev/>

## 维护者

- 开发者：`CarlosWhite_A1E`
- 个人网站：<https://cwa1e.top>
