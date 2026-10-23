// @vitest-environment node
import { describe, expect, it } from 'vitest';
import exceptionsFile from '../security/exceptions.yaml?raw';
import licenceDocument from '../docs/security/licenses.md?raw';
import dockerfile from '../Dockerfile?raw';
import preCommit from '../.pre-commit-config.yaml?raw';
import lock from '../package-lock.json';
import {
  ExceptionsError,
  MAX_LIFETIME_DAYS,
  classifyLicence,
  gate,
  licenceAcknowledgements,
  licenceViolations,
  loadExceptions,
  lockfileInventory,
  npmFindings,
  todayUtc,
  trivyIgnore,
} from '../scripts/security/supply-chain.mjs';
import type { LockfilePackage } from '../scripts/security/supply-chain.mjs';

const TODAY = '2026-10-22';
const VALID = `# comment
exceptions:
  - id: CVE-2026-12345
    package: some-package   # inline comment
    reason: "Not reachable: the parser is never given untrusted input"
    start: 2026-09-01
    expires: 2026-10-22
  - id: GHSA-xvch-5gv4-984h
    reason: 'Waiting for the upstream fix in the next release'
    start: 2026-10-02
    expires: 2026-12-31
`;

/** An exceptions file with one entry from `start` to `expires`. */
function entry(start: string, expires: string): string {
  return `exceptions:\n  - id: CVE-2026-1234\n    reason: some long reason\n    start: ${start}\n    expires: ${expires}\n`;
}

function auditReport(...advisories: [pkg: string, severity: string, id: string][]): unknown {
  return {
    auditReportVersion: 2,
    vulnerabilities: Object.fromEntries(
      advisories.map(([pkg, severity, id]) => [
        pkg,
        {
          name: pkg,
          severity,
          via: [{ name: pkg, severity, title: 'Advisory', url: `https://github.com/advisories/${id}` }, 'other'],
        },
      ]),
    ),
    metadata: {},
  };
}

