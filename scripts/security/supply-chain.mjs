// Supply-chain gate logic (ADR-034 in the cogniawerks-api repository): vulnerability exceptions, the npm audit gate
// and the licence inventory and policy. Pure functions; the command-line wrappers are exceptions.mjs and licenses.mjs.

const ID_PATTERN = /^(?:CVE-\d{4}-\d{4,}|GHSA-[2-9cfghjmpqrvwx]{4}-[2-9cfghjmpqrvwx]{4}-[2-9cfghjmpqrvwx]{4})$/;
const REQUIRED_KEYS = ['id', 'reason', 'start', 'expires'];
const ALLOWED_KEYS = new Set([...REQUIRED_KEYS, 'package']);
const GATE_SEVERITIES = new Set(['high', 'critical']);
/** DEC-43 point 3 b: an exception runs at most 90 days from `start` to `expires` (exactly 90 passes, 91 fails). */
export const MAX_LIFETIME_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Scopes an acknowledgement in docs/security/licenses.md may state (DEC-43 point 2 b). */
export const SCOPES = ['shipped', 'test', 'service'];
const ACKNOWLEDGED_HEADING = '## Acknowledged packages';

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

/** The date of a YYYY-MM-DD string (UTC midnight), or undefined when it is not a real ISO date. */
function isoDate(value) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : undefined;
  return date && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : undefined;
}

/**
 * Parses and validates the exceptions file. Throws an ExceptionsError listing every malformed or expired entry, every
 * entry whose start lies in the future and every entry that runs longer than MAX_LIFETIME_DAYS from start to expiry.
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
    const start = entry.get('start');
    const expires = entry.get('expires');
    const pkg = entry.get('package');
    if (!ID_PATTERN.test(id)) errors.push(`${label}: id must be a CVE-… or GHSA-… identifier`);
    if (reason.trim().length < 10) errors.push(`${label}: reason must explain the exception`);
    const startDate = isoDate(start);
    const expiresDate = isoDate(expires);
    if (!startDate) errors.push(`${label}: start must be an ISO date (YYYY-MM-DD)`);
    if (!expiresDate) errors.push(`${label}: expires must be an ISO date (YYYY-MM-DD)`);
    if (!startDate || !expiresDate) return;
    const lifetime = Math.round((expiresDate.getTime() - startDate.getTime()) / DAY_MS);
    if (start > today) {
      errors.push(`${label}: start ${start} lies in the future; use the day the exception was added`);
    }
    if (lifetime < 0) {
      errors.push(`${label}: expires ${expires} lies before start ${start}`);
    } else if (lifetime > MAX_LIFETIME_DAYS) {
      errors.push(
        `${label}: runs ${String(lifetime)} days from start ${start} to expires ${expires}; the maximum is ` +
          `${String(MAX_LIFETIME_DAYS)} days (DEC-43); fix the finding or add a new, reviewed exception`,
      );
    }
    if (expires < today) errors.push(`${label}: expired on ${expires}; fix the finding or renew the exception`);
    const key = `${id.toUpperCase()}|${pkg?.toLowerCase() ?? ''}`;
    if (seen.has(key)) errors.push(`${label}: duplicate entry`);
    seen.add(key);
    result.push({ id, reason, start, expires, package: pkg });
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

/**
 * The rows of the "Acknowledged packages" table in docs/security/licenses.md (package in backticks, scope, SPDX
 * licence, assessment) and an error for every row without a package name or a valid scope.
 */
export function licenceAcknowledgements(licenceDocument) {
  const lines = licenceDocument.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === ACKNOWLEDGED_HEADING);
  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  const rows = (start < 0 ? [] : lines.slice(start + 1, end < 0 ? undefined : end))
    .filter((line) => line.startsWith('|') && !/^[|:\-\s]+$/.test(line))
    .slice(1)
    .map((line) =>
      line
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => cell.trim()),
    );
  const acknowledgements = [];
  const errors = [];
  for (const cells of rows) {
    const name = /^`([^`]+)`$/.exec(cells[0] ?? '')?.[1];
    const scope = (cells[1] ?? '').toLowerCase();
    if (name === undefined || cells.length < 3) {
      errors.push(`row '${cells.join(' | ')}' needs the package in backticks, a scope and a licence`);
    } else if (!SCOPES.includes(scope)) {
      errors.push(`${name}: the acknowledgement must state its scope (${SCOPES.join(', ')}), not '${cells[1] ?? ''}'`);
    } else {
      acknowledgements.push({ name, scope, licence: (cells[2] ?? '').replace(/`/g, '') });
    }
  }
  return { acknowledgements, errors };
}

/**
 * Every breach of the licence policy (DEC-43 point 2 b, OI-10); empty when the gate passes. Shipped (runtime) code
 * uses permissive licences only: a copyleft runtime package fails, acknowledged or not, and a review runtime package
 * fails unless it is acknowledged with scope `shipped` and the permissive SPDX licence its licence text was read as.
 * Any other copyleft or review package needs an acknowledgement whose scope matches package-lock.json: `test` only
 * for a package that is a dev dependency in every place it is installed. An npm package is never a `service`.
 */
export function licenceViolations(packages, licenceDocument) {
  const { acknowledgements, errors } = licenceAcknowledgements(licenceDocument);
  const byName = new Map();
  for (const acknowledgement of acknowledgements) {
    if (byName.has(acknowledgement.name)) errors.push(`${acknowledgement.name}: acknowledged twice`);
    byName.set(acknowledgement.name, acknowledgement);
  }
  for (const pkg of packages) {
    if (pkg.category === 'permissive') continue;
    const acknowledgement = byName.get(pkg.name);
    const used = pkg.scope === 'dev' ? 'test' : 'shipped';
    const where = pkg.scope === 'dev' ? 'a dev dependency' : 'a runtime dependency';
    if (pkg.category === 'copyleft' && used === 'shipped') {
      errors.push(
        `${pkg.name} ${pkg.version}: copyleft licence ${pkg.licence} in shipped code (runtime dependency); only ` +
          'permissive licences may be shipped (DEC-43), acknowledged or not',
      );
    } else if (!acknowledgement) {
      errors.push(`${pkg.name} ${pkg.version}: ${pkg.licence} (${pkg.category}) is not acknowledged`);
    } else if (acknowledgement.scope === 'service') {
      errors.push(`${pkg.name}: acknowledged as a separate service, but it is an npm package (${where})`);
    } else if (acknowledgement.scope !== used) {
      errors.push(`${pkg.name}: acknowledged with scope '${acknowledgement.scope}', but it is ${where}`);
    } else if (used === 'shipped' && classifyLicence(acknowledgement.licence) !== 'permissive') {
      errors.push(
        `${pkg.name} ${pkg.version}: unknown licence ${pkg.licence} in shipped code; only a package whose licence ` +
          `text was read as a permissive SPDX licence may be shipped (DEC-43), not '${acknowledgement.licence}'`,
      );
    }
  }
  return errors;
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
