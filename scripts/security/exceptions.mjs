// Vulnerability exceptions and the npm audit gate (ADR-034 in the cogniawerks-api repository).
//
//   node scripts/security/exceptions.mjs check                    validate security/exceptions.yaml
//   node scripts/security/exceptions.mjs trivyignore <out>        write the active ids for `trivy --ignorefile`
//   node scripts/security/exceptions.mjs npm-gate <audit.json>    fail on High/Critical advisories in
//                                                                 `npm audit --json` without a valid exception
//
// Options (before the command): --file <path> (default security/exceptions.yaml), --today YYYY-MM-DD (tests).
// Exit code 0 = pass, 1 = gate failed (including a malformed or expired exception), 2 = usage or input error.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ExceptionsError, gate, loadExceptions, npmFindings, todayUtc, trivyIgnore } from './supply-chain.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
let file = path.join(root, 'security', 'exceptions.yaml');
let today = todayUtc();
while (args[0]?.startsWith('--')) {
  const option = args.shift();
  const value = args.shift() ?? '';
  if (option === '--file') file = path.resolve(value);
  else if (option === '--today') today = value;
  else args.unshift('');
}
const [command, target] = args;

async function main() {
  if (!['check', 'trivyignore', 'npm-gate'].includes(command ?? '') || (command !== 'check' && !target)) {
    console.error('usage: exceptions.mjs [--file F] [--today D] check | trivyignore OUT | npm-gate AUDIT_JSON');
    return 2;
  }
  let exceptions;
  try {
    // The file is chosen by the caller (CI step or developer), on purpose.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    exceptions = loadExceptions(await readFile(file, 'utf8'), today);
  } catch (error) {
    if (!(error instanceof ExceptionsError)) throw error;
    console.log(`::error::${path.basename(file)} is invalid:\n${error.message}`);
    return 1;
  }
  if (command === 'check') {
    console.log(`${String(exceptions.length)} active exception(s).`);
    for (const e of exceptions) {
      console.log(`  ${e.id}${e.package ? ` (${e.package})` : ''} from ${e.start} until ${e.expires}: ${e.reason}`);
    }
    return 0;
  }
  if (command === 'trivyignore') {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await writeFile(target, trivyIgnore(exceptions), 'utf8');
    console.log(`Wrote ${String(exceptions.length)} id(s) to ${target}`);
    return 0;
  }
  let findings;
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    findings = npmFindings(JSON.parse(await readFile(target, 'utf8')));
  } catch (error) {
    console.log(`::error::cannot read ${target}: ${error instanceof Error ? error.message : String(error)}`);
    return 2;
  }
  if (findings.length === 0) console.log('No advisories reported.');
  const { lines, blocking } = gate(findings, exceptions);
  lines.forEach((line) => {
    console.log(line);
  });
  if (blocking.length > 0) {
    console.log('::error::High or Critical advisories without a valid exception:');
    blocking.forEach((line) => {
      console.log(line);
    });
    return 1;
  }
  return 0;
}

process.exitCode = await main();
