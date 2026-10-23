/**
 * Formats a UTC ISO-8601 timestamp for display in the viewer's time zone.
 * Values without an explicit offset are rejected rather than guessed.
 */
export function formatUtcTimestamp(isoUtc: string, locale = 'en', timeZone?: string): string {
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(isoUtc)) {
    throw new RangeError(`Timestamp must include a UTC offset: ${isoUtc}`);
  }
  const date = new Date(isoUtc);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid timestamp: ${isoUtc}`);
  }
  // dateStyle/timeStyle cannot be combined with timeZoneName, so the fields are listed explicitly.
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone,
    timeZoneName: 'short',
  }).format(date);
}

/** Converts a `datetime-local` value (viewer's time zone) to a UTC ISO timestamp; empty or invalid gives `null`. */
export function localInputToUtc(value: string): string | null {
  if (value === '') {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
