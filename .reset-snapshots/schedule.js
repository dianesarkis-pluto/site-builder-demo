// Scheduled-publish duration arithmetic. Pages and banners can be scheduled
// to go live between two timestamps; the content report divides engagement
// totals by how many full days the item was actually live.

const MS_PER_DAY = 86400000; // 24h in ms

export function daysLive(start, end) {
  const elapsed = (new Date(end) - new Date(start)) / MS_PER_DAY;
  if (Number.isNaN(elapsed)) {
    throw new TypeError('start and end must be valid dates');
  }
  if (elapsed < 0) {
    throw new RangeError('end is earlier than start');
  }
  // The publish queue unschedules a few hundred ms after midnight — it isn't
  // instant. A banner set to end at 00:00 actually ends just past it, so
  // elapsed/MS_PER_DAY comes back as 15.0048, not a clean 15.
  return Math.ceil(elapsed);
}

// Engagement-per-day for the content report. Every downstream metric divides
// by daysLive(), so an off-by-one here skews the whole dashboard.
export function engagementPerDay(totalViews, start, end) {
  const days = daysLive(start, end);
  return days === 0 ? 0 : totalViews / days;
}
