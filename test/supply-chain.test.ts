// @vitest-environment node
import { describe, expect, it } from 'vitest';
import exceptionsFile from '../security/exceptions.yaml?raw';
import licenceDocument from '../docs/security/licenses.md?raw';
import dockerfile from '../Dockerfile?raw';
import preCommit from '../.pre-commit-config.yaml?raw';
import lock from '../package-lock.json';
import {
  ExceptionsError,
  classifyLicence,
  gate,
  loadExceptions,
  lockfileInventory,
  npmFindings,
  todayUtc,
  trivyIgnore,
  unacknowledged,
} from '../scripts/security/supply-chain.mjs';

const TODAY = '2026-10-22';
const VALID = `# comment
exceptions:
  - id: CVE-2026-12345
    package: some-package   # inline comment
    reason: "Not reachable: the parser is never given untrusted input"
    expires: 2026-10-22
  - id: GHSA-xvch-5gv4-984h
    reason: 'Waiting for the upstream fix in the next release'
    expires: 2026-12-31
`;

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

  it.each([
    ['missing reason', 'exceptions:\n  - id: CVE-2026-1234\n    expires: 2026-12-31\n'],
    ['bad id', 'exceptions:\n  - id: CVE-26-1\n    reason: some long reason\n    expires: 2026-12-31\n'],
    ['bad date', 'exceptions:\n  - id: CVE-2026-1234\n    reason: some long reason\n    expires: 2026-02-30\n'],
    [
      'unknown key',
      'exceptions:\n  - id: CVE-2026-1234\n    reason: some long reason\n    expires: 2026-12-31\n    x: y\n',
    ],
    ['short reason', 'exceptions:\n  - id: CVE-2026-1234\n    reason: ok\n    expires: 2026-12-31\n'],
    [
      'duplicate',
      'exceptions:\n  - id: CVE-2026-1234\n    reason: some long reason\n    expires: 2026-12-31\n' +
        '  - id: cve-2026-1234\n    reason: some long reason\n    expires: 2026-12-31\n',
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

  it('every copyleft or unknown licence in package-lock.json is acknowledged in docs/security/licenses.md', () => {
    const packages = lockfileInventory(lock);
    expect(packages.length).toBeGreaterThan(100);
    expect(unacknowledged(packages, licenceDocument).map((pkg) => `${pkg.name} ${pkg.licence}`)).toEqual([]);
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
