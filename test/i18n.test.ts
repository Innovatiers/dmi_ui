import { describe, expect, it } from 'vitest';
import en from '../src/i18n/locales/en.json';
import { MODULES } from '../src/modules';

function leafValues(node: unknown, path = ''): [string, unknown][] {
  if (typeof node === 'object' && node !== null) {
    return Object.entries(node).flatMap(([key, value]) => leafValues(value, path ? `${path}.${key}` : key));
  }
  return [[path, node]];
}

describe('en translation bundle', () => {
  it('has a label for every module', () => {
    for (const module of MODULES) {
      expect(en.modules).toHaveProperty(module.id);
    }
  });

  it('has no empty or non-string values', () => {
    const invalid = leafValues(en).filter(([, value]) => typeof value !== 'string' || value.trim() === '');
    expect(invalid).toEqual([]);
  });
});
