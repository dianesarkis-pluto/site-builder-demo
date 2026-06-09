// Weekly content report: per page, when it was last reconciled and what drift
// was corrected. Read-only — it reads the snapshots /reconcile writes to
// .reconcile-history/ and never touches the publish path.
//
// Snapshot files are named `<pageId>-<when>.json`, where <when> is the ISO
// timestamp of the reconcile run. The drift corrected is the snapshot's
// driftPct, kept at full precision (CLAUDE.md: don't round the drift).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { listPages } from "./pages.js";

// Map each pageId that has snapshots to its newest { when, driftPct }.
function latestSnapshots(historyDir) {
  let files;
  try {
    files = readdirSync(historyDir);
  } catch {
    return null; // directory absent
  }

  const latest = new Map();
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const snap = JSON.parse(readFileSync(join(historyDir, file), "utf8"));
    // Strip the `<pageId>-` prefix and `.json` suffix to recover <when>.
    const when = file.slice(snap.pageId.length + 1, -".json".length);
    const prev = latest.get(snap.pageId);
    if (!prev || when > prev.when) {
      latest.set(snap.pageId, { when, driftCorrected: snap.driftPct });
    }
  }
  return latest;
}

// Build the per-page reconcile report. Returns [] (no throw) when historyDir
// is missing; otherwise one { pageId, when, driftCorrected } per page, with
// never-reconciled pages reported as { when: null, driftCorrected: null }.
export function buildReport(historyDir = ".reconcile-history") {
  const latest = latestSnapshots(historyDir);
  if (latest === null) return [];

  return listPages().map((page) => {
    const snap = latest.get(page.id);
    return {
      pageId: page.id,
      when: snap ? snap.when : null,
      driftCorrected: snap ? snap.driftCorrected : null,
    };
  });
}
