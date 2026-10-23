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

`.github/workflows/ci.yml` runs on every push and pull request (ADR-020 and ADR-034 in
`cogniawerks-api/docs/decisions.md`). Jobs:

| Job                         | Fails when                                                                                                                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `action-pinning`            | a `uses:` reference or a `.pre-commit-config.yaml` `rev:` is not pinned to a full commit SHA (also checked by `test/ci-workflows.test.ts` and `test/supply-chain.test.ts`)                                                                                                  |
| `lint-typecheck-test-build` | `npm ci`, `npm run lint` (incl. `eslint-plugin-security`, 0 warnings), `npm run typecheck`, `npm test`, `npm run api:lint` or `npm run build` fails                                                                                                                         |
| `npm-audit`                 | `security/exceptions.yaml` is malformed, expired or longer than 90 days, or `npm audit` reports a high or critical advisory without a valid exception                                                                                                                       |
| `sast`                      | Semgrep CE (TypeScript, React, Dockerfile, workflow rules) reports a finding                                                                                                                                                                                                |
| `secret-scan`               | gitleaks finds a secret anywhere in the git history                                                                                                                                                                                                                         |
| `container-scan`            | the web image runs as root, or Trivy finds a High or Critical vulnerability with an available fix that has no valid exception (SARIF artifact `trivy-web-sarif`, incl. the base images; CycloneDX image SBOM in `sbom-images`)                                              |
| `sbom-licenses`             | the CycloneDX SBOM (`npm sbom`) cannot be produced, or the licence policy (DEC-43) is broken: a copyleft or unknown licence in a runtime dependency, or a dev dependency that `docs/security/licenses.md` does not acknowledge with its real scope (artifact `sbom-source`) |
| `gate-selftest`             | the secret scan does not fail on a generated fake secret, or the npm audit gate does not fail on a package with a known Critical advisory or accepts an expired or 91-day exception                                                                                         |
| `playwright-smoke`          | the Playwright smoke test (desktop and tablet, axe) fails against `vite preview`                                                                                                                                                                                            |

No secrets are needed; the workflow token is read-only. Dependabot (`.github/dependabot.yml`) proposes npm, GitHub
Actions and Docker updates after a 14-day cool-down; keep `.npmrc` `before=` in mind when accepting them. Security
updates (Dependabot security updates, enabled in the repository settings) are not subject to the cool-down.

The web image runs no package upgrade of its own: the build and runtime base images are pinned by tag and digest and
change only through a Dependabot update. A red `container-scan` between two such updates is accepted.

### Supply chain (ADR-034 in cogniawerks-api)

- **Exceptions.** A High or Critical finding that cannot be fixed yet is listed in `security/exceptions.yaml` with the
  advisory id (GHSA or CVE), a reason, a start date and an expiry date at most 90 days later (DEC-43). An expired or
  longer entry fails `npm-audit`, `container-scan` and `npm test`. Check locally: `node scripts/security/exceptions.mjs check`.
- **SBOMs.** Every CI run, including the run for a release tag, keeps CycloneDX SBOMs for 90 days: `sbom-source` (npm,
  plus the licence inventory) and `sbom-images` (web image). The SBOMs of a release are the artifacts of the CI run of
  its tag.
- **Licences.** Shipped code uses permissive licences only (DEC-43); copyleft or unknown licences are allowed for dev
  (test-only) dependencies. `docs/security/licenses.md` lists each acknowledged licence with its scope, and
  `licenses.mjs check` compares that scope with `package-lock.json`.
- **Secrets before commit.** `pre-commit install` enables the gitleaks hook from `.pre-commit-config.yaml`.
- **Base images** are pinned by tag and digest; the image runs as the unprivileged nginx user.
- **Signing.** Images and SBOMs are not signed yet (open issue in cogniawerks-api).

### Branch protection (advice, set by the repository owner)

Protect `main` with "Require a pull request before merging" and "Require status checks to pass", with these required
checks: `action-pinning`, `lint-typecheck-test-build`, `npm-audit`, `sast`, `secret-scan`, `sbom-licenses`,
`gate-selftest`, `playwright-smoke`. `container-scan` runs on every push and stays visible but is not a required
check: a red scan between two base-image updates is accepted (decision 2026-10-22). Also enable "Require branches to
be up to date before merging", block force pushes, and enable
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
