import { describe, expect, it } from 'vitest';

interface TsConfig {
  files?: string[];
  include?: string[];
  references?: { path: string }[];
}

const configs = import.meta.glob<TsConfig>('../tsconfig*.json', { eager: true, import: 'default' });

describe('TypeScript project configuration', () => {
  it('root tsconfig references the app project so `tsc -b` checks src/', () => {
    const root = configs['../tsconfig.json'];
    expect(root?.references?.map((reference) => reference.path)).toContain('./tsconfig.app.json');
  });

  it('app tsconfig includes src/', () => {
    expect(configs['../tsconfig.app.json']?.include).toContain('src');
  });
});
