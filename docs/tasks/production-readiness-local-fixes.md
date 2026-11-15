# Production readiness: local repair package

## Goal

Prepare the teaching prototype for a possible public link without changing its synthetic-only, browser-local data model.

## Approved scope

Ewa approved the local package on 2026-11-15 after reviewing the first production-readiness report.

1. Put a clear synthetic-data and shared-browser warning at the public entry and before editable workspace flows.
2. Detect changes from another tab before writing localStorage, stop stale writes, and tell the person how to export or reload. A same-origin storage event should warn the open tab promptly.
3. Exclude the generated offline readiness report from Prettier so it does not break the repository check.

## Acceptance criteria

- The warning is visible on both public audience paths and before candidate/employer editing, including direct links.
- A stale tab cannot overwrite a newer saved scenario in the normal cross-tab flow. Its unsaved in-memory work remains exportable.
- Existing import, reset, corrupt-save and denied-storage behavior still work.
- The complete local verification gate passes, then the readiness audit is refreshed with evidence from this source version.

## Boundaries

No real authentication, central persistence, hosting, external monitoring, or production deployment is added. The chosen hosting service and live checks remain a separate decision.

## Verification and separate review

- `npm run check` passed: formatting, historical design kit, lint, types, 31 unit tests, the 120-row baseline packet, static build and 46 browser tests on local Edge. The build retains an advisory large-bundle warning.
- The new browser tests confirm the warning on both public audience paths and the workspace, and confirm that a stale tab cannot replace a newer local save while its in-memory state remains exportable. Existing corrupt-save, import/reset and storage-denial checks passed.
- The built `dist/` contained 35 files; no instructor/source, future-stage, `.env` or Git files were found by path inspection. Candidate and employer mobile screenshots were inspected at 390/320 px, including the warning; the workspace warning was inspected at 390 px.
- Review of `store.tsx` confirmed that import/reset remain explicit replacement actions and ordinary stale writes are stopped. LocalStorage does not provide an atomic compare-and-swap across truly simultaneous tabs, so this remains a release risk in the readiness report.
