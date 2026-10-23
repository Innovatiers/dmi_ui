/** Shown instead of a value that looks like a credential. */
export const MASK = '••••••';

/** Field names that may carry a secret or a secret reference; their values are never shown. */
const SENSITIVE_KEY = /secret|password|passwd|token|credential|api[-_]?key|private[-_]?key|connection[-_]?string/i;

function maskValue(key: string | null, value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => maskValue(key, item));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([name, inner]) => [name, maskValue(name, inner)]));
  }
  if (key !== null && SENSITIVE_KEY.test(key) && (typeof value === 'string' || typeof value === 'number')) {
    return MASK;
  }
  return value;
}

/**
 * Formats the old or new state of an audit event (JSON text) for display, masking every value whose field name looks
 * like a credential. The API masks these already; this is a second line of defence so that a secret or a secret
 * reference never reaches the screen. Text that is not JSON is not shown at all.
 */
export function formatMaskedState(state: string | null | undefined): string | null {
  if (state === null || state === undefined || state.trim() === '') {
    return null;
  }
  try {
    return JSON.stringify(maskValue(null, JSON.parse(state) as unknown), null, 2);
  } catch {
    return MASK;
  }
}
