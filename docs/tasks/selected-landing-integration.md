# Integrate Ewa's selected direction across the application

## Intent and authority

On November 8, 2026, Ewa requested transferring the local landing into her cloned application. On November 15, she explicitly expanded the scope to the **whole application**. Her selected Fraunces / DM Sans, purple / lime, illustrated direction supersedes the previous Poster People visual requirement for this working copy. Preserve the immutable agent kit and application domain, persistence and role boundaries.

## Acceptance

- Reproduce candidate/employer entry, corrected illustration caption, categories, search, offers, process, publication choices and FAQ on desktop/mobile.
- Use published jobs and shared JobCard/SalaryFact; connect actions to existing detail/application/editor routes.
- Preserve filter state across audience changes, mobile navigation, keyboard dialogs, local fonts and no overflow.
- Carry selected font/color roles through shared components; retain semantic Match Score colors.
- Apply selected typography, color, rounded surfaces, navigation, form fields and action hierarchy to listing/detail, company, candidate, employer, settings and case screens.
- Put Polish category names first, keep labels visible, show missing salary honestly, and let cards grow for long content.
- Update visual authority and FEATURES.md, run repository verification and review the diff.

## Sources and adaptations

Source: sibling `2026-11-08-fresh-landing/index.html`, original people.svg and OFL fonts; application-wide rules come from the requested `doroboty-ui` skill. Original prototype and immutable kit remain unchanged. Home belongs to home.tsx/landing.css; shared appearance belongs to tokens, selected-theme.css and selected-app.css. Domain/store/shared controls retain ownership.

Candidate answers are written directly; do not promise the absent AI assistant. Local publishing works, but billing/purchased plans do not. Use the app's fictional jobs rather than the standalone fixtures.

## Verification

Completed locally on November 15, 2026:

- `npm run check` passed: Prettier, ESLint, TypeScript, 27 unit tests, 67-file historical kit integrity, baseline packet verification, production build and 42 Edge browser tests.
- Browser checks visited public pages, offer listing/detail, company, candidate application/profile/saved/history, employer dashboard/editor/organization/recruiting record, settings and the case workspace at 1440, 390 and 320 px. They asserted loaded Fraunces/DM Sans and no document-level horizontal overflow. Existing journeys also cover keyboard focus, dialogs, empty/error/recovery states and application → employer decision.
- Published a synthetic long Polish job title with a long location and no salary in an isolated browser test. The mobile card grew vertically and displayed “Wynagrodzenie: nie podano”.
- Reviewed saved screenshots in `artifacts/selected-app/` for listing, offer, application, candidate and employer dashboards, editor, recruiting record and the long-title case. Checked the mobile company-name wrap and 320 px salary row after adjustments. `git diff --check` passed; the immutable reference kit has no content diff.
- Started the local Vite app at `http://127.0.0.1:3001/` and confirmed HTTP 200.

The browser tests and screenshots verify implementation behavior and layout; they are not a usability study or evidence of conversion. The course prototype remains local and uses fictional scenario data.
