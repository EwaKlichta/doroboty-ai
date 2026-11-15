# PostHog autocapture and session replay

## Scope and acceptance criteria

- Autocapture records button clicks on public routes: home, offers, company pages, methodology, and privacy. It excludes forms, account screens, and non-button interactions.
- Session replay is enabled in the browser SDK. Inputs, page text, and element attributes are masked. Images, iframes, video, canvas, and file inputs are blocked. Console logs, request headers, and request bodies are not recorded.
- The `before_send` filter removes extra autocapture properties, including referrers and URL parameters. A stable marker identifies the "Szukam pracowników" button.
- PostHog project 351745 permits autocapture (`autocapture_opt_out=false`) and enables replay (`session_recording_opt_in=true`). Project console and performance capture were disabled.
- The SDK follows project replay sampling and triggers; it does not force every session to record.

## Verification

- Clicking "Szukam pracowników" in a normal browser sent `$autocapture` with the button label and a URL without parameters. No explicit `capture()` call was added for the button.
- New local test recordings appeared in PostHog after the final non-forced start configuration. A representative recording is `01a1e149-a00b-7ba7-8808-e39c5f08edfd`.
- A synthetic marker entered into the search field did not appear in any `$autocapture` event properties in the checked interval (SQL count: 0).
- Submitting the public search form generated no `$autocapture` click for its button (SQL count: 0). A second synthetic marker from that form was also absent from autocapture event properties (SQL count: 0).
- The latest SDK emitted `$elements_chain` without `$elements`; the event filter now accepts both SDK formats and replaces the selector with a safe `button` marker. The "Szukam pracowników" click arrived in PostHog after this fix.
- Repository checks passed after review fixes: Prettier, design-system integrity and kit checks, ESLint, TypeScript, 36 unit tests, participant packet verification, and Vite build. Playwright passed 49/50 tests in the parallel run; the local Fraunces font check passed on an isolated rerun. The full gate could not run through `npm run check` because `npm` is unavailable in this environment, so its steps were invoked directly with Node and an existing local preview server.

## Release

Merge the reviewed PR and let Netlify build from `main`. After publishing, verify an autocapture event and a new replay from the production domain in [PostHog Replay](https://eu.posthog.com/project/351745/replay).
