import { test } from "node:test";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { reconcileReport } from "../lib/report.js";
import { listPages } from "../lib/pages.js";

const FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "reconcile-history",
);

// AC1 + AC3: reads .reconcile-history/ (fixture snapshots), one row per page,
// latest reconcile wins, drift passed through at full precision, pages with no
// snapshot listed as never reconciled.
test("reconcileReport returns {pageId, when, driftCorrected} per page from fixtures", () => {
  const report = reconcileReport(FIXTURES);
  const byId = Object.fromEntries(report.map((r) => [r.pageId, r]));

  // one row per registry page
  assert.equal(report.length, listPages().length);

  // PG-0042 has two snapshots — the later one wins, drift unrounded
  assert.deepEqual(byId["PG-0042"], {
    pageId: "PG-0042",
    when: "2026-06-04T14:22:00Z",
    driftCorrected: 1.5,
  });
  // PG-0203 single snapshot
  assert.deepEqual(byId["PG-0203"], {
    pageId: "PG-0203",
    when: "2026-05-20T08:00:00Z",
    driftCorrected: 8.2,
  });
  // never reconciled → listed as such
  assert.deepEqual(byId["PG-0118"], {
    pageId: "PG-0118",
    when: null,
    driftCorrected: null,
  });
});

// AC2: missing directory → empty report, no throw.
test("reconcileReport on a missing history directory returns [] without throwing", () => {
  assert.deepEqual(reconcileReport(join(FIXTURES, "does-not-exist")), []);
});

// AC4: read-only — building a report does not mutate the page registry / publish path.
test("reconcileReport does not change publish-path state", () => {
  const before = listPages();
  reconcileReport(FIXTURES);
  assert.deepEqual(listPages(), before);
});