describe('vulnerability exceptions', () => {
  it('the repository file is valid today (an expired exception fails npm test)', () => {
    expect(() => loadExceptions(exceptionsFile, todayUtc())).not.toThrow();
  });

  it('parses a valid file and keeps an exception valid on its expiry day', () => {
    const loaded = loadExceptions(VALID, TODAY);
    expect(loaded.map((e) => e.id)).toEqual(['CVE-2026-12345', 'GHSA-xvch-5gv4-984h']);
    expect(loaded[0]?.package).toBe('some-package');
    expect(loaded[0]?.reason).toBe('Not reachable: the parser is never given untrusted input');
    expect(loaded[1]?.package).toBeUndefined();
    expect(loadExceptions('exceptions: []\n', TODAY)).toEqual([]);
  });

  it('fails on an expired exception', () => {
    expect(() => loadExceptions(VALID, '2026-10-23')).toThrow(/expired on 2026-10-22/);
  });

  it('keeps an exception of exactly 90 days (DEC-43)', () => {
    const [loaded] = loadExceptions(entry('2026-10-02', '2026-12-31'), TODAY);
    expect(MAX_LIFETIME_DAYS).toBe(90);
    expect(loaded?.start).toBe('2026-10-02');
    expect(loaded?.expires).toBe('2026-12-31');
  });

  it('fails on an exception of 91 days with a clear error', () => {
    expect(() => loadExceptions(entry('2026-10-01', '2026-12-31'), TODAY)).toThrow(
      'runs 91 days from start 2026-10-01 to expires 2026-12-31; the maximum is 90 days (DEC-43)',
    );
  });

  it('counts the lifetime from start, across a month of 28 days', () => {
    expect(loadExceptions(entry('2026-01-01', '2026-04-01'), '2026-03-01')).toHaveLength(1);
    expect(() => loadExceptions(entry('2026-01-01', '2026-04-02'), '2026-03-01')).toThrow(/runs 91 days/);
  });

  it('fails on a start date in the future', () => {
    expect(() => loadExceptions(entry('2026-10-23', '2026-12-31'), TODAY)).toThrow(
      /start 2026-10-23 lies in the future/,
    );
  });

  it('fails on an expiry before the start', () => {
    expect(() => loadExceptions(entry('2026-10-02', '2026-10-01'), '2026-10-02')).toThrow(
      /expires 2026-10-01 lies before start 2026-10-02/,
    );
  });

  it.each([
    ['missing reason', 'exceptions:\n  - id: CVE-2026-1234\n    start: 2026-10-02\n    expires: 2026-12-31\n'],
    ['missing start', 'exceptions:\n  - id: CVE-2026-1234\n    reason: some long reason\n    expires: 2026-12-31\n'],
    ['bad id', entry('2026-10-02', '2026-12-31').replace('CVE-2026-1234', 'CVE-26-1')],
    ['bad date', entry('2026-10-02', '2026-02-30')],
    ['bad start', entry('02-10-2026', '2026-12-31')],
    ['unknown key', `${entry('2026-10-02', '2026-12-31')}    x: y\n`],
    ['short reason', entry('2026-10-02', '2026-12-31').replace('some long reason', 'ok')],
    [
      'duplicate',
      entry('2026-10-02', '2026-12-31') +
        entry('2026-10-02', '2026-12-31').replace('exceptions:\n', '').replace('CVE', 'cve'),
    ],
    ['no root', '- id: CVE-2026-1234\n'],
    ['flow mapping', 'exceptions:\n  - {id: CVE-2026-1234}\n'],
    ['content after empty list', 'exceptions: []\n  - id: CVE-2026-1234\n'],
    ['empty file', ''],
  ])('rejects a malformed file: %s', (_name, text) => {
    expect(() => loadExceptions(text, TODAY)).toThrow(ExceptionsError);
  });

  it('writes the active ids in Trivy ignore-file format', () => {
    expect(trivyIgnore(loadExceptions(VALID, TODAY))).toBe(
      'CVE-2026-12345 exp:2026-10-22\nGHSA-xvch-5gv4-984h exp:2026-12-31\n',
    );
  });
});

describe('npm audit gate', () => {
  it('passes without findings and on moderate findings', () => {
    expect(gate(npmFindings(auditReport()), []).blocking).toEqual([]);
    expect(gate(npmFindings(auditReport(['pkg', 'moderate', 'GHSA-aaaa-bbbb-cccc'])), []).blocking).toEqual([]);
  });

  it('fails on high and critical advisories', () => {
    expect(gate(npmFindings(auditReport(['minimist', 'critical', 'GHSA-xvch-5gv4-984h'])), []).blocking).toHaveLength(
      1,
    );
    expect(gate(npmFindings(auditReport(['pkg', 'high', 'GHSA-aaaa-bbbb-cccc'])), []).blocking).toHaveLength(1);
  });

  it('lets an advisory pass that a valid exception covers, also when package-scoped to the same package', () => {
    const exceptions = loadExceptions(VALID, TODAY);
    expect(
      gate(npmFindings(auditReport(['minimist', 'critical', 'GHSA-xvch-5gv4-984h'])), exceptions).blocking,
    ).toEqual([]);
    expect(gate(npmFindings(auditReport(['some-package', 'high', 'CVE-2026-12345'])), exceptions).blocking).toEqual([]);
    expect(
      gate(npmFindings(auditReport(['other-package', 'high', 'CVE-2026-12345'])), exceptions).blocking,
    ).toHaveLength(1);
  });

  it('rejects a report that is not an npm audit report', () => {
    expect(() => npmFindings({ error: { code: 'ENOLOCK' } })).toThrow(ExceptionsError);
  });
});

