# AI 状态快照

> 由 `.githooks/pre-commit` 调用 `tools/memory/update.py` 自动生成；请勿手改。

- 更新时间：2026-11-09T12:23:10+08:00
- 分支：main
- 项目版本：0.1.0

## 本次提交（暂存）

```text
M	README.md
M	memory/ai/changelog.md
M	memory/ai/decisions.md
M	server.py
M	ui/src/App.vue
M	ui/src/components/SettingsView.vue
M	ui/src/lib/chat.ts
M	ui/src/lib/config.ts
M	ui/src/lib/models.ts
```

### 变更统计

```text
README.md                          |  10 ++
 memory/ai/changelog.md             |   1 +
 memory/ai/decisions.md             |   4 +-
 server.py                          | 194 ++++++++++++++++++++++++----
 ui/src/App.vue                     |   1 +
 ui/src/components/SettingsView.vue | 252 +++++++++++++++++++++++++++++++------
 ui/src/lib/chat.ts                 |   2 +
 ui/src/lib/config.ts               |  27 +++-
 ui/src/lib/models.ts               |  58 +++++++--
 9 files changed, 475 insertions(+), 74 deletions(-)
```

## 工作区未提交

```text
M  README.md
M  memory/ai/changelog.md
M  memory/ai/decisions.md
 M memory/ai/state.md
M  server.py
M  ui/src/App.vue
M  ui/src/components/SettingsView.vue
M  ui/src/lib/chat.ts
M  ui/src/lib/config.ts
M  ui/src/lib/models.ts
```

## 最近提交

```text
cfe9292 (HEAD -> main, origin/main) feat: add Xiaomi, OpenAI and custom model providers
68f4aea feat: add DeepSeek official API provider
2961872 build: separate installer and portable artifacts
e5d2c55 perf: enable GPU rendering in Electron desktop
c062c09 fix: make Electron packaged client launch reliably
```

---

更完整的上下文见 `context.md`、`decisions.md` 和 `changelog.md`。
