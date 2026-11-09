# AI 状态快照

> 由 `.githooks/pre-commit` 调用 `tools/memory/update.py` 自动生成；请勿手改。

- 更新时间：2026-11-09T15:39:12+08:00
- 分支：main
- 项目版本：0.1.0

## 本次提交（暂存）

```text
M	README.md
M	docs/combat-nodes.md
M	java/MatchJsonMain.java
M	memory/ai/changelog.md
M	memory/ai/context.md
M	memory/ai/decisions.md
M	server.py
A	ui/src/components/CombatNodePanel.vue
M	ui/src/components/TimelineDock.vue
A	ui/src/lib/combatNodes.ts
M	ui/src/lib/replay.ts
M	ui/src/lib/timeline.ts
```

### 变更统计

```text
README.md                             |  18 +-
 docs/combat-nodes.md                  |  10 +-
 java/MatchJsonMain.java               | 215 +++++++++-
 memory/ai/changelog.md                |   1 +
 memory/ai/context.md                  |   6 +-
 memory/ai/decisions.md                |   7 +
 server.py                             |   6 +-
 ui/src/components/CombatNodePanel.vue | 714 ++++++++++++++++++++++++++++++++++
 ui/src/components/TimelineDock.vue    |  11 +-
 ui/src/lib/combatNodes.ts             | 530 +++++++++++++++++++++++++
 ui/src/lib/replay.ts                  |  40 ++
 ui/src/lib/timeline.ts                |   3 +
 12 files changed, 1544 insertions(+), 17 deletions(-)
```

## 工作区未提交

```text
M  README.md
M  docs/combat-nodes.md
M  java/MatchJsonMain.java
M  memory/ai/changelog.md
M  memory/ai/context.md
M  memory/ai/decisions.md
 M memory/ai/state.md
M  server.py
A  ui/src/components/CombatNodePanel.vue
M  ui/src/components/TimelineDock.vue
A  ui/src/lib/combatNodes.ts
M  ui/src/lib/replay.ts
M  ui/src/lib/timeline.ts
```

## 最近提交

```text
0d32e8c (HEAD -> main, origin/main) docs: define combat node feature and replay data requirements
89babbd style: align download cards with standard theme
96c107d feat: redesign site around desktop client downloads
e73413c fix: persist portable backend outside temp
3c8da41 feat: add effort tag editor for custom models
```

---

更完整的上下文见 `context.md`、`decisions.md` 和 `changelog.md`。