const LICENCES = `# Licences

## Acknowledged packages

| Package | Scope | Licence | Assessment |
| --- | --- | --- | --- |
| \`dev-copyleft\` | test | GPL-3.0-only | Test-only. |
| \`dev-unknown\` | test | (none) | Test-only. |
| \`runtime-read\` | shipped | MIT | Licence file read: MIT text. |

## Known licence risks

| Component | Status | Note |
| --- | --- | --- |
| \`not-an-acknowledgement\` | shipped | Not read by the check. |
`;

function pkg(name: string, scope: 'runtime' | 'dev', licence: string): LockfilePackage {
  return { name, version: '1.0.0', scope, licence: licence || '(none)', category: classifyLicence(licence) };
}

/** LICENCES with one more row in the acknowledged-packages table. */
function withRow(row: string): string {
  return LICENCES.replace('| `dev-unknown` |', `${row}\n| \`dev-unknown\` |`);
}

describe('licence policy (DEC-43 point 2 b)', () => {
  it('reads the scope and licence of every acknowledgement', () => {
    expect(licenceAcknowledgements(LICENCES)).toEqual({
      acknowledgements: [
        { name: 'dev-copyleft', scope: 'test', licence: 'GPL-3.0-only' },
        { name: 'dev-unknown', scope: 'test', licence: '(none)' },
        { name: 'runtime-read', scope: 'shipped', licence: 'MIT' },
      ],
      errors: [],
    });
  });

  it('needs no acknowledgement for permissive packages', () => {
    expect(licenceViolations([pkg('a', 'runtime', 'MIT'), pkg('b', 'dev', 'ISC')], LICENCES)).toEqual([]);
  });

  it('fails on a copyleft runtime dependency, also when it is acknowledged', () => {
    expect(licenceViolations([pkg('not-listed', 'runtime', 'LGPL-2.1-only')], LICENCES).join()).toMatch(
      /copyleft licence LGPL-2\.1-only in shipped code.*DEC-43/,
    );
    const document = withRow('| `runtime-copyleft` | shipped | MPL-2.0 | Acknowledged. |');
    const errors = licenceViolations([pkg('runtime-copyleft', 'runtime', 'MPL-2.0')], document);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('copyleft licence MPL-2.0 in shipped code');
  });

  it('lets a copyleft or unknown dev dependency pass when it is acknowledged as test', () => {
    expect(
      licenceViolations([pkg('dev-copyleft', 'dev', 'GPL-3.0-only'), pkg('dev-unknown', 'dev', '')], LICENCES),
    ).toEqual([]);
  });

  it('fails on a copyleft dev dependency that is not acknowledged', () => {
    expect(licenceViolations([pkg('other', 'dev', 'AGPL-3.0-only')], LICENCES)).toEqual([
      'other 1.0.0: AGPL-3.0-only (copyleft) is not acknowledged',
    ]);
  });

  it('fails on an acknowledgement as test for a package that is a runtime dependency', () => {
    expect(licenceViolations([pkg('dev-unknown', 'runtime', '')], LICENCES)).toEqual([
      "dev-unknown: acknowledged with scope 'test', but it is a runtime dependency",
    ]);
  });

  it('fails on an acknowledgement as shipped for a dev dependency', () => {
    expect(licenceViolations([pkg('runtime-read', 'dev', 'SEE LICENSE IN LICENSE')], LICENCES)).toEqual([
      "runtime-read: acknowledged with scope 'shipped', but it is a dev dependency",
    ]);
  });

  it('fails on an npm package acknowledged as a separate service', () => {
    const document = withRow('| `bundled-service` | service | AGPL-3.0 | Claimed to be separate. |');
    expect(licenceViolations([pkg('bundled-service', 'dev', 'AGPL-3.0')], document).join()).toMatch(
      /acknowledged as a separate service, but it is an npm package/,
    );
  });

  it('lets an unknown runtime licence pass only when its licence text was read as permissive', () => {
    expect(licenceViolations([pkg('runtime-read', 'runtime', 'SEE LICENSE IN LICENSE')], LICENCES)).toEqual([]);
    const document = withRow('| `runtime-unread` | shipped | unknown | Not read yet. |');
    expect(licenceViolations([pkg('runtime-unread', 'runtime', '')], document).join()).toMatch(
      /unknown licence \(none\) in shipped code.*DEC-43/,
    );
  });

  it('fails on an acknowledgement without a valid scope, or a package acknowledged twice', () => {
    expect(licenceViolations([], withRow('| `no-scope` | dev (tests) | MPL-2.0 | Old format. |'))).toEqual([
      "no-scope: the acknowledgement must state its scope (shipped, test, service), not 'dev (tests)'",
    ]);
    expect(licenceViolations([], withRow('| `dev-copyleft` | test | GPL-3.0-only | Again. |'))).toEqual([
      'dev-copyleft: acknowledged twice',
    ]);
  });

  it('counts a package as runtime when any installed copy is not a dev dependency', () => {
    const inventory = lockfileInventory({
      packages: {
        '': { name: 'app' },
        'node_modules/shared': { version: '1.0.0', license: 'MPL-2.0', dev: true },
        'node_modules/a/node_modules/shared': { version: '1.0.0', license: 'MPL-2.0' },
        'node_modules/tool': { version: '2.0.0', license: 'MPL-2.0', dev: true },
      },
    });
    expect(inventory.map((p) => `${p.name}:${p.scope}`)).toEqual(['shared:runtime', 'tool:dev']);
  });
});

