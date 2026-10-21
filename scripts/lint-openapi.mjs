// Lints the API contract (api/openapi-v1.json) with the open-source Redocly OpenAPI core and the rules in
// redocly.yaml. Exits non-zero on errors. Intended for CI once the pipeline story is picked up.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatProblems, getTotals, lint, loadConfig } from '@redocly/openapi-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = path.join(root, 'api', 'openapi-v1.json');

const config = await loadConfig({ configPath: path.join(root, 'redocly.yaml') });
const problems = await lint({ ref: contract, config });
const totals = getTotals(problems);

formatProblems(problems, { format: 'stylish', totals, version: 'openapi-core' });
console.log(`${path.relative(root, contract)}: ${totals.errors} error(s), ${totals.warnings} warning(s)`);
process.exitCode = totals.errors > 0 ? 1 : 0;
