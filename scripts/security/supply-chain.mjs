// Supply-chain gate logic (ADR-034 in the cogniawerks-api repository): vulnerability exceptions, the npm audit gate
// and the licence inventory. Pure functions; the command-line wrappers are exceptions.mjs and licenses.mjs.

const ID_PATTERN = /^(?:CVE-\d{4}-\d{4,}|GHSA-[2-9cfghjmpqrvwx]{4}-[2-9cfghjmpqrvwx]{4}-[2-9cfghjmpqrvwx]{4})$/;
const REQUIRED_KEYS = ['id', 'reason', 'expires'];
const ALLOWED_KEYS = new Set([...REQUIRED_KEYS, 'package']);
const GATE_SEVERITIES = new Set(['high', 'critical']);

export const PERMISSIVE = new Set([
  'MIT',
  'MIT-0',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  '0BSD',
  'Unlicense',
  'CC0-1.0',
  'Zlib',
  'BSL-1.0',
  'BlueOak-1.0.0',
  'Python-2.0',
  'CC-BY-4.0',
  'X11',
]);
const COPYLEFT = /^(A?GPL|LGPL|MPL|EPL|EUPL|CDDL|OSL|CPL|CC-BY-SA|SSPL)/i;

export class ExceptionsError extends Error {}

function scalar(raw, lineNumber) {
  let value = raw.trim();
  if (value === '') throw new ExceptionsError(`line ${lineNumber}: empty value`);
  const quote = value[0];
  if (quote === '"' || quote === "'") {
    const end = value.indexOf(quote, 1);
    if (end < 0) throw new ExceptionsError(`line ${lineNumber}: unterminated quoted value`);
    const rest = value.slice(end + 1).trim();
    if (rest !== '' && !rest.startsWith('#')) {
      throw new ExceptionsError(`line ${lineNumber}: unexpected text after quoted value`);
    }
    return value.slice(1, end);
  }
  const comment = value.indexOf(' #');
  if (comment >= 0) value = value.slice(0, comment).trimEnd();
  if ('[{&*!|>%@`'.includes(value[0] ?? '')) {
    throw new ExceptionsError(`line ${lineNumber}: unsupported YAML construct`);
  }
  return value;
}

/** Parses the restricted YAML subset of security/exceptions.yaml into string maps; rejects anything else. */
export function parseExceptions(text) {
  const entries = [];
  let seenRoot = false;
  let emptyList = false;
  let current;
  text.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;
    const stripped = line.trim();
    if (stripped === '' || stripped.startsWith('#')) return;
    if (line.includes('\t')) throw new ExceptionsError(`line ${lineNumber}: tabs are not allowed`);
    if (!seenRoot) {
      const root = line.split('#', 1)[0]?.replace(/\s/g, '');
      if (root !== 'exceptions:' && root !== 'exceptions:[]') {
        throw new ExceptionsError(`line ${lineNumber}: the file must start with 'exceptions:'`);
      }
      seenRoot = true;
      emptyList = root === 'exceptions:[]';
      return;
    }
    if (emptyList) throw new ExceptionsError(`line ${lineNumber}: content after 'exceptions: []'`);
    const item = /^ {2}- ([a-z_]+):(.*)$/.exec(line);
    const field = /^ {4}([a-z_]+):(.*)$/.exec(line);
    let key;
    let raw;
    if (item) {
      current = new Map();
      entries.push(current);
      [, key, raw] = item;
    } else if (field && current) {
      [, key, raw] = field;
    } else {
      throw new ExceptionsError(`line ${lineNumber}: expected '  - key: value' or '    key: value'`);
    }
    if (current.has(key)) throw new ExceptionsError(`line ${lineNumber}: duplicate key '${key}'`);
    current.set(key, scalar(raw, lineNumber));
  });
  if (!seenRoot) throw new ExceptionsError("missing 'exceptions:'");
  return entries;
}

/** Today's date in UTC as YYYY-MM-DD. */
export function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Parses and validates the exceptions file. Throws an ExceptionsError listing every malformed or expired entry.
 * An exception is valid through its expiry date (inclusive).
 */
export function loadExceptions(text, today = todayUtc()) {
  const result = [];
  const errors = [];
  const seen = new Set();
  parseExceptions(text).forEach((entry, index) => {
    const label = `exception ${String(index + 1)} (${entry.get('id') ?? '?'})`;
    const unknown = [...entry.keys()].filter((key) => !ALLOWED_KEYS.has(key));
    const missing = REQUIRED_KEYS.filter((key) => !entry.has(key));
    if (unknown.length > 0) errors.push(`${label}: unknown key(s) ${unknown.sort().join(', ')}`);
    if (missing.length > 0) {
      errors.push(`${label}: missing ${missing.join(', ')}`);
      return;
    }
    const id = entry.get('id');
    const reason = entry.get('reason');
    const expires = entry.get('expires');
    const pkg = entry.get('package');
    if (!ID_PATTERN.test(id)) errors.push(`${label}: id must be a CVE-… or GHSA-… identifier`);
    if (reason.trim().length < 10) errors.push(`${label}: reason must explain the exception`);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(expires) ? new Date(`${expires}T00:00:00Z`) : undefined;
    if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== expires) {
      errors.push(`${label}: expires must be an ISO date (YYYY-MM-DD)`);
      return;
    }
    if (expires < today) errors.push(`${label}: expired on ${expires}; fix the finding or renew the exception`);
    const key = `${id.toUpperCase()}|${pkg?.toLowerCase() ?? ''}`;
    if (seen.has(key)) errors.push(`${label}: duplicate entry`);
    seen.add(key);
    result.push({ id, reason, expires, package: pkg });
  });
  if (errors.length > 0) throw new ExceptionsError(errors.join('\n'));
  return result;
}

