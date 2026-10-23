import { describe, expect, it } from 'vitest';
import { formatUtcTimestamp, localInputToUtc } from './dateTime';

describe('formatUtcTimestamp', () => {
  it('converts UTC to the requested time zone, including across DST', () => {
    // 2026-10-25 01:30 UTC is after the Europe/Amsterdam switch from CEST to CET.
    const before = formatUtcTimestamp('2026-10-24T23:30:00Z', 'en-GB', 'Europe/Amsterdam');
    const after = formatUtcTimestamp('2026-10-25T01:30:00Z', 'en-GB', 'Europe/Amsterdam');

    expect(before).toContain('01:30:00');
    expect(after).toContain('02:30:00');
    expect(before).not.toEqual(after);
  });

  it.each(['2026-10-01T00:00:00', 'not-a-date', '2026-13-45T00:00:00Z'])('rejects %s', (value) => {
    expect(() => formatUtcTimestamp(value)).toThrow(RangeError);
  });
});

describe('localInputToUtc', () => {
  it('converts a local date-time input to UTC', () => {
    expect(localInputToUtc('2026-10-22T10:00')).toBe(new Date(2026, 9, 22, 10, 0).toISOString());
  });

  it('gives null for an empty or invalid input', () => {
    expect(localInputToUtc('')).toBeNull();
    expect(localInputToUtc('not-a-date')).toBeNull();
  });
});
