# Third-party licences (cogniawerks-web)

Licence overview for the npm dependencies and the container base images (ADR-751 in the cogniawerks-api repository).
The full, per-build inventory is generated in CI and kept with the SBOMs:

- `sbom-source` artifact (job `sbom-licenses`): `cogniawerks-web.npm.cdx.json` (CycloneDX SBOM of the npm
  dependencies, from `package-lock.json`) and `licenses-npm.md` (every package with licence, scope and category).
- `sbom-images` artifact (job `container-scan`): the CycloneDX SBOM of the web image, including the Alpine packages of
  the nginx base image.

Locally: `node scripts/security/licenses.mjs report licenses-npm.md`.

## Classification

`scripts/security/licenses.mjs` reads the `license` field of each package in `package-lock.json` and classifies it:

| Category   | Meaning                                                                                                | Gate                       |
| ---------- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| permissive | Every alternative of the SPDX expression is on the permissive list (MIT, Apache-2.0, BSD, ISC, CC0, …) | none                       |
| copyleft   | GPL, AGPL, LGPL, MPL, EPL, EUPL, CDDL, …                                                               | must be acknowledged below |
| review     | No licence, a non-SPDX value, an unknown or commercial licence                                         | must be acknowledged below |

`licenses.mjs check` (CI job `sbom-licenses`) and `test/supply-chain.test.ts` (`npm test`) fail when a copyleft or
review package is not named in the table below. Acknowledging a package records that its licence was read; it is not a
licence approval for a new kind of use.

## Acknowledged packages

| Package                | Scope       | Licence | Assessment                                                                                                                           |
| ---------------------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `axe-core`             | dev (tests) | MPL-2.0 | Weak, file-level copyleft. Used unmodified in Vitest and Playwright accessibility tests; not part of the production bundle or image. |
| `@axe-core/playwright` | dev (tests) | MPL-2.0 | As `axe-core`: test-only, unmodified, not shipped.                                                                                   |

Inventory of 2026-10-22: 464 packages, 461 with a permissive SPDX expression, 3 MPL-2.0 (above), none to review.

## Known licence risks

| Component  | Status     | Note                                                                                                                                              |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDF export | Not in use | No PDF library is a dependency. Candidate engines range from permissive to AGPL or commercial licences; record the choice here before adding one. |

## Container base images

| Image                                  | Licence notes                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `nginxinc/nginx-unprivileged` (Alpine) | nginx is BSD-2-Clause; the Alpine packages carry their own licences (see the image SBOM). Shipped unmodified. |
| `node` (Alpine)                        | Build stage only; not shipped.                                                                                |
