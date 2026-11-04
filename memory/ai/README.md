# AI 记忆库

这个目录用于在多设备、多个 AI 会话之间同步项目上下文。开始任何任务前先读：

1. `context.md` — 项目结构、命令、运行约束
2. `decisions.md` — 已经确定的设计决策与原因
3. `state.md` — 最近一次提交的自动快照（由 Git hook 生成）
4. `changelog.md` — 人工维护的近期变更与待办

## 自动更新

仓库使用 `.githooks/pre-commit`：

- 每次 `git commit` 前运行 `tools/memory/update.py`；
- 把当前分支、暂存文件、变更统计写入 `memory/ai/state.md`；
- 自动 `git add memory/ai/state.md`，使快照进入本次提交；
- 推到远端后，其他设备拉取即可看到最新的 AI 记忆。

`pre-push` 只检查当前 `HEAD` 是否包含 `memory/ai/state.md`，防止有人用 `--no-verify` 跳过记忆更新。

Hook 优先使用仓库内的 `runtime/python/python.exe`；没有时回退 `python3` / `python`。

## 首次启用（每台设备一次）

在项目根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File tools/memory/install.ps1
```

脚本会：

- 检查/初始化 Git 仓库（需要时加 `-Init`）；
- 设置 `git config core.hooksPath .githooks`；
- 校验 hook 可执行。

如果项目尚未初始化 Git：

```powershell
powershell -ExecutionPolicy Bypass -File tools/memory/install.ps1 -Init
```

## 人工维护

- 新功能/修复完成后，在 `changelog.md` 顶部追加一条（日期 + 模块 + 结果）；
- 影响架构或长期行为的决定写进 `decisions.md`；
- 不要把 API Key、Token、账号密码写进记忆库；
- `state.md` 是自动生成文件，不要手改。
