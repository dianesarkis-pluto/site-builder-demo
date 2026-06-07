import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Per-page reconcile history for the weekly content report. /reconcile writes
// one snapshot per sync to `.reconcile-history/<pageId>-<iso-timestamp>.json`,
// shaped `{ pageId, previousPublishedRev, draftRev, driftPct, edits }`. The
// reconcile time is not a body field — it lives in the filename — so `when` is
// recovered from the name and `driftCorrected` is the snapshot's `driftPct`.
//
// Read-only: this never imports or touches the publish/sync path.

// Default history location, resolved relative to this module so the lookup
// works regardless of process cwd — the same path /reconcile writes to.
const HISTORY_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  ".reconcile-history",
);

// Recover the ISO timestamp from `<pageId>-<iso-timestamp>.json`. Both the
// page id and the timestamp contain dashes, so split on the known pageId
// prefix rather than guessing where the id ends.
function whenFromFilename(filename, pageId) {
  return filename.slice(pageId.length + 1, -".json".length);
}

// Returns `{pageId, when, driftCorrected}` per page that has reconcile history,
// keeping the most recent snapshot per page and sorting rows by pageId. A
// missing history directory yields an empty report rather than throwing.
export function reconcileReport(historyDir = HISTORY_DIR) {
  let files;
  try {
    files = readdirSync(historyDir);
  } catch (err) {
    if (err.code === "ENOENT") return []; // no history dir → nothing reconciled
    throw err;
  }

  const latest = new Map(); // pageId → newest entry seen
  for (const filename of files) {
    if (!filename.endsWith(".json")) continue; // ignore non-snapshot files
    const snapshot = JSON.parse(
      readFileSync(join(historyDir, filename), "utf8"),
    );
    const entry = {
      pageId: snapshot.pageId,
      when: whenFromFilename(filename, snapshot.pageId),
      driftCorrected: snapshot.driftPct,
    };
    const seen = latest.get(entry.pageId);
    // ISO-8601 timestamps sort correctly as plain strings.
    if (!seen || entry.when > seen.when) latest.set(entry.pageId, entry);
  }

  return [...latest.values()].sort((a, b) => a.pageId.localeCompare(b.pageId));
}
