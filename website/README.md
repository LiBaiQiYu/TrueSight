# TrueSight 官网

Windows 桌面客户端官网，纯静态站，无构建步骤、无外部 CDN。设计参考 Apple 产品页：黑色 Hero、大字号、全宽产品截图与克制的留白。

## 页面结构

- Hero：产品定位、主下载按钮、标准主题客户端截图；
- 概览：5 秒 / 1 秒 / 0.1 秒采样精度与“0 云端上传”；
- 时间轴：5 秒级经济、真实背包、出装路线、技能与天赋；
- 战斗节点：以分析对象为中心的单杀 / 小规模 / 团战 / 多杀；
- AI 复盘：本地录像事实基准、多模型服务商、Key 仅保存在本机；
- 隐私：Key 不上云、录像不出门、没有遥测；
- 下载：安装版 / 便携版、技术规格与 SmartScreen 提示；
- FAQ：安装选择、运行时、首次解析、缓存、更新、平台与版权。

## 文件

```text
website/
├─ index.html       页面结构
├─ styles.css       设计系统、响应式布局与深浅主题
├─ main.js          导航、主题切换、移动端菜单
├─ assets/          品牌标识与客户端截图
└─ README.md
```

## 主题

- 默认 **标准**：白底 + 蓝色强调色，Hero 与战斗节点保持黑色；
- **TrueSight**：深色底 + 绿色强调色，整体同构；
- 切换写入 `localStorage` 的 `truesight.site.theme`，页面加载时在 `<head>` 内提前设置，避免闪烁。

## 界面截图

截图全部使用客户端 **标准主题**：

- `standard-analysis-light.png`：分析主界面（浅色）；
- `standard-timeline-dock.png`：时间轴弹窗（浅色，已裁切）；
- `standard-combat-dock.png`：战斗节点（深色，已裁切）；
- `standard-settings-light.png`：模型服务设置（浅色）。

截图由真实客户端通过 Electron 远程调试截取，尺寸 1600×1000（弹窗裁切为 1488×920）。更新界面后需要重新截图并保持文件名不变。

## 本地预览

```powershell
python -m http.server 4173 --directory website
```

打开 <http://127.0.0.1:4173/>。本地预览时 `/downloads/...` 会 404；下载由线上 Cloudflare Worker 的 R2 绑定提供。

## 下载文件

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
```

版本更新时同步：

1. `website/index.html` 中的下载文件名、版本号与大小；
2. `cloudflare/worker.js` 的 `DOWNLOAD_FILES` 白名单；
3. 上传新的 R2 对象；
4. `npx wrangler deploy`。

## 部署

```powershell
npx wrangler deploy
```

线上地址：<https://truesight.carloswhitea1e.workers.dev/>

## 维护者

- 开发者：`CarlosWhite_A1E`
- 个人网站：<https://cwa1e.top>
