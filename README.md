# CogniaWerks Web

React + TypeScript front end for CogniaWerks. It talks only to the CogniaWerks API (`cogniawerks-api`), never directly to data sources.

## Quickstart

Requirements: Node.js 22+.

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env` to point the UI at a different API.

## Checks

| Command | Purpose |
|---|---|
| `npm run typecheck` | `tsc -b` over all project references (`src/`, `test/`, config) |
| `npm run lint` | ESLint, strict type-checked rules, jsx-a11y, no hard-coded UI strings; zero warnings allowed |
| `npm test` | Vitest unit and component tests, including axe-core accessibility checks |
| `npm run test:e2e` | Playwright smoke test (desktop and tablet) with axe |
| `npm run build` | Production build |
| `npm run api:generate` | Copy the API contract (`../cogniawerks-api/docs/api/openapi-v1.json`, or a path argument) to `api/` and regenerate `src/api/generated/schema.d.ts`; `-- --local` only regenerates |
| `npm run api:lint` | Lint the API contract with Redocly OpenAPI core (`redocly.yaml`) |

## Conventions

- All user-visible text goes through i18next (`src/i18n/locales/en.json`); English is the baseline.
- Timestamps arrive in UTC and are formatted in the viewer's time zone (`src/format/dateTime.ts`).
- The API client (`src/api/client.ts`) is typed by the generated contract types; never hand-write API response types.
  A test fails when `src/api/generated/schema.d.ts` is out of date with `api/openapi-v1.json`.
- Feature flags come from `GET /api/v1/features` via `useFeatureFlags()`; a flag counts as off while loading or on error.
- API errors use the standard envelope (`code`, `message`, `correlationId`, `retriable`, `completeness`); see `src/api/errors.ts`.
- Partial or unavailable data and low AI confidence are always shown explicitly (`DataCompletenessBadge`, `AiConfidenceNotice`).
- `.npmrc` only resolves package versions published before a fixed date; move it deliberately when upgrading.

## Docker

```bash
docker build -t cogniawerks-web .
docker run -p 8080:8080 cogniawerks-web
```

The image runs nginx as a non-root user on port 8080.
