# Release and recovery procedure

This procedure addresses readiness items `repeatable-release`, `rollback`, `smoke-plan`, `capacity`, `incident-owner`, `recovery-plan` and `observability-preparation`. It does not publish anything.

## Agreed operating context

Ewa confirmed on 2026-11-15: up to 30 participants, a public link for several weeks, Ewa owns incident response, recovery by the next day. Only fictional disposable scenario data is allowed. Work lost after clearing browser data without export need not be recovered.

## Prepare the exact version

1. Use Node.js 24 and the committed lockfile. On a clean checkout run `npm ci`. Do not use real participant exports for verification.
2. Run `npm run check`. Stop if any required check fails.
3. Run `python scripts/release.py prepare` with Python 3.9+. It packages only `dist/`, records SHA-256 checksums in `release.json` and prints the immutable artifact identity and ZIP path under `artifacts/releases/`.
4. Keep the archive, the verified report and its source revision together in the release handoff. The archive contains public static files only; do not upload the repository, Git history or instructor materials.
5. Preserve the previous known working archive before an update. Public upload settings and credentials must be checked when the host is selected. Do not label the hosting procedure verified before this happens.

For Git-connected Netlify deploys, `netlify.toml` runs the build and `scripts/release.py prepare` in sequence. Netlify publishes `dist/`, including `release.json`; compare its ID with the prepared archive before admitting participants.

## Rehearse restoring a release locally

1. Run `python scripts/release.py restore ARCHIVE.zip` using a known working archive. Checksums are checked before writing into a fresh isolated directory. Existing application files and localStorage are not replaced.
2. Serve the printed restored directory over local HTTP, for example `python -m http.server 3107 --bind 127.0.0.1 --directory RESTORED_DIRECTORY`.
3. Verify `release.json` identifies the expected release and every static file matches its checksum. In a fresh browser context open the restored page, choose Anna, edit and save a fictional profile, reload, and confirm the change is still present.
4. Local rehearsal proves the static artifact can be recovered. The real hosting rollback and account access still need verification after service selection. This procedure never restores or overwrites a participant's browser data.

## Smoke check immediately after publication

Owner: Ewa, with the coding agent performing browser checks when access is available. Run before admitting participants and after every update, on the exact target address.

1. Confirm HTTPS and that `/release.json` has the expected artifact identity. Confirm referenced CSS, JS, font and sample PDF files return successfully.
2. In an isolated browser context choose Anna, browse an offer, save a fictional profile, reload, and confirm it persists. Use only prepared fictional data.
3. Submit a fictional application, switch to the employer persona, and confirm the submitted snapshot can be read. Check browser console errors and failed same-origin requests.
4. Open a second tab and check that it cannot replace the first tab's data; close the first, refresh the second and confirm editing works.
5. If identity, loading, persistence or a core journey fails, stop admission, record the failed step, and restore the previous verified static artifact. On the first release keep the link closed until corrected.

## Detect and respond to an incident

- Participants report to Ewa through the channel used to distribute the exercise link. Settings and the crash fallback explain this. Diagnostic export contains only fixed error codes and timestamps; it excludes entered text, CVs, full URLs and scenario exports.
- Ewa asks for the attempted action and the diagnostic export, without a real CV or scenario export. She opens a clean browser context to distinguish a broken public release from a single browser's storage problem.
- If the link is broken, Ewa checks the release identity, host deployment status and static asset responses. Restore the last verified archive when a release regression is confirmed, then repeat the smoke check before announcing recovery through the same distribution channel.
- Do not reset participants' local data during diagnosis. If the issue is limited to one browser, offer export before a reset. Unknown formats remain preserved by the app; do not import newer project data into an older app until compatibility has been checked.
- Target: restore service by the next day. Ewa needs deployment/rollback account access, a tested availability notification and a provider-specific rollback procedure before public use. These are open requirements until verified, not assumptions made by this document.

## Capacity check after host selection

Inspect the actual static bundle size and limits. A planning envelope for 30 people loading the whole static bundle 20 times each is `30 × 20 × bundle bytes`; it is an assumption to compare with the provider's transfer quota, not an observed usage limit. Review file limits, availability monitoring and spending controls. No paid API or backend is called by the app. Confirm quotas, the allowed outage and the owner account with Ewa before opening the link.

## Data format change and rollback

Version-1 saves before candidate projects have no `projects` field. The schema adds an empty array on read and preserves existing applications. The migration rehearsal checks both updated exports and rollback of an untouched legacy export using the old schema. Keep the original exported file before an update. New project fields cannot be assumed recoverable in an older application: export with the newer app first and reopen that same version to read projects. Do not downgrade an edited newer save in place.
