// Licence inventory of the npm dependencies, from package-lock.json (ADR-751 in the cogniawerks-api repository).
//
//   node scripts/security/licenses.mjs report <out.md>   write the full inventory (CI artifact)
//   node scripts/security/licenses.mjs check             fail when a copyleft or review package (unknown, missing or
//                                                        non-permissive licence) is not acknowledged in
//                                                        docs/security/licenses.md
// Exit code 0 = pass, 1 = unacknowledged flagged package, 2 = usage error.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { licenceReport, lockfileInventory, unacknowledged } from './supply-chain.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const [command, target] = process.argv.slice(2);

async function main() {
  if (!(command === 'check' || (command === 'report' && target))) {
    console.error('usage: licenses.mjs report OUT.md | check');
    return 2;
  }
  const packages = lockfileInventory(JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8')));
  if (command === 'report') {
    // The output path is chosen by the caller, on purpose.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await writeFile(target, licenceReport(packages), 'utf8');
    console.log(`Wrote the licence inventory of ${String(packages.length)} packages to ${target}`);
    return 0;
  }
  const flagged = packages.filter((pkg) => pkg.category !== 'permissive');
  console.log(`${String(packages.length)} packages, ${String(flagged.length)} flagged (copyleft or review).`);
  flagged.forEach((pkg) => {
    console.log(`  ${pkg.category}\t${pkg.name} ${pkg.version} (${pkg.scope})\t${pkg.licence}`);
  });
  const missing = unacknowledged(packages, await readFile(path.join(root, 'docs', 'security', 'licenses.md'), 'utf8'));
  if (missing.length > 0) {
    console.log('::error::Flagged licences not acknowledged in docs/security/licenses.md:');
    missing.forEach((pkg) => {
      console.log(`  ${pkg.name} ${pkg.version}: ${pkg.licence} (${pkg.category})`);
    });
    return 1;
  }
  return 0;
}

process.exitCode = await main();
