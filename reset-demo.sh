#!/usr/bin/env bash
# Between-sessions reset for the Advanced workshop (ticket-to-merged arc).
# Restores everything the three demos mutate. The demos run in order
# WITHOUT this between them; only run it to start a fresh session.
set -euo pipefail
cd "$(dirname "$0")"

# Brace-wrapped so bash parses the whole script before running any of it
# (git checkout below rewrites this very file when branches diverge).
{

# Demos end on an sb-* branch; reset means main, discarding demo edits
git checkout -f main >/dev/null 2>&1 || true

cp .reset-snapshots/schedule.js     lib/schedule.js   # Foundations bug state...
sed -i '' 's/Math.ceil/Math.floor/' lib/schedule.js   # ...with its fix applied (Advanced starts post-Foundations, tests green)
cp .reset-snapshots/pages.js        lib/pages.js      # un-reconcile pages
cp .reset-snapshots/CLAUDE-filled.md CLAUDE.md        # Advanced starts BRIEFED (causality + policy)
rm -rf .reconcile-history/                            # clear /reconcile snapshots
rm -rf specs/                                         # /intake writes specs/SB-*.md
rm -f  lib/diff.js lib/report.js                      # SB-47 / SB-54 implementations
rm -f  test/diff.test.js test/report.test.js          # their test files
rm -f  .mcp.json                                      # Demo 3 wires the tracker live (project scope)

# Demo 1 downloads the public skill-creator live, then builds the intake
# skill with it; the session starts WITHOUT both. Canonical intake copy:
# .reset-snapshots/intake-SKILL.md (recovery: cp it to
# .claude/skills/intake/SKILL.md if the live build goes off-script).
# Local mirror of skill-creator (download recovery): ~/demos/.skill-creator-backup
rm -rf .claude/skills/intake
rm -rf .claude/skills/skill-creator
# /reconcile is pre-existing and STAYS (SB-51's worker uses it in Demo 2).

# Demo 2 worker branches + worktrees (prune metadata AND the dirs).
# Trailing || true: under pipefail, grep exits 1 when there are no extra
# worktrees, which must not abort the reset.
git worktree list --porcelain 2>/dev/null | awk '/^worktree /{print $2}' | grep -v "^$(pwd)$" | while read -r wt; do
  git worktree remove --force "$wt" >/dev/null 2>&1 || true
done || true
rm -rf .claude/worktrees
git worktree prune >/dev/null 2>&1 || true
git branch --list 'sb-*' | tr -d ' *' | while read -r b; do
  [ -n "$b" ] && git branch -D "$b" >/dev/null 2>&1 || true
done

echo "reset: lib + CLAUDE.md restored · history/specs/diff/report cleared · .mcp.json removed · intake + skill-creator skills removed (Demo 1 downloads + builds them) · sb-* branches pruned"
exit 0
}
