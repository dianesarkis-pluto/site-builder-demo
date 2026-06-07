# site-builder

## What the code can't tell you

The publish queue unschedules a few hundred ms after midnight — it isn't
instant. A banner set to end at 00:00 actually ends just past it, so
`elapsed / MS_PER_DAY` comes back as 15.0048, not a clean 15. Floor it,
don't ceil — the extra fractional day is queue latency, not a real day live.

A page carries two revisions: `publishedRev` (what visitors see) and
`draftRev` (in-progress edits). When they diverge the page has "drifted."

## Rules

- NEVER sync a draft to published without snapshotting first. Use
  `/reconcile` — it writes `.reconcile-history/` before touching anything.
  We overwrote the PG-0118 hero in February skipping that step.
- Drift > 5% is a manual review, not a code fix. See docs/reconcile-policy.md.
- Don't round the day count or the drift — store full precision.

## Who to ask

- Render pipeline / blocks: #site-platform
- Publish queue latency: @priya.n
- Reconcile policy: @content-ops
