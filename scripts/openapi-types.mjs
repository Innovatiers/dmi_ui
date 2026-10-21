// Generates the TypeScript types of the CogniaWerks API from its OpenAPI contract.
// Shared by `npm run api:generate` and the contract test, so both produce byte-identical output.
import openapiTS, { astToString } from 'openapi-typescript';

const BANNER = `/**
 * Generated from api/openapi-v1.json by \`npm run api:generate\` (openapi-typescript). Do not edit.
 */

`;

/**
 * @param {object} contract The parsed OpenAPI document.
 * @returns {Promise<string>} The contents of src/api/generated/schema.d.ts.
 */
export async function generateTypes(contract) {
  const ast = await openapiTS(structuredClone(contract));
  return BANNER + astToString(ast);
}
