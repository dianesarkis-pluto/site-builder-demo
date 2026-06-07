#!/usr/bin/env bash
# Between-sessions reset for the Advanced workshop (ticket-to-merged arc).
# Restores everything the three demos mutate. The demos run in order
# WITHOUT this between them; only run it to start a fresh session.
set -euo pipefail
cd "$(dirname "$0")"

cp .reset-snapshots/schedule.js     lib/schedule.js   # bug state; preflight sed re-applies the fix
cp .reset-snapshots/pages.js        lib/pages.js      # un-reconcile pages
cp .reset-snapshots/CLAUDE-filled.md CLAUDE.md        # Advanced starts BRIEFED (causality + policy)
rm -rf .reconcile-history/                            # clear /reconcile snapshots
rm -rf specs/                                         # /intake writes specs/SB-*.md
rm -f  lib/diff.js lib/report.js                      # SB-47 / SB-54 implementations
rm -f  .mcp.json                                      # Demo 3 wires the tracker live (project scope)

# Demo 1 builds the intake skill live with /new-skill; the session starts
# WITHOUT it. Canonical copy: .reset-snapshots/intake-SKILL.md (recovery:
# cp it to .claude/skills/intake/SKILL.md if the live build goes off-script).
rm -rf .claude/skills/intake
# /reconcile and /new-skill are pre-existing and STAY (SB-51's worker uses
# /reconcile in Demo 2; /new-skill is Demo 1's builder).

# Demo 2 worker branches + worktrees
git worktree prune >/dev/null 2>&1 || true
git branch --list 'sb-*' | tr -d ' *' | while read -r b; do
  [ -n "$b" ] && git branch -D "$b" >/dev/null 2>&1 || true
done

echo "reset: lib + CLAUDE.md restored · history/specs/diff/report cleared · .mcp.json removed · intake skill removed (Demo 1 builds it) · sb-* branches pruned"
