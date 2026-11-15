> **Current visual authority (2026-11-15):** Ewa requires the entire application to follow her selected doroboty.ai visual direction. Follow [SELECTED-DIRECTION.md](docs/design-system/SELECTED-DIRECTION.md) for public, candidate, employer and case screens. Preserve the immutable historical kit and all product, role, persistence and accessibility contracts.

# Working on DoRoboty.ai Case

This is an AIPH3 teaching prototype, separate from the public production portal.
Read BRIEF.md, docs/case/CASE_PROTOCOL.md, TODO.md and relevant FEATURES.md entries before product work.

## Start and boundaries

- Participant setup: Node.js 24, npm ci, npm run dev (http://127.0.0.1:3001).
- Role selection is a simulation, not security.
- Share plain Zod schemas between forms and domain operations.
- Preserve human editing and approval. Use synthetic data only.
- Keep historical case evidence separate from prototype state. Include only baseline in participant packages; source history and instructor materials must not be distributed.

## Workflow

1. Record intent and acceptance criteria in docs/tasks/ for changes larger than one line.
2. Do not let multiple agents write in one worktree.
3. Implement and run ./scripts/verify before claiming completion; explain actual failures.
4. Perform a separate review pass before merging. Record durable lessons when useful.

## Product behavior register

FEATURES.md describes current behavior, not a roadmap. Update it in the same change/commit for added, changed, removed or simulated flows. Preserve stable IDs, route/role/data boundaries and source/test references. Do not equate source coverage with an executed test or deployment. For changes without behavioral impact, record that the register was reviewed and did not need updating.

## Required design system

Apply [SELECTED-DIRECTION.md](docs/design-system/SELECTED-DIRECTION.md) across the whole application. It records Ewa's selected Fraunces + DM Sans, paper/white/ink, purple/lime/lavender, rounded cards and fields, and original people illustration. [GUI.md](GUI.md) is the short implementation entry point. Keep the existing React/Base UI components, hash routes, domain data and local persistence.

The 67-file Poster People kit in docs/design-system/agent-kit is preserved for historical reference and integrity checks. It is not the source of current visual values. Do not import its example controllers, fixtures, body reset or string renderer into product React code. Run `npm run design-system:check` to ensure preservation, and compare every changed screen at desktop/mobile widths, with long content, keyboard, empty and error states.

## Standards

- Code, comments and authored engineering documentation are English; end-user UI and canonical AIPH source wording are Polish.
- Use npm, Node.js 24 and package-lock.json. No second package manager.
- Features belong in src/features; src/components/ui contains shared Base UI primitives.
- For UI changes follow GUI.md and SELECTED-DIRECTION.md with the existing Base UI components and render composition API.
- Use React Router hash routes.
- Never log private free text or introduce secrets into the frontend.

## Validation

- npm run check verifies formatting, lint, types, unit tests, static build and browser journeys. ./scripts/verify runs the same gate.
- npm run dev never installs browser binaries or system tools. Browser tests require a provisioned Playwright Chromium; if missing, report it. Do not install OS dependencies automatically.
- Check mobile/desktop, keyboard access, error states and data recovery.
- Report what actually ran. Local checks do not prove CI, publishing or human approval.
