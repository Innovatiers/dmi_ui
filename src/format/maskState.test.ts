import { describe, expect, it } from 'vitest';
import { MASK, formatMaskedState } from './maskState';

describe('formatMaskedState', () => {
  it('keeps ordinary fields and masks credential-like fields at any depth', () => {
    const state = JSON.stringify({
      displayName: 'Plant A',
      credentialRef: 'openbao://tenant-a/anylog',
      settings: { apiKey: 'abc123', password: 'p', timeoutSeconds: 15 },
      tokens: ['t1', 't2'],
      hasCredentialRef: true,
    });

    const shown = formatMaskedState(state) ?? '';

    expect(shown).toContain('Plant A');
    expect(shown).toContain('"timeoutSeconds": 15');
    expect(shown).toContain('"hasCredentialRef": true');
    expect(shown).not.toContain('openbao://');
    expect(shown).not.toContain('abc123');
    expect(shown).not.toContain('"p"');
    expect(shown).not.toContain('t1');
    expect(shown.split(MASK)).toHaveLength(6);
  });

  it('keeps a value the API already masked masked', () => {
    expect(formatMaskedState('{"secretRef":"***"}')).toContain(MASK);
  });

  it('shows nothing for an empty state and masks text that is not JSON', () => {
    expect(formatMaskedState(null)).toBeNull();
    expect(formatMaskedState('')).toBeNull();
    expect(formatMaskedState('password=hunter2')).toBe(MASK);
  });
});
