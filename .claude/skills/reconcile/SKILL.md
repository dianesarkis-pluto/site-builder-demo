---
name: reconcile
description: Reconcile a page's draft against its published revision. Snapshots before mutating, enforces the 5% drift cap, and prints a before/after summary. Use this instead of editing pages.js by hand — see the Feb PG-0118 incident.
---

# /reconcile <page-id>

The argument is a page ID like `PG-0042`. If none is given, ask which page.

## Preconditions — check these BEFORE doing anything

- The page exists in `lib/pages.js` `PAGES[]` (grep for the ID).
- At least 24h of edit history is available. Check `firstEditAt` vs
  `lastEditAt` on the page record — if the span is under 24h, stop and say
  so. A short window means the drift estimate is noise.
- The page is not already reconciled. If `publishedRev === draftRev`
  (`isReconciled()`), there is nothing to sync — say so and stop.

## Steps

1. **Pull the edits.** Read `data/<page-id>-edits.json`. It contains the
   recent edit window: `{ pageId, publishedRev, draftRev, publishedRef,
   edits: [...] }`. Each edit is `{ ts, rev, blockId, field, from, to }`.

2. **Compute drift.** Drift is how far the draft diverged from the published
   reference, as a percentage. The `driftPct` field is the measured value;
   sanity-check it against the edit volume (more block/field changes → more
   drift).

3. **Check the 5% cap.** If `driftPct > 5`, **do not sync.** Drift that
   large means the draft is a substantive rewrite, not a routine edit.
   Print the drift, flag the page for manual review, and stop. Software
   shouldn't silently publish a rewrite.

4. **Snapshot first.** Before touching anything, write the current state to
   `.reconcile-history/<page-id>-<iso-timestamp>.json` containing
   `{ pageId, previousPublishedRev, draftRev, driftPct, edits: [...] }`.
   This is the recovery path if the sync turns out wrong. Create the
   directory if it doesn't exist.

5. **Apply the sync.** Edit `lib/pages.js` — set the page's `publishedRev`
   to its `draftRev` and add a `syncedAt` timestamp. After this,
   `isReconciled()` returns true for the page.

6. **Verify.** Run `npm test`. Reconciling shouldn't touch the schedule
   arithmetic, so the suite should be unchanged. If anything broke, revert
   from the snapshot and report what failed.

7. **Summarize.** Print a one-screen before/after:
   ```
   PG-0042 · home
     drift:         +1.5% (within 5% cap)
     published:     r41 → r47
     snapshot:      .reconcile-history/PG-0042-2026-04-01T10:15:00Z.json
     tests:         passing
   ```

## Constraints

- **NEVER** skip step 4. The snapshot is the only recovery path. We
  overwrote the PG-0118 hero in February because someone synced a draft
  directly and the published copy was gone before anyone noticed the draft
  was wrong.
- One page per invocation. Don't batch-reconcile — if step 6 fails you want
  to know which page caused it.
- Drift over the cap is a human decision, never an automatic sync.

## References

- @lib/pages.js — page registry, `isReconciled()` / `applySync()`
- @lib/blocks.js — block-tree operations
- @docs/reconcile-policy.md — drift thresholds and the snapshot rule
