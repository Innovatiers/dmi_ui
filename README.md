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

| Command                | Purpose                                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`    | `tsc -b` over all project references (`src/`, `test/`, config)                                                                                                                    |
| `npm run lint`         | ESLint, strict type-checked rules, jsx-a11y, `eslint-plugin-security`, no hard-coded UI strings; zero warnings allowed                                                            |
| `npm test`             | Vitest unit and component tests, including axe-core accessibility checks                                                                                                          |
| `npm run test:e2e`     | Playwright smoke test (desktop and tablet) with axe                                                                                                                               |
| `npm run build`        | Production build                                                                                                                                                                  |
| `npm run api:generate` | Copy the API contract (`../cogniawerks-api/docs/api/openapi-v1.json`, or a path argument) to `api/` and regenerate `src/api/generated/schema.d.ts`; `-- --local` only regenerates |
| `npm run api:lint`     | Lint the API contract with Redocly OpenAPI core (`redocly.yaml`)                                                                                                                  |

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request (ADR-020 in `cogniawerks-api/docs/decisions.md`). Jobs:

| Job                         | Fails when                                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `action-pinning`            | a `uses:` reference in a workflow is not pinned to a full commit SHA (also checked by `test/ci-workflows.test.ts`)                                  |
| `lint-typecheck-test-build` | `npm ci`, `npm run lint` (incl. `eslint-plugin-security`, 0 warnings), `npm run typecheck`, `npm test`, `npm run api:lint` or `npm run build` fails |
| `npm-audit`                 | `npm audit` reports a high or critical advisory                                                                                                     |
| `sast`                      | Semgrep CE (TypeScript, React, Dockerfile, workflow rules) reports a finding                                                                        |
| `secret-scan`               | gitleaks finds a secret anywhere in the git history                                                                                                 |
| `container-scan`            | Trivy finds a High or Critical vulnerability with an available fix in the web image (SARIF artifact `trivy-web-sarif`)                              |
| `playwright-smoke`          | the Playwright smoke test (desktop and tablet, axe) fails against `vite preview`                                                                    |

No secrets are needed; the workflow token is read-only. Dependabot (`.github/dependabot.yml`) proposes npm, GitHub
Actions and Docker updates after a 14-day cool-down; keep `.npmrc` `before=` in mind when accepting them. Security
updates (Dependabot security updates, enabled in the repository settings) are not subject to the cool-down.

The web image runs no package upgrade of its own: the build and runtime base images are pinned by tag and digest and
change only through a Dependabot update. A red `container-scan` between two such updates is accepted.

### Branch protection (advice, set by the repository owner)

Protect `main` with "Require a pull request before merging" and "Require status checks to pass", with these required
checks: `action-pinning`, `lint-typecheck-test-build`, `npm-audit`, `sast`, `secret-scan`, `playwright-smoke`.
`container-scan` runs on every push and stays visible, but is advised not to be a required check, because a red scan
between two base-image updates is accepted (decision open). Also enable "Require branches to be up to date before merging", block force pushes, and enable
Dependabot security updates. GitHub Advanced Security / CodeQL stays off until DEC-14 decides otherwise.

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
