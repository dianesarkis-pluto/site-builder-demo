import { test } from 'node:test';
import assert from 'node:assert';
import { daysLive, engagementPerDay } from '../lib/schedule.js';

test('PG-0042: banner scheduled 15 days reports 15 days live', () => {
  // The publish queue unschedules ~417ms after midnight, so the elapsed span
  // is 15.0048 days. Fifteen full days ran — not sixteen.
  const start = '2026-03-01T00:00:00.000Z';
  const end = '2026-03-16T00:00:00.417Z'; // publish-queue latency tail
  assert.equal(daysLive(start, end), 15);
});

test('zero elapsed → 0 days', () => {
  const t = '2026-03-01T00:00:00.000Z';
  assert.equal(daysLive(t, t), 0);
});

test('exact 1-day boundary → 1 day', () => {
  const start = '2026-03-01T00:00:00.000Z';
  const end = '2026-03-02T00:00:00.000Z';
  assert.equal(daysLive(start, end), 1);
});

test('negative span throws RangeError', () => {
  assert.throws(
    () => daysLive('2026-03-16T00:00:00.000Z', '2026-03-01T00:00:00.000Z'),
    RangeError,
  );
});

test('engagementPerDay divides by the real day count', () => {
  // 30000 views over the 15-day run → 2000/day, not 1875 (which is /16).
  const start = '2026-03-01T00:00:00.000Z';
  const end = '2026-03-16T00:00:00.417Z';
  assert.equal(engagementPerDay(30000, start, end), 2000);
});
