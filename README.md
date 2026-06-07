# site-builder

A small website content-management service — pages, content blocks, scheduled
publishing, and draft/published reconciliation. Used for a Claude Code
workshop; runs with zero setup.

```bash
npm test      # node --test — one test is failing on purpose (Demo 1)
```

- `lib/schedule.js` — scheduled-publish duration math
- `lib/pages.js` — page registry + draft/published state
- `lib/blocks.js` — content-block tree operations
- `.claude/skills/reconcile/` — the `/reconcile <page-id>` skill
- `data/` — per-page edit windows
- `reset-demo.sh` — restore demo-start state between sessions

No dependencies. Node 18+.
