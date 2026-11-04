# AGENTS.md

This project keeps its AI development memory in `memory/ai/`.

Before starting a task:

1. Read `memory/ai/context.md` for architecture, commands, and constraints.
2. Read `memory/ai/decisions.md` for settled design choices.
3. Read `memory/ai/state.md` and `memory/ai/changelog.md` for recent work.

When finishing a feature or fix:

- Append a short entry to `memory/ai/changelog.md` (date + area + result).
- Record long-lived architecture decisions in `memory/ai/decisions.md`.
- Keep `memory/ai/context.md` current if commands/paths/architecture change.
- Never write API keys, tokens, passwords, or personal data into `memory/`.

Git automation:

- `.githooks/pre-commit` runs `tools/memory/update.py` and stages `memory/ai/state.md`.
- `.githooks/pre-push` checks that the pushed HEAD contains `memory/ai/state.md`.
- Enable hooks on a new device with `powershell -File tools/memory/install.ps1`.
- Hooks are configured with `git config core.hooksPath .githooks` (tracked in this repo).
