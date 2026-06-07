// Static page registry + draft/published state. In a real system pages live
// in a database and edits stream in from the content editor. A page carries a
// published revision (what visitors see) and a draft revision (in-progress
// edits). When the two diverge, the page has "drifted" and needs reconciling.
//
// /reconcile writes to this file — it sets a page's `publishedRev` to its
// `draftRev` and stamps `syncedAt`. The Demo-7 fixer checks `isReconciled()`
// to skip pages already synced.

export const PAGES = [
  // PG-0042 is the Demo-3 /reconcile target. ~1.5% drift — under the 5% cap,
  // so reconcile proceeds. Backdated >24h so the skill's history precondition
  // holds. After Demo 3, publishedRev === draftRev and this page is synced.
  { id: 'PG-0042', slug: 'home', title: 'Homepage',
    publishedRev: 'r41', draftRev: 'r47', blockCount: 12,
    firstEditAt: '2026-03-30T09:00:00.000Z', lastEditAt: '2026-03-31T16:20:00.000Z' },

  // PG-0118 is the Demo-7 audit target. ~3.7% drift — worse than PG-0042 but
  // still under cap. The auditor lists it; the fixer reconciles it.
  { id: 'PG-0118', slug: 'pricing', title: 'Pricing',
    publishedRev: 'r88', draftRev: 'r95', blockCount: 9,
    firstEditAt: '2026-03-30T11:00:00.000Z', lastEditAt: '2026-03-31T15:05:00.000Z' },

  // PG-0203 is the Demo-5 "stale content" page. ~8.2% drift — OVER the 5% cap,
  // so /reconcile must refuse and flag for manual review, not auto-sync.
  { id: 'PG-0203', slug: 'blog/spring-sale', title: 'Spring Sale',
    publishedRev: 'r12', draftRev: 'r31', blockCount: 7,
    firstEditAt: '2026-03-29T08:00:00.000Z', lastEditAt: '2026-03-31T19:40:00.000Z' },

  // Pages with no divergence — already in sync, nothing to reconcile.
  { id: 'PG-0067', slug: 'about', title: 'About',
    publishedRev: 'r20', draftRev: 'r20', blockCount: 5,
    firstEditAt: '2026-03-20T10:00:00.000Z', lastEditAt: '2026-03-20T10:00:00.000Z' },
  { id: 'PG-0310', slug: 'contact', title: 'Contact',
    publishedRev: 'r4', draftRev: 'r4', blockCount: 3,
    firstEditAt: '2026-03-18T14:00:00.000Z', lastEditAt: '2026-03-18T14:00:00.000Z' },
];

export function getPage(id) {
  const page = PAGES.find((p) => p.id === id);
  if (!page) throw new RangeError(`unknown page: ${id}`);
  return { ...page };
}

export function listPages() {
  return PAGES.map((p) => ({ ...p }));
}

// A page is reconciled when its published revision matches its draft.
export function isReconciled(page) {
  return page.publishedRev === page.draftRev;
}

// Apply a draft→published sync to a page object. Pure: returns a new object,
// does not mutate the registry. /reconcile persists the result by editing the
// PAGES entry above.
export function applySync(page) {
  return { ...page, publishedRev: page.draftRev, syncedAt: new Date().toISOString() };
}
