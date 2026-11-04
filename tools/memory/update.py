"""Generate memory/ai/state.md before a commit.

Run from .githooks/pre-commit. It reads git metadata only; does not call the
network or touch application files.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime


ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATE = os.path.join(ROOT, "memory", "ai", "state.md")


def git(*args: str) -> str:
    try:
        out = subprocess.run(
            ["git", "-C", ROOT, *args],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=20,
        )
        return out.stdout.decode("utf-8", errors="replace").strip()
    except Exception:
        return ""


def short_list(text: str, limit: int = 80) -> list[str]:
    lines = [line for line in text.splitlines() if line.strip()]
    if len(lines) > limit:
        lines = lines[:limit] + ["…（其余 %d 行省略）" % (len(lines) - limit)]
    return lines


def project_version() -> str:
    path = os.path.join(ROOT, "ui", "package.json")
    try:
        with open(path, encoding="utf-8") as handle:
            return str(json.load(handle).get("version") or "未知")
    except Exception:
        return "未知"


def build_state() -> str:
    now = datetime.now().astimezone().isoformat(timespec="seconds")
    branch = git("branch", "--show-current") or "（detached 或尚无提交）"
    staged = git("diff", "--cached", "--name-status", "--", ".", ":!memory/ai/state.md")
    stat = git("diff", "--cached", "--stat", "--", ".", ":!memory/ai/state.md")
    worktree = git("status", "--porcelain=v1", "--untracked-files=normal")
    recent = git("log", "-5", "--oneline", "--decorate=short")

    lines = [
        "# AI 状态快照",
        "",
        "> 由 `.githooks/pre-commit` 调用 `tools/memory/update.py` 自动生成；请勿手改。",
        "",
        f"- 更新时间：{now}",
        f"- 分支：{branch}",
        f"- 项目版本：{project_version()}",
        "",
        "## 本次提交（暂存）",
        "",
    ]
    staged_lines = short_list(staged)
    lines.extend(["```text", *staged_lines, "```"] if staged_lines else ["（无暂存文件）"])
    lines += ["", "### 变更统计", ""]
    stat_lines = short_list(stat, 40)
    lines.extend(["```text", *stat_lines, "```"] if stat_lines else ["（无）"])
    lines += ["", "## 工作区未提交", ""]
    worktree_lines = short_list(worktree)
    lines.extend(["```text", *worktree_lines, "```"] if worktree_lines else ["（干净）"])
    lines += ["", "## 最近提交", ""]
    recent_lines = short_list(recent, 8)
    lines.extend(["```text", *recent_lines, "```"] if recent_lines else ["（暂无提交）"])
    lines += [
        "",
        "---",
        "",
        "更完整的上下文见 `context.md`、`decisions.md` 和 `changelog.md`。",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    if not os.path.isdir(os.path.join(ROOT, ".git")):
        print("memory: 当前目录不是 Git 仓库，无法生成提交快照", file=sys.stderr)
        return 1
    if "--check" in sys.argv:
        if not os.path.isfile(STATE) or os.path.getsize(STATE) == 0:
            print("memory: memory/ai/state.md 不存在或为空", file=sys.stderr)
            return 1
        return 0
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    with open(STATE, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(build_state())
    print("memory: 已更新 memory/ai/state.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
