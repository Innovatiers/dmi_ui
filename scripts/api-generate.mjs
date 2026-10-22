// Copies the published API contract into this repository and regenerates the TypeScript types.
//
//   npm run api:generate                      copy from ../cogniawerks-api/docs/api/openapi-v1.json
//   npm run api:generate -- <path>            copy from another checkout or file
//   npm run api:generate -- --local           only regenerate the types from api/openapi-v1.json
//
// COGNIAWERKS_OPENAPI may also point at the contract file.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateTypes } from './openapi-types.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractCopy = path.join(root, 'api', 'openapi-v1.json');
const typesFile = path.join(root, 'src', 'api', 'generated', 'schema.d.ts');

const argument = process.argv[2];
if (argument !== '--local') {
  const source = path.resolve(
    argument ??
      process.env.COGNIAWERKS_OPENAPI ??
      path.join(root, '..', 'cogniawerks-api', 'docs', 'api', 'openapi-v1.json'),
  );
  // The contract path is chosen by the developer running this script (argument or environment), on purpose.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await readFile(source, 'utf8');
  const contract = JSON.parse(text);
  if (typeof contract.openapi !== 'string' || !contract.openapi.startsWith('3.1.')) {
    throw new Error(`${source} is not an OpenAPI 3.1 document.`);
  }
  await mkdir(path.dirname(contractCopy), { recursive: true });
  await writeFile(contractCopy, text.replaceAll('\r\n', '\n'));
  console.log(`Copied contract from ${source}`);
}

const contract = JSON.parse(await readFile(contractCopy, 'utf8'));
await mkdir(path.dirname(typesFile), { recursive: true });
await writeFile(typesFile, await generateTypes(contract));
console.log(`Generated ${path.relative(root, typesFile)}`);
