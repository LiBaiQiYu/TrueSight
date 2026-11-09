# AI 状态快照

> 由 `.githooks/pre-commit` 调用 `tools/memory/update.py` 自动生成；请勿手改。

- 更新时间：2026-11-09T17:06:32+08:00
- 分支：main
- 项目版本：0.1.0

## 本次提交（暂存）

```text
M	docs/combat-nodes.md
M	memory/ai/changelog.md
M	memory/ai/context.md
M	ui/src/components/TimelineDock.vue
M	ui/src/components/TimelineItems.vue
M	ui/src/lib/combatNodes.ts
A	ui/src/lib/labels.ts
M	ui/src/lib/prompt.ts
```

### 变更统计

```text
docs/combat-nodes.md                |   3 +-
 memory/ai/changelog.md              |   2 +
 memory/ai/context.md                |   1 +
 ui/src/components/TimelineDock.vue  |   3 +-
 ui/src/components/TimelineItems.vue |   4 +-
 ui/src/lib/combatNodes.ts           |  61 +++++----
 ui/src/lib/labels.ts                | 240 ++++++++++++++++++++++++++++++++++++
 ui/src/lib/prompt.ts                |  13 +-
 8 files changed, 289 insertions(+), 38 deletions(-)
```

## 工作区未提交

```text
M  docs/combat-nodes.md
M  memory/ai/changelog.md
M  memory/ai/context.md
 M memory/ai/state.md
 M ui/src/components/MatchCard.vue
M  ui/src/components/TimelineDock.vue
M  ui/src/components/TimelineItems.vue
M  ui/src/lib/combatNodes.ts
A  ui/src/lib/labels.ts
 M ui/src/lib/opendota.ts
M  ui/src/lib/prompt.ts
```

## 最近提交

```text
6e25e0e (HEAD -> main, origin/main, origin/HEAD) fix: refine combat node sources and precise timeline
7490942 fix: correct combat node damage attribution
82b01b8 feat: replace teamfight tab with combat nodes
0d32e8c docs: define combat node feature and replay data requirements
89babbd style: align download cards with standard theme
```

---

更完整的上下文见 `context.md`、`decisions.md` 和 `changelog.md`。