describe('licences', () => {
  it('classifies SPDX expressions', () => {
    expect(classifyLicence('MIT')).toBe('permissive');
    expect(classifyLicence('(MIT OR GPL-3.0-only)')).toBe('permissive');
    expect(classifyLicence('MPL-2.0')).toBe('copyleft');
    expect(classifyLicence('Apache-2.0 AND LGPL-2.1')).toBe('copyleft');
    expect(classifyLicence('SEE LICENSE IN LICENSE.txt')).toBe('review');
    expect(classifyLicence('')).toBe('review');
    expect(classifyLicence('BUSL-1.1')).toBe('review');
  });

  it('package-lock.json and docs/security/licenses.md follow the licence policy (DEC-43)', () => {
    const packages = lockfileInventory(lock);
    expect(packages.length).toBeGreaterThan(100);
    expect(licenceAcknowledgements(licenceDocument).acknowledgements.length).toBeGreaterThan(0);
    expect(licenceViolations(packages, licenceDocument)).toEqual([]);
  });
});

describe('container and hooks', () => {
  const stages = dockerfile
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('FROM '))
    .map((line) => {
      const words = line.split(/\s+/);
      return { image: words[1] ?? '', name: words[2]?.toUpperCase() === 'AS' ? words[3] : undefined };
    });

  it('pins every base image of the Dockerfile by tag and digest', () => {
    expect(stages.length).toBeGreaterThan(0);
    const names = new Set(stages.map((stage) => stage.name));
    for (const stage of stages.filter((s) => !names.has(s.image))) {
      expect(stage.image).toMatch(/^[a-z0-9./-]+:[A-Za-z0-9._-]+@sha256:[0-9a-f]{64}$/);
    }
  });

  it('the shipped (last) stage ends as a non-root user', () => {
    const lastStage = dockerfile.slice(dockerfile.lastIndexOf('\nFROM '));
    const users = [...lastStage.matchAll(/^USER\s+(\S+)/gm)].map((match) => match[1] ?? '');
    expect(users.length).toBeGreaterThan(0);
    expect(['0', 'root']).not.toContain(users.at(-1)?.split(':')[0]);
  });

  it('runs gitleaks before commit, pinned to a full commit SHA', () => {
    expect(preCommit).toContain('https://github.com/gitleaks/gitleaks');
    expect(preCommit).toContain('id: gitleaks');
    const revisions = [...preCommit.matchAll(/^\s*rev:\s*(\S+)/gm)].map((match) => match[1]);
    expect(revisions.length).toBeGreaterThan(0);
    for (const revision of revisions) expect(revision).toMatch(/^[0-9a-f]{40}$/);
  });
});
