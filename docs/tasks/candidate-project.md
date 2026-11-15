# Candidate project evidence

Slug: `candidate-project`
Created: 2026-11-15

## Goal

Build the selected O01/I01 first slice: a candidate explains and documents one project, checks the employer view, then deliberately attaches a snapshot to an application.

## Context

The November 2 discovery choice excludes collaborator verification. Candidates need to distinguish their contribution from team work without exposing client materials. Employers need concrete grounds for questions before an invitation. This is a fictional teaching case; technical checks are not user evidence.

## Plan

- Extend the existing local schema with backward-compatible candidate project drafts and optional submitted snapshots.
- Add a three-part editor, review, recoverable draft and application attachment.
- Reuse the same reading component in candidate preview and employer application.
- Verify role boundaries, snapshot immutability, missing materials, invalid URLs, reload and responsive layouts.

## Acceptance Criteria

- A candidate can describe context, own actions, team actions and result, then provide an HTTPS material link with explanation or explicitly explain why no material is available.
- Work survives refresh; validation keeps content and focuses the first issue.
- A preview clearly labels candidate declarations and missing evidence without a competence score.
- Only an explicitly selected, complete project is attached; later edits do not alter a sent application.
- Existing saves, export/import, reset and old application journeys remain compatible.
- Desktop/mobile and the repository verification gate pass.

## Files / Areas

`src/features/projects`, prototype model/routing/application, shared navigation, `tests/e2e`, `FEATURES.md`.

## Risks

Structured text can still be polished fiction. Link presence is not independent verification. No file upload or external sharing service is introduced. One project per candidate is the intentional prototype scope.

## Handoff Notes

Usability study and observations belong in the parent project's discovery folder. No real participants have been tested.

## Verification and separate review

- All repository verification stages ran: formatting, immutable 67-file kit plus its six tests, lint, types, 31 unit tests, baseline packet and production build. The complete browser suite passed 44/44 using the installed Edge. The initial sandbox prevented local server access; browser verification ran with approved local access.
- The first browser pass found duplicate/unlabelled landmarks and old keyboard expectations that omitted the new project link. Added landmark names and a labelled account region; updated keyboard coverage without removing legacy content-preservation assertions.
- A separate review checked candidate ownership, invalid/old imports, unsafe links, explicit attachment, incomplete drafts, stale selection after editing and immutable submitted copies. Corrected incomplete-project selection and premature validation messages.
- Inspected actual desktop, 390px and 320px screenshots with loaded Fraunces/DM Sans. Moved optional coaching below the mobile form. A final narrow-screen adjustment keeps all three record tabs inside the card; focused verification is recorded below.
- Preview: http://127.0.0.1:3001/#/auth/sign-in?audience=candidate&next=%2Fapp%2Fprojekty (existing local server returned HTTP 200 for the app and the new editor module). Browser-panel opening was queued by Codex.
- Screenshots: `artifacts/project-editor-desktop.png`, `project-editor-mobile.png`, `project-material-mobile.png`, `project-employer-desktop.png`, `project-employer-mobile.png`, `project-start-desktop.png`.
- Build retains non-blocking bundle-size and third-party annotation warnings. No publication, CI run or human study is claimed.
- Final focused verification after the tab-spacing correction: 2/2 browser journeys passed, including the explicit assertion that the CV tab remains inside the record card at 390px and 320px. Screenshots were refreshed.