/** True when the exception applies to the advisory (and package, if the exception names one). */
export function covers(exception, advisoryId, pkg) {
  if (exception.id.toUpperCase() !== advisoryId.toUpperCase()) return false;
  return exception.package === undefined || exception.package.toLowerCase() === pkg?.toLowerCase();
}

/** The active ids in Trivy's ignore-file format (`ID exp:YYYY-MM-DD`). */
export function trivyIgnore(exceptions) {
  return exceptions.map((exception) => `${exception.id} exp:${exception.expires}\n`).join('');
}

/** Advisories of an `npm audit --json` report (auditReportVersion 2): { severity, package, advisory, title }. */
export function npmFindings(report) {
  if (report === null || typeof report !== 'object' || typeof report.vulnerabilities !== 'object') {
    throw new ExceptionsError('not an `npm audit --json` report (no "vulnerabilities")');
  }
  const findings = new Map();
  for (const vulnerability of Object.values(report.vulnerabilities)) {
    for (const via of vulnerability.via ?? []) {
      if (typeof via !== 'object') continue;
      const advisory = String(via.url ?? via.source ?? '?')
        .replace(/\/+$/, '')
        .split('/')
        .pop();
      const finding = { severity: String(via.severity), package: String(via.name), advisory, title: String(via.title) };
      findings.set(`${finding.package}|${advisory}`, finding);
    }
  }
  return [...findings.values()].sort((a, b) => `${a.package}${a.advisory}`.localeCompare(`${b.package}${b.advisory}`));
}

/** Every finding as a printable line, and the High/Critical ones without a covering exception. */
export function gate(findings, exceptions) {
  const lines = [];
  const blocking = [];
  for (const finding of findings) {
    const excepted = exceptions.some((exception) => covers(exception, finding.advisory, finding.package));
    const line = `${finding.severity}\t${finding.package}\t${finding.advisory}\t${finding.title}${excepted ? '\t(excepted)' : ''}`;
    lines.push(line);
    if (GATE_SEVERITIES.has(finding.severity.toLowerCase()) && !excepted) blocking.push(line);
  }
  return { lines, blocking };
}

/** permissive | copyleft | review, for an SPDX expression. OR picks the most permissive alternative. */
export function classifyLicence(expression) {
  if (!expression || !/^[A-Za-z0-9.+\-() ]+$/.test(expression)) return 'review';
  const alternatives = expression
    .replace(/[()]/g, ' ')
    .trim()
    .split(/\s+OR\s+/);
  const categories = alternatives.map((alternative) => {
    const ids = alternative
      .trim()
      .split(/\s+(?:AND|WITH)\s+/)
      .filter((token) => token !== '');
    if (ids.some((token) => COPYLEFT.test(token))) return 'copyleft';
    if (ids.length > 0 && ids.every((token) => PERMISSIVE.has(token.replace(/\+$/, '')))) return 'permissive';
    return 'review';
  });
  return ['permissive', 'copyleft', 'review'].find((category) => categories.includes(category)) ?? 'review';
}

/** Packages of an npm lockfile (v2/v3) with licence, scope (runtime or dev) and category. */
export function lockfileInventory(lock) {
  const packages = new Map();
  for (const [location, entry] of Object.entries(lock.packages ?? {})) {
    if (location === '' || entry.link === true) continue;
    const name = entry.name ?? location.slice(location.lastIndexOf('node_modules/') + 'node_modules/'.length);
    const licence = typeof entry.license === 'string' ? entry.license : '';
    const key = `${name}@${String(entry.version)}`;
    const scope = entry.dev === true ? 'dev' : 'runtime';
    const existing = packages.get(key);
    if (existing && existing.scope === 'runtime') continue;
    packages.set(key, {
      name,
      version: String(entry.version),
      scope,
      licence: licence || '(none)',
      category: classifyLicence(licence),
    });
  }
  return [...packages.values()].sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`));
}

/** Flagged (copyleft or review) packages whose name is not named in backticks in the licence document. */
export function unacknowledged(packages, licenceDocument) {
  return packages.filter((pkg) => pkg.category !== 'permissive' && !licenceDocument.includes(`\`${pkg.name}\``));
}

/** The full licence inventory as Markdown. */
export function licenceReport(packages) {
  const count = (category) => packages.filter((pkg) => pkg.category === category).length;
  return [
    '# npm licence inventory',
    '',
    `${String(packages.length)} packages: ${String(count('permissive'))} permissive, ${String(count('copyleft'))} copyleft, ` +
      `${String(count('review'))} to review. Generated by scripts/security/licenses.mjs.`,
    '',
    '| Package | Version | Scope | Licence | Category |',
    '|---|---|---|---|---|',
    ...packages.map((pkg) => `| ${pkg.name} | ${pkg.version} | ${pkg.scope} | ${pkg.licence} | ${pkg.category} |`),
    '',
  ].join('\n');
}
