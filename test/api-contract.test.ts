// @vitest-environment node
import { describe, expect, expectTypeOf, it } from 'vitest';
import contract from '../api/openapi-v1.json';
import generated from '../src/api/generated/schema.d.ts?raw';
import type { ApiErrorEnvelope } from '../src/api/errors';
import type { components } from '../src/api/generated/schema';
import { generateTypes } from '../scripts/openapi-types.mjs';

describe('API contract', () => {
  it('is an OpenAPI 3.1 document', () => {
    expect(contract.openapi).toMatch(/^3\.1\./);
  });

  it('generated types are up to date with api/openapi-v1.json (run `npm run api:generate -- --local`)', async () => {
    expect(await generateTypes(contract)).toBe(generated.replaceAll('\r\n', '\n'));
  });

  it('hand-written error envelope has the same fields as the contract', () => {
    expectTypeOf<keyof components['schemas']['ErrorEnvelope']>().toEqualTypeOf<keyof ApiErrorEnvelope>();
  });
});
