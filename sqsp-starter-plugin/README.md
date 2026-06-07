# sqsp-starter

The workshop's artifacts, packaged as one install. A fresh clone gets:

| Piece | What it does |
|---|---|
| `skills/reconcile/` | `/reconcile <pageId>`: the codified drift-sync procedure (Demo 1) |
| `skills/intake/` | `/intake`: ticket to verified implementation; spec, failing tests, smallest green diff |
| `skills/new-skill/` | `/new-skill`: interview scaffolder that writes your NEXT skill with the same anatomy |
| `hooks/` | Pre-edit guardrail: blocks direct writes to `data/*-edits.json`, points at `/reconcile` |
| `.mcp.json` + `servers/` | The team tracker MCP server (`list_tickets`, `get_ticket`) |
| `data/tickets.json` | Bundled demo tickets (SB-42, SB-47, SB-51) |

Install (from the repo root of any clone):

```
claude plugin install ./sqsp-starter-plugin
```

Then in a session: `/reconcile PG-0203`, or "pull ticket SB-47 from the
tracker and plan the fix."

Variants with the same anatomy: a daily briefing (GitHub + JIRA + Slack +
meeting notes, on a schedule), a ticket updater (writes back what you worked
on), a sandbox policy plugin (ship `settings.json` permission + sandbox
rules to every machine).
