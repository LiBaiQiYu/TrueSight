# TrueSight 官网

官方项目主页，纯静态实现，无构建步骤、无外部 CDN 依赖。

## 文件

```text
website/
├─ index.html      页面结构
├─ styles.css      视觉样式与响应式布局
├─ main.js         导航、滚动动效、复制命令
├─ assets/         品牌与界面截图
└─ README.md
```

## 本地预览

在项目根目录执行：

```powershell
python -m http.server 4173 --directory website
```

浏览器打开 <http://127.0.0.1:4173/>。

## 维护者

- 开发者：`CarlosWhite_A1E`
- 个人网站：<https://cwa1e.top>

## 主题

官网支持两套主题，可在页面右上角切换：

- **TrueSight**：祖母绿品牌主题（默认）；
- **标准**：中性蓝灰主题。

选择写入 `localStorage` 的 `truesight.site.theme`，刷新后保留。

## 部署到 Cloudflare Workers

项目根目录已提供：

```text
wrangler.jsonc         Cloudflare Worker 配置
cloudflare/worker.js   ASSETS 绑定入口
website/               静态资源目录
```

首次部署前登录：

```powershell
npx wrangler login
```

部署：

```powershell
npx wrangler deploy
```

成功后 Wrangler 会输出 Worker 地址：

```text
https://truesight.carloswhitea1e.workers.dev
```

静态资源变更后重新执行 `npx wrangler deploy` 即可。`wrangler.jsonc` 中的 `assets.directory` 指向 `website/`。

## 更新截图

官网截图来自 `docs/`，如需更新，覆盖以下文件后同步到 `website/assets/`：

```text
docs/readme-home.png       -> website/assets/home.png
docs/readme-timeline.png   -> website/assets/timeline.png
docs/readme-talents.png    -> website/assets/talents-panel.png（裁到天赋区域）
docs/readme-teamfights.png -> website/assets/teamfights.png
```

## 修改注意

- 下载链接指向 `LiBaiQiYu/TrueSight` 的仓库 ZIP / Releases；
- 页面中的命令、环境要求与根目录 README 保持一致；
- 新增外部链接使用 `target="_blank"` 与 `rel="noreferrer"`；
- 不写入任何 API Key、Token 或账号信息。
