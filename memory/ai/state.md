# AI 状态快照

> 由 `.githooks/pre-commit` 调用 `tools/memory/update.py` 自动生成；请勿手改。

- 更新时间：2026-11-10T11:34:19+08:00
- 分支：main
- 项目版本：0.1.0

## 本次提交（暂存）

```text
M	java/MatchJsonMain.java
M	server.py
M	ui/src/App.vue
A	ui/src/components/AboutView.vue
M	ui/src/components/AppSidebar.vue
M	ui/src/components/MatchCard.vue
M	ui/src/components/SettingsView.vue
A	ui/src/lib/about.ts
M	ui/src/lib/combatNodes.ts
M	ui/src/lib/opendota.ts
M	ui/src/lib/replay.ts
M	ui/src/lib/stratz.ts
```

### 变更统计

```text
java/MatchJsonMain.java            |  62 ++++-
 server.py                          |  35 +++
 ui/src/App.vue                     |  34 ++-
 ui/src/components/AboutView.vue    | 448 +++++++++++++++++++++++++++++++++++++
 ui/src/components/AppSidebar.vue   |  20 ++
 ui/src/components/MatchCard.vue    |  38 ++++
 ui/src/components/SettingsView.vue |  71 ++++++
 ui/src/lib/about.ts                |  92 ++++++++
 ui/src/lib/combatNodes.ts          | 173 +++++++++++---
 ui/src/lib/opendota.ts             |  38 +++-
 ui/src/lib/replay.ts               |   7 +
 ui/src/lib/stratz.ts               |  93 +++++++-
 12 files changed, 1070 insertions(+), 41 deletions(-)
```

## 工作区未提交

```text
M README.md
M  java/MatchJsonMain.java
 M memory/ai/changelog.md
 M memory/ai/context.md
 M memory/ai/decisions.md
 M memory/ai/state.md
M  server.py
M  ui/src/App.vue
A  ui/src/components/AboutView.vue
M  ui/src/components/AppSidebar.vue
 M ui/src/components/CombatNodePanel.vue
 M ui/src/components/HeroAvatar.vue
 M ui/src/components/HeroSelect.vue
M  ui/src/components/MatchCard.vue
M  ui/src/components/SettingsView.vue
 M ui/src/components/TimelineBuild.vue
 M ui/src/components/TimelineChart.vue
 M ui/src/components/TimelineDock.vue
 M ui/src/components/TimelineItems.vue
A  ui/src/lib/about.ts
M  ui/src/lib/combatNodes.ts
 M ui/src/lib/heroes.ts
M  ui/src/lib/opendota.ts
M  ui/src/lib/replay.ts
 M ui/src/lib/rich-terms.ts
M  ui/src/lib/stratz.ts
 M ui/src/lib/timeline.ts
 M ui/src/main.ts
?? docs/images.md
?? tools/assets/
?? ui/public/assets/
?? ui/src/lib/assets.ts
```

## 最近提交

```text
58ed2b0 (HEAD -> main, origin/main, origin/HEAD) fix: humanize unmapped replay unit and ability names
6e25e0e fix: refine combat node sources and precise timeline
7490942 fix: correct combat node damage attribution
82b01b8 feat: replace teamfight tab with combat nodes
0d32e8c docs: define combat node feature and replay data requirements
```

---

更完整的上下文见 `context.md`、`decisions.md` 和 `changelog.md`。
