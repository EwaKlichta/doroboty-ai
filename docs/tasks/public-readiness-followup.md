# Public readiness follow-up

## Goal

Resolve local release blockers for a public, synthetic-only teaching prototype and prepare the checks that require a deployed address.

## Context and decisions

- On 2026-11-15 Ewa asked to repair confirmed publication blockers, reassess, and guide verification of unknowns.
- Ewa confirmed that the public link should remain available for several weeks.
- This is a short exercise with fictional data. Recovering work after browser data is cleared, without an earlier export, is not required.
- Hosting has not been selected. On 2026-11-15 Ewa asked to postpone hosting research and focus on fixing errors.

## Local acceptance criteria

1. Only one tab can write this browser-local scenario at a time. A second tab keeps the option to inspect and export its in-memory state; it cannot reset or import over the active tab. The lock releases on close or refresh.
2. A missing browser locking API fails closed for persistence with a clear message, without erasing an existing save.
3. The full repository verification gate passes, and a fresh production-readiness audit records the actual result and remaining provider-dependent checks.

## Verification

- An exclusive Web Lock now guards localStorage writes. A second tab cannot persist, import or reset, and a browser without Web Locks cannot overwrite an existing save.
- Edge browser tests cover concurrent tabs, release after close, import, reset, missing Web Locks, corrupt storage and denied storage.
- The public URL smoke check and operational monitoring require a selected host and address. They remain open for the later deployment review.

## Local report follow-up

On 2026-11-15 Ewa clarified that she will deploy separately and requested a report about the local version only. The local HTML report must show the executed code and browser checks, confirmed local defects and remaining local limitations. Hosting, public monitoring and live use belong to a later assessment and must not reduce the local result.

Superseded by Ewa's explicit instruction to follow production-readiness exactly: the official report evaluates preparation on local sources, including unresolved mandatory preparation requirements. Deployment and observation remain in their own stages. The manually narrowed local score was withdrawn.

## Writer lifecycle repair

The latest user instruction authorizes repair of the failed writer-lock handoff. Release the lock explicitly on `pagehide`, without waiting for React unmount or document destruction. A page restored from the browser back/forward cache must reload state and reacquire ownership before editing. Verify close, navigation/return and existing import/reset safeguards, then refresh the official production-readiness report. Keep all unresolved baseline preparation requirements in its denominator.

## Boundaries

No authentication, backend, central persistence, external telemetry account or public deployment is introduced locally. Use only fictional fixtures.

## Remaining readiness package

Ewa authorized continuing with remaining readiness defects and explicitly limited work to this skill. Local diagnostic capture/export addresses `observability-preparation`; migration and old-reader rehearsal address `migrations`; checksum archives and isolated restoration address `repeatable-release` and local recovery rehearsal; RELEASE.md addresses `smoke-plan`, `rollback`, `incident-owner`, `capacity` and `recovery-plan`. Actual provider configuration, account access, rollback, delivered availability alerts and capacity limits cannot be marked verified before host selection. Ewa confirmed ownership, up to 30 users and recovery by the next day on 2026-11-15.

## Final local verification of the package

- Writer close and navigation/return scenarios passed 10 repeated Edge checks, without increasing the 5-second lock-release expectation.
- The full gate passed in Edge: 32 unit tests, 50 browser tests, build, lint, types, formatting, historical kit and baseline packet verification. An earlier invocation without the Edge channel could not start unprovisioned Chromium; the final gate used the installed browser.
- The diagnostic export test verified 50-entry bounding, session persistence, rejection of unexpected fields and exclusion of error/free text. A controlled render exception on an isolated restored build displayed the fallback and exported `render-error` without exception text.
- Migration was rehearsed against the actual baseline model from commit `81682a81c186e9065ec8fab4d7bd368556fdfe6a`: load, save/export, previous-reader roundtrip and original-export restoration passed. The generated fictional baseline export is retained as a regression fixture.
- `scripts/release.py prepare` and `restore` produced and restored archive identity `b66f34130169754f9d1ab5ac61e82d26e1b34bf71e1606a3ba581dc60f827108`. All 35 static asset checksums matched over local HTTP, and a fictional profile save survived reload in the restored app. This is a local recovery rehearsal of the current release, not a verified rollback of a public deployment.
