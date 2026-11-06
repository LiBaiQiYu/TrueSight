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

## 部署到 GitHub Pages

仓库已提供 `.github/workflows/pages.yml`。

首次部署需要在 GitHub 仓库中设置：

1. 打开 **Settings → Pages**；
2. **Build and deployment → Source** 选择 **GitHub Actions**；
3. 推送到 `main`，或手动运行 **Deploy website** workflow。

部署地址通常为：

```text
https://libaiqiyu.github.io/TrueSight/
```

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
