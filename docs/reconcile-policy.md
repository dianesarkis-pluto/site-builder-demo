# Reconcile policy

A page "drifts" when its draft revision diverges from what's published.
Reconciling syncs the two, but only within guardrails.

## Drift thresholds

- **≤ 5%** — routine. `/reconcile` snapshots, applies the sync, re-runs
  tests. This is the common case: copy tweaks, price updates, caption edits.
- **> 5%** — manual review. The draft is a substantive rewrite. Do not
  auto-publish. Flag it for the page owner.

Drift is measured from the published reference, not from the previous draft.

## The snapshot rule

Every sync writes the pre-sync state to `.reconcile-history/` first. No
exceptions. This is the only recovery path if a draft gets published wrong.

In February we overwrote the PG-0118 hero by syncing a draft directly, with
no snapshot. The published copy was gone before anyone noticed the draft was
the wrong one. Three hours of the pricing page showed the wrong plan. Hence
the rule.

## Minimum signal

A drift estimate needs at least 24 hours of edit history (`firstEditAt` to
`lastEditAt` on the page record). Under that window the estimate is noise:
do not sync, say why, and stop.

If `publishedRev` already equals `draftRev` the page is reconciled. There
is nothing to do; say so rather than re-applying.

## One page per run

Reconcile one page at a time. Batching hides which page broke a test.
