import { test } from "node:test";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { reconcileReport } from "../lib/report.js";

const FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "reconcile-history",
);

// AC1 + AC3: reads .reconcile-history/ fixtures and returns
// {pageId, when, driftCorrected} per page. PG-0118 has two snapshots, so the
// report keeps only its most recent one (latest `when`). Rows are sorted by
// pageId for a deterministic report.
test("reconcileReport returns {pageId, when, driftCorrected} per page", () => {
  const report = reconcileReport(FIXTURES);
  assert.deepEqual(report, [
    {
      pageId: "PG-0042",
      when: "2026-04-01T10:15:00Z",
      driftCorrected: 1.5,
    },
    {
      pageId: "PG-0118",
      when: "2026-04-05T14:00:00Z", // newer of PG-0118's two snapshots
      driftCorrected: 2.1, // drift from that newer snapshot, not the older 3.7
    },
  ]);
});

// AC2: a missing .reconcile-history/ directory yields an empty report and
// does not throw.
test("reconcileReport yields an empty report when the directory is missing", () => {
  const missing = join(FIXTURES, "does-not-exist");
  let report;
  assert.doesNotThrow(() => {
    report = reconcileReport(missing);
  });
  assert.deepEqual(report, []);
});

// AC4: no change to publish-path behavior — the report is read-only. Calling
// it must not alter the page registry or its publish state.
test("reconcileReport does not touch the publish path", async () => {
  const { listPages } = await import("../lib/pages.js");
  const before = JSON.stringify(listPages());
  reconcileReport(FIXTURES);
  assert.equal(JSON.stringify(listPages()), before);
});
