import { describe, expect, it } from 'vitest';
import ciWorkflow from '../.github/workflows/ci.yml?raw';

const workflows: Record<string, string> = {
  ...import.meta.glob<string>('../.github/workflows/*.{yml,yaml}', { eager: true, query: '?raw', import: 'default' }),
  // Explicit import as well, so the test cannot pass vacuously when the glob finds nothing.
  '../.github/workflows/ci.yml': ciWorkflow,
};

function actionReferences(source: string): string[] {
  return [...source.matchAll(/^[ \t-]*uses:[ \t]*(\S+)/gm)].map((match) => match[1] ?? '');
}

describe('CI workflows', () => {
  it('reference third-party actions only by full commit SHA', () => {
    const unpinned = Object.entries(workflows).flatMap(([file, source]) =>
      actionReferences(source)
        .filter((reference) => !reference.startsWith('./') && !/^[^@\s]+@[0-9a-f]{40}$/.test(reference))
        .map((reference) => `${file}: ${reference}`),
    );

    expect(actionReferences(ciWorkflow).length).toBeGreaterThan(0);
    expect(unpinned).toEqual([]);
  });

  it('grant the GITHUB_TOKEN read-only repository access at workflow level', () => {
    for (const source of Object.values(workflows)) {
      expect(source).toMatch(/^permissions:\s*\n\s+contents: read\s*$/m);
      expect(source).not.toMatch(/\$\{\{\s*secrets\./);
    }
  });
});
