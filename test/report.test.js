import { test } from "node:test";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildReport } from "../lib/report.js";
import { listPages } from "../lib/pages.js";

const FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "reconcile-history",
);

// Criterion 1 + 3: reads .reconcile-history/ fixtures, returns
// {pageId, when, driftCorrected} per page; newest snapshot wins.
test("buildReport returns when + driftCorrected for reconciled pages", () => {
  const report = buildReport(FIXTURES);
  const byId = Object.fromEntries(report.map((r) => [r.pageId, r]));

  assert.deepEqual(byId["PG-0042"], {
    pageId: "PG-0042",
    when: "2026-06-04T14:22:00Z", // newest of two PG-0042 snapshots
    driftCorrected: 1.5,
  });
  assert.deepEqual(byId["PG-0118"], {
    pageId: "PG-0118",
    when: "2026-06-06T09:45:00Z",
    driftCorrected: 3.7,
  });
});

// Criterion 3 + spec: pages with no snapshot are listed as never reconciled.
test("buildReport lists never-reconciled pages as such", () => {
  const report = buildReport(FIXTURES);
  const byId = Object.fromEntries(report.map((r) => [r.pageId, r]));

  assert.equal(report.length, listPages().length); // one entry per page
  assert.deepEqual(byId["PG-0203"], {
    pageId: "PG-0203",
    when: null,
    driftCorrected: null,
  });
  assert.deepEqual(byId["PG-0067"], {
    pageId: "PG-0067",
    when: null,
    driftCorrected: null,
  });
});

// Criterion 2: missing .reconcile-history/ directory → empty report, no throw.
test("buildReport returns [] when the history directory is absent", () => {
  let report;
  assert.doesNotThrow(() => {
    report = buildReport(join(FIXTURES, "does-not-exist"));
  });
  assert.deepEqual(report, []);
});

// Criterion 4: read-only — building the report does not touch publish-path state.
test("buildReport does not change publish-path state", () => {
  const before = listPages();
  buildReport(FIXTURES);
  assert.deepEqual(listPages(), before); // publishedRev/draftRev untouched
});
