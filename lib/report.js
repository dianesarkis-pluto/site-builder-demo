// Content report: per-page reconcile history. Reads the snapshots /reconcile
// writes to .reconcile-history/ (filename `<pageId>-<when>.json`) and reports,
// per page, when it was last reconciled and what drift was corrected. This is
// read-only — it never touches the publish path.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { listPages } from "./pages.js";

const HISTORY_DIR = ".reconcile-history";

// `when` lives in the snapshot filename, not its body: PG-0042-<iso>.json.
function whenFromFilename(file, pageId) {
  return file.slice(pageId.length + 1, -".json".length);
}

// One row per registry page: { pageId, when, driftCorrected }. `when` is the
// latest reconcile timestamp; `driftCorrected` the drift that reconcile fixed,
// passed through at full precision. Pages with no snapshot are listed as never
// reconciled (when/driftCorrected null). A missing history dir yields [].
export function reconcileReport(dir = HISTORY_DIR) {
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }

  // latest snapshot per page (ISO timestamps sort lexically)
  const latest = new Map();
  for (const file of files) {
    const snap = JSON.parse(readFileSync(join(dir, file), "utf8"));
    const when = whenFromFilename(file, snap.pageId);
    const prev = latest.get(snap.pageId);
    if (!prev || when > prev.when) {
      latest.set(snap.pageId, { when, driftCorrected: snap.driftPct });
    }
  }

  return listPages().map((p) => {
    const rec = latest.get(p.id);
    return {
      pageId: p.id,
      when: rec ? rec.when : null,
      driftCorrected: rec ? rec.driftCorrected : null,
    };
  });
}
