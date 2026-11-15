# PostHog browser events

## Intent and acceptance

Add PostHog browser analytics to the Vite prototype so a reviewer can inspect navigation and key
workflow events after supplying the EU project configuration. Keep scenario content and identity fields out
of event payloads. The change is ready for review when the build and verification gate pass, the PR
is open, and no production deployment has been made from this branch.

## Event contract

| Event                       | Trigger                                                | Sent properties                                               |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| `$pageview`                 | First rendered hash route and subsequent route changes | Normalized route template and URL without parameters or query |
| `application_submitted`     | Successful local submit                                | No product properties                                         |
| `job_saved`                 | Successful local job save                              | No product properties                                         |
| `recruitment_stage_changed` | Successful local employer stage change                 | No product properties                                         |
| `project_saved`             | Successful local project save                          | No product properties                                         |

PostHog is inactive when either `VITE_POSTHOG_PROJECT_TOKEN` or `VITE_POSTHOG_HOST` is absent.
Use `.env.example` for variable names and set the real values in local `.env.local` or the Netlify
environment. Do not put them in Git. The selected project is PostHog EU `351745`; its ingestion host
is `https://eu.i.posthog.com`.

The SDK uses memory persistence, does not create person profiles, and disables autocapture, automatic
pageviews/pageleaves, session recording, exceptions, performance capture, surveys and web experiments.
`before_send` rejects all unexpected events and keeps only the sanitized route and URL on pageviews,
plus `$process_person_profile: false` on all allowed events. No persona, job, company, application or
project identifier is sent.

## Wizard outcome

The cloud Wizard run `01a1e0f0-45d6-79fb-891e-93fc97a7c611` failed with `PHW_CLI_BAD_ARGS` and
created no PR. The local `npx -y @posthog/wizard@latest` command downloaded its dependencies but did
not reach a prompt or modify the repository, so it was stopped. The integration is implemented and
reviewed in this branch using PostHog's current React SDK documentation.

## Verification

`npm run format:check`, design-system integrity, lint, typecheck, 35 unit tests, baseline packet
verification and Vite build passed. The 50 Playwright journeys passed using installed Edge. The
default Chromium run could not launch because Playwright Chromium is not provisioned here. A separate
source review checked the event allowlist, route normalization, privacy wording and build output.
The build reports a JavaScript chunk of 1,048 kB (348 kB gzip); this is a performance follow-up, not
a failing gate. No live PostHog ingestion or Netlify configuration has been verified yet; those require
deployment after review.
