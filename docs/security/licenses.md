# Third-party licences (cogniawerks-web)

Licence overview for the npm dependencies and the container base images (ADR-034 in the cogniawerks-api repository).
The full, per-build inventory is generated in CI and kept with the SBOMs:

- `sbom-source` artifact (job `sbom-licenses`): `cogniawerks-web.npm.cdx.json` (CycloneDX SBOM of the npm
  dependencies, from `package-lock.json`) and `licenses-npm.md` (every package with licence, scope and category).
- `sbom-images` artifact (job `container-scan`): the CycloneDX SBOM of the web image, including the Alpine packages of
  the nginx base image.

Locally: `node scripts/security/licenses.mjs report licenses-npm.md`.

## Classification

`scripts/security/licenses.mjs` reads the `license` field of each package in `package-lock.json` and classifies it:

| Category   | Meaning                                                                                                | Gate                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| permissive | Every alternative of the SPDX expression is on the permissive list (MIT, Apache-2.0, BSD, ISC, CC0, …) | none                                                                                                                                                              |
| copyleft   | GPL, AGPL, LGPL, MPL, EPL, EUPL, CDDL, …                                                               | runtime dependency: fails; dev dependency: acknowledged below with scope `test`                                                                                   |
| review     | No licence, a non-SPDX value, an unknown or commercial licence                                         | runtime dependency: fails unless its licence text was read as a permissive licence (below, scope `shipped`); dev dependency: acknowledged below with scope `test` |

## Licence policy (DEC-43 point 2 b)

Shipped code uses permissive licences only. Copyleft (GPL, AGPL, LGPL, MPL, EPL and similar) or an unknown licence is
allowed only for test-only dependencies (dev dependencies) or for a separate, unmodified service. `licenses.mjs check`
(CI job `sbom-licenses`) and `test/supply-chain.test.ts` (`npm test`) enforce this:

- A copyleft package that `package-lock.json` installs as a runtime dependency fails, also when it is acknowledged here.
- A review package installed as a runtime dependency fails, unless it is acknowledged with scope `shipped` and the
  permissive SPDX licence its licence text was read as.
- Every other copyleft or review package is acknowledged below with the scope it is really used in. The check compares
  that scope with `package-lock.json`: scope `test` only passes while every installed copy is a dev dependency
  (`"dev": true`), and an npm package can never have scope `service` (separate services, such as Grafana Loki, are
  deployed by the cogniawerks-api compose files and acknowledged there).

Acknowledging a package records that its licence was read and where it is used; it is not a licence approval for a
new kind of use.

## Acknowledged packages

| Package                | Scope | Licence | Assessment                                                                                                                                             |
| ---------------------- | ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `axe-core`             | test  | MPL-2.0 | Weak, file-level copyleft. A dev dependency, used unmodified in Vitest and Playwright accessibility tests; not part of the production bundle or image. |
| `@axe-core/playwright` | test  | MPL-2.0 | As `axe-core`: a dev dependency, test-only, unmodified, not shipped.                                                                                   |

Inventory of 2026-10-22: 464 packages, 461 with a permissive SPDX expression, 3 MPL-2.0 (above: `axe-core` in two
versions and `@axe-core/playwright`, all dev dependencies), none to review.

## Known licence risks

| Component  | Status     | Note                                                                                                                                              |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDF export | Not in use | No PDF library is a dependency. Candidate engines range from permissive to AGPL or commercial licences; record the choice here before adding one. |

## Container base images

| Image                                  | Licence notes                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `nginxinc/nginx-unprivileged` (Alpine) | nginx is BSD-2-Clause; the Alpine packages carry their own licences (see the image SBOM). Shipped unmodified. |
| `node` (Alpine)                        | Build stage only; not shipped.                                                                                |
