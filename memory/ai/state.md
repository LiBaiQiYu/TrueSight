# AI 状态快照

> 由 `.githooks/pre-commit` 调用 `tools/memory/update.py` 自动生成；请勿手改。

- 更新时间：2026-11-05T16:35:49+08:00
- 分支：main
- 项目版本：0.1.0

## 本次提交（暂存）

```text
M	.gitignore
M	README.md
M	memory/ai/changelog.md
M	ui/src/App.vue
M	ui/src/components/MatchCard.vue
M	ui/src/components/TimelineDock.vue
A	ui/src/lib/chat.ts
A	ui/src/lib/config.ts
A	ui/src/lib/heroes.ts
A	ui/src/lib/history.ts
A	ui/src/lib/markdown.ts
A	ui/src/lib/matchup.ts
A	ui/src/lib/models.ts
A	ui/src/lib/names.ts
A	ui/src/lib/opendota.ts
A	ui/src/lib/players.ts
A	ui/src/lib/prompt.ts
A	ui/src/lib/replay.ts
A	ui/src/lib/rich-terms.ts
A	ui/src/lib/roster.ts
A	ui/src/lib/smooth.ts
A	ui/src/lib/stratz.ts
A	ui/src/lib/teamfights.ts
A	ui/src/lib/timeline.ts
A	ui/src/lib/tooltip.ts
```

### 变更统计

```text
.gitignore                         |   12 +-
 README.md                          |    3 +
 memory/ai/changelog.md             |    1 +
 ui/src/App.vue                     |   31 +-
 ui/src/components/MatchCard.vue    |    5 +-
 ui/src/components/TimelineDock.vue |  146 ++++-
 ui/src/lib/chat.ts                 |  121 ++++
 ui/src/lib/config.ts               |  243 ++++++++
 ui/src/lib/heroes.ts               |   53 ++
 ui/src/lib/history.ts              |   59 ++
 ui/src/lib/markdown.ts             |  112 ++++
 ui/src/lib/matchup.ts              |  134 +++++
 ui/src/lib/models.ts               |  184 ++++++
 ui/src/lib/names.ts                |  266 +++++++++
 ui/src/lib/opendota.ts             |  123 ++++
 ui/src/lib/players.ts              |   10 +
 ui/src/lib/prompt.ts               |  586 +++++++++++++++++++
 ui/src/lib/replay.ts               |  188 ++++++
 ui/src/lib/rich-terms.ts           |  234 ++++++++
 ui/src/lib/roster.ts               |   93 +++
 ui/src/lib/smooth.ts               |   52 ++
 ui/src/lib/stratz.ts               |  139 +++++
 ui/src/lib/teamfights.ts           |  410 +++++++++++++
 ui/src/lib/timeline.ts             | 1134 ++++++++++++++++++++++++++++++++++++
 ui/src/lib/tooltip.ts              |   91 +++
 25 files changed, 4401 insertions(+), 29 deletions(-)
```

## 工作区未提交

```text
M  .gitignore
M  README.md
M  memory/ai/changelog.md
 M memory/ai/state.md
M  ui/src/App.vue
M  ui/src/components/MatchCard.vue
M  ui/src/components/TimelineDock.vue
A  ui/src/lib/chat.ts
A  ui/src/lib/config.ts
A  ui/src/lib/heroes.ts
A  ui/src/lib/history.ts
A  ui/src/lib/markdown.ts
A  ui/src/lib/matchup.ts
A  ui/src/lib/models.ts
A  ui/src/lib/names.ts
A  ui/src/lib/opendota.ts
A  ui/src/lib/players.ts
A  ui/src/lib/prompt.ts
A  ui/src/lib/replay.ts
A  ui/src/lib/rich-terms.ts
A  ui/src/lib/roster.ts
A  ui/src/lib/smooth.ts
A  ui/src/lib/stratz.ts
A  ui/src/lib/teamfights.ts
A  ui/src/lib/timeline.ts
A  ui/src/lib/tooltip.ts
```

## 最近提交

```text
9a4f84d (HEAD -> main, origin/main) fix: hide bear inventory outside Druid timelines
b6859d3 fix: show bear inventory when analyzing other heroes
7ceb6af fix: close SSE connections after analysis stop
95a6ac3 docs: fix teamfight screenshot and refresh README
1e97c4f chore(setup): always build latest Clarity
```

---

更完整的上下文见 `context.md`、`decisions.md` 和 `changelog.md`。
