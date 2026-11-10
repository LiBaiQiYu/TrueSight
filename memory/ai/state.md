# AI 状态快照

> 由 `.githooks/pre-commit` 调用 `tools/memory/update.py` 自动生成；请勿手改。

- 更新时间：2026-11-10T11:54:28+08:00
- 分支：main
- 项目版本：0.1.0

## 本次提交（暂存）

```text
M	README.md
M	docs/images.md
M	memory/ai/changelog.md
M	memory/ai/context.md
M	memory/ai/decisions.md
A	memory/dota-images.md
M	server.py
M	tools/assets/fetch_images.py
M	ui/public/assets/manifest.json
M	ui/src/components/AboutView.vue
M	ui/src/lib/about.ts
M	website/index.html
M	website/styles.css
```

### 变更统计

```text
README.md                       |  1 +
 docs/images.md                  |  9 ++++++-
 memory/ai/changelog.md          |  1 +
 memory/ai/context.md            |  1 +
 memory/ai/decisions.md          |  2 ++
 memory/dota-images.md           | 59 +++++++++++++++++++++++++++++++++++++++++
 server.py                       | 13 ++++++++-
 tools/assets/fetch_images.py    | 21 +++++++++++++--
 ui/public/assets/manifest.json  |  7 ++---
 ui/src/components/AboutView.vue | 57 ++++++++++++++++++++++++++++++++++++++-
 ui/src/lib/about.ts             |  1 +
 website/index.html              |  1 +
 website/styles.css              |  8 ++++++
 13 files changed, 173 insertions(+), 8 deletions(-)
```

## 工作区未提交

```text
M  README.md
M  docs/images.md
M  memory/ai/changelog.md
M  memory/ai/context.md
M  memory/ai/decisions.md
 M memory/ai/state.md
A  memory/dota-images.md
M  server.py
M  tools/assets/fetch_images.py
M  ui/public/assets/manifest.json
M  ui/src/components/AboutView.vue
M  ui/src/lib/about.ts
M  website/index.html
M  website/styles.css
```

## 最近提交

```text
fbea76a (HEAD -> main, origin/main, origin/HEAD) feat: add icons for capture and ice blast release
34473f6 docs: mark legacy item icon downloader obsolete
6fbdb6c docs: update download sizes for bundled images
29dee80 fix: cache bundled images for one day instead of immutable
c546b55 feat: bundle Dota hero, ability and item images locally
```

---

更完整的上下文见 `context.md`、`decisions.md` 和 `changelog.md`。
