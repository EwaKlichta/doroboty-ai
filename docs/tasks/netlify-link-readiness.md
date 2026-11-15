# Link the prototype to Netlify

## Goal

Connect this prototype folder to Ewa's existing Netlify project and verify what remains before public release. Do not deploy as part of this task.

## Local configuration

- The Vite project root is this repository; `npm run build` produces `dist/`.
- `netlify.toml` sets that command, publish directory and Node 24.
- The application uses hash routes, so it does not need an SPA path rewrite.
- `.netlify/` is ignored because the CLI site link stores its local state there.

## Acceptance criteria

1. Verify the target Netlify project by its dashboard URL or Site ID before linking. Do not use a different site merely because it is visible in another account.
2. Inspect the site's existing Git connection and build settings. Linking the local folder must not overwrite a live deploy.
3. Run the local build and release checks for the current source version.
4. Update the production readiness report with confirmed Netlify facts; leave inaccessible settings and the deployed smoke check unverified.

## Current blocker

The connected Netlify account lists only `do-nothing-f87fb8`. The supplied `app.netlify.com/signup/start/connect/repos/EwaKlichta%2Fdoroboty-ai` URL leads to sign-up, not to an existing project detail page. The target project's Site ID is not yet known, so a local CLI link must wait for its identity or access to the correct account.

## Verification on 2026-11-15

- Parsed `netlify.toml`; it selects `npm run build`, `dist/` and Node 24. The application uses hash routes, so no catch-all rewrite is required.
- Format, historical design kit, lint, types, 32 unit tests, baseline packet verification and the production build passed. `scripts/release.py prepare` produced the same 35-file archive identity as the previously restored release.
- The browser test runner did not produce a result in this environment, even with the installed Edge channel and two workers. Previous Edge results remain in the report history, but the new audit does not count them as freshly verified.
- The official report validates at 7/18 preparation requirements (38%). The target Netlify configuration, limits, account access, rollback and live smoke test remain open.
- `FEATURES.md` was reviewed; this change only configures delivery and does not change application behavior.
- Browser preview of the local HTML report was unavailable because the in-app browser could not reach the local HTTP server. The report passed its official structural validator.

## Follow-up verification on 2026-11-15

- The complete `npm run check` gate passed outside the restricted browser sandbox with the installed Edge channel: 32 unit tests and 50 browser tests. The browser suite covered public, candidate, employer and case screens, candidate projects, local fonts, accessibility and layout at 1440, 390 and 320 px.
- `npm audit --omit=dev --json` reported zero vulnerabilities in production dependencies.
- The official readiness report was refreshed for the staged source version and validates at 12/18 preparation requirements (66%). The remaining six depend on confirming the target Netlify project, capacity, account access, publication and rollback.
