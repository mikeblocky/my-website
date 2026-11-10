import test from 'node:test';
import assert from 'node:assert/strict';
import { formatWorldClock } from '../apps/web-sveltekit/src/lib/world-clock.ts';

test('the same instant displays the correct local date and time across midnight', () => {
  const instant = new Date('2026-11-11T00:30:00Z');
  for (const [zone, time, date] of [
    ['America/New_York', '19:30:00', '2026-11-10'],
    ['Europe/Stockholm', '01:30:00', '2026-11-11'],
    ['Asia/Tokyo', '09:30:00', '2026-11-11'],
    ['Asia/Bangkok', '07:30:00', '2026-11-11']
  ]) {
    const clock = formatWorldClock(instant, zone);
    assert.equal(clock.time, time); assert.equal(clock.dateKey, date);
    assert.equal(clock.iso, instant.toISOString());
  }
});

test('New York and Sweden follow daylight saving time without fixed offsets', () => {
  const summer = new Date('2026-07-01T12:00:00Z');
  const winter = new Date('2026-11-11T12:00:00Z');
  assert.equal(formatWorldClock(summer, 'America/New_York').time, '08:00:00');
  assert.equal(formatWorldClock(winter, 'America/New_York').time, '07:00:00');
  assert.equal(formatWorldClock(summer, 'Europe/Stockholm').time, '14:00:00');
  assert.equal(formatWorldClock(winter, 'Europe/Stockholm').time, '13:00:00');
});

test('midnight uses 00 rather than 24', () => {
  assert.equal(formatWorldClock(new Date('2026-11-11T00:00:00Z'), 'UTC').time, '00:00:00');
});
