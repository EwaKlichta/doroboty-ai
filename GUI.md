> **Current visual authority (2026-11-15):** Ewa requires the entire application to follow [SELECTED-DIRECTION.md](docs/design-system/SELECTED-DIRECTION.md). Preserve product behavior and the immutable historical kit.

# GUI — DoRoboty.ai selected illustrated direction

The entire application uses Fraunces headings, DM Sans UI, paper and white working surfaces, purple actions, lavender selection, occasional lime highlights, rounded controls and original hand-drawn people. [SELECTED-DIRECTION.md](docs/design-system/SELECTED-DIRECTION.md) records the visual roles and scope. The older Poster People kit is historical reference only.

## Implementation

- Map selected roles through `tokens.css`, `src/app/selected-theme.css` and `src/app/selected-app.css`; the homepage layout is in `src/app/landing.css`.
- Reuse React/Base UI controls, JobCard, SalaryFact and current hash routes, Zod checks, persona data and local workflows. Keep original people artwork and local font files with licenses in `src/assets/selected/`.
- Polish category names come first; persistent labels, explicit unknown salary, complete wrapping of long titles and comfortable touch targets apply to the whole app.

## Verification

- Run `npm run check`, inspect desktop/mobile screens and verify actual font loading, no overflow, keyboard focus, long content, empty and error states.
- `npm run design-system:check` verifies only that the older 67-file kit is unchanged.
- Record actual outcomes in [the integration task](docs/tasks/selected-landing-integration.md). Do not treat a screenshot as proof of usability or conversion.

Keep search outside mobile filters, preserve copied section URLs under HashRouter and manage focus after chip removal. The preserved kit's old screenshots and measurements do not define current visual acceptance.
