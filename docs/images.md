# 图片资源

英雄头像、英雄小图标、技能图标、装备图标全部存放在 `ui/public/assets/`，随前端构建产物（`ui/dist`）一起发布，运行时不依赖第三方图片 CDN。

## 目录结构

```text
ui/public/assets/
├── manifest.json              # 下载时间、数量、大小、失败列表
├── heroes/                    # 英雄头像（256×144 官方图）
│   └── icons/                 # 英雄小图标（32×32，头像缺失时兜底）
├── abilities/                 # 技能图标（128×128）
└── items/                     # 装备图标（88×64，图纸共用 recipe.png）
```

文件名规则：

- 英雄：`npc_dota_hero_axe` → `heroes/axe.png`、`heroes/icons/axe.png`；
- 技能：技能内部 key，例如 `axe_berserkers_call.png`；
- 装备：装备内部 key，例如 `item_blink.png`、`item_recipe_blink.png`。

## 下载 / 更新

脚本读取 `ui/public/names/*.json`，按官方 CDN 路径批量下载：

```powershell
# 在项目根目录
runtime\python\python.exe -X utf8 tools\assets\fetch_images.py

# 强制重新下载全部
runtime\python\python.exe -X utf8 tools\assets\fetch_images.py --force

# 只更新英雄头像 / 技能 / 装备
runtime\python\python.exe -X utf8 tools\assets\fetch_images.py --only portraits
runtime\python\python.exe -X utf8 tools\assets\fetch_images.py --only abilities
runtime\python\python.exe -X utf8 tools\assets\fetch_images.py --only items
```

脚本会校验 PNG 头、跳过已存在文件，并在 `ui/public/assets/manifest.json` 记录结果。Dota 版本更新后建议：

```powershell
cd ui
npm run names
cd ..
runtime\python\python.exe -X utf8 tools\assets\fetch_images.py
```

## 运行期回退

`ui/src/lib/assets.ts` 统一生成图片 URL，并在 `main.ts` 安装一个捕获阶段的全局 `error` 监听器：

- 页面默认加载 `./assets/...` 本地文件；
- 本地文件缺失时，按 `data-fallback` 里的顺序重试官方 CDN（英雄头像 → 英雄小图标；技能图标 → 英雄小图标）；
- 回退链走完后，组件自己的 `@error` 再隐藏图片或显示首字占位。

因此新增英雄/技能而尚未更新资源时不会出现裂图，也不会阻塞页面。

## 先天技能占位

少数先天技能在官方 CDN 上没有独立图标（下载会 404）。脚本会复制对应英雄的 32×32 小图标作为占位，与旧版前端的回退行为一致；`manifest.json` 的 `hero_icon_placeholders` 记录数量。

## 版权

图片资源来自 Valve 官方 Dota 2 CDN，仅用于本项目的对局分析展示；请勿将这些资源单独打包分发或用于商业用途。
