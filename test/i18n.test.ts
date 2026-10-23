import { describe, expect, it } from 'vitest';
import en from '../src/i18n/locales/en.json';
import { MODULES } from '../src/modules';

function leafValues(node: unknown, path = ''): [string, unknown][] {
  if (typeof node === 'object' && node !== null) {
    return Object.entries(node).flatMap(([key, value]) => leafValues(value, path ? `${path}.${key}` : key));
  }
  return [[path, node]];
}

const leafKeys = new Set(leafValues(en).map(([key]) => key));
const namespaces = new Set(Object.keys(en));

/** Production source files (not tests), as text. */
const sources = Object.entries(
  import.meta.glob<string>(['../src/**/*.{ts,tsx}', '!../src/**/*.test.{ts,tsx}', '!../src/api/generated/**'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
);

/**
 * Literal i18n keys in the sources: the first argument of every `t('…')` call, and every quoted dotted literal whose
 * first segment is a namespace of the bundle (keys chosen in a conditional, e.g. `t(a ? 'x.y' : 'x.z')`). Keys built
 * from a template (`t(\`roles.${name}\`)`) are covered by the tests of their screens.
 */
function literalKeys(source: string): string[] {
  const calls = [...source.matchAll(/\bt\(\s*'([^']+)'/g)].map((match) => match[1] ?? '');
  const dotted = [...source.matchAll(/'([a-zA-Z][\w.]*)'/g)]
    .map((match) => match[1] ?? '')
    .filter((key) => key.includes('.') && namespaces.has(key.split('.')[0] ?? ''));
  return [...new Set([...calls, ...dotted])];
}

function exists(key: string): boolean {
  return leafKeys.has(key) || leafKeys.has(`${key}_one`);
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

  it('has every key the sources use literally', () => {
    expect(sources.length).toBeGreaterThan(20);
    const missing = sources.flatMap(([file, source]) =>
      literalKeys(source)
        .filter((key) => !exists(key))
        .map((key) => `${file}: ${key}`),
    );
    expect(missing).toEqual([]);
  });

  it('detects a missing key', () => {
    expect(literalKeys("t('admin.doesNotExist')").filter((key) => !exists(key))).toEqual(['admin.doesNotExist']);
  });
});
