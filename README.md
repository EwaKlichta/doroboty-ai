# DoRoboty.ai — AIPH3 prototype

A frontend-only job marketplace for participants to extend and test. Built with React, TypeScript and Vite, using Base UI components. The entire application follows Ewa's [selected illustrated direction](docs/design-system/SELECTED-DIRECTION.md): Fraunces + DM Sans, purple/lime and original people artwork.

## Design system — start here for UI work

Current visual authority for every screen: [SELECTED-DIRECTION.md](docs/design-system/SELECTED-DIRECTION.md), with [GUI.md](GUI.md) as a short implementation guide. Preserve behavior and accessible interaction patterns.

The previous 67-file Poster People kit is preserved under docs/design-system/agent-kit for historical reference and integrity checks. Its typography, palette and component measurements are no longer visual targets for the running app.

```sh
npm run design-system:check
npm run design-system:dev
```

With Node 24, the first command verifies the preserved kit and examples; the second serves a historical preview at http://127.0.0.1:8952/. The main app uses port 3001 as below.

Build UI using the selected direction and existing React/Base UI components. Preserve application behavior and hash routing; do not replace product state with the standalone demo fixtures/controllers. Compare the affected screen on desktop and mobile, including long content, focus and error states. Passing kit checks alone does not verify the running app.

## Run

Requirements: **Node.js 24 and npm**.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3001. No environment file, account, database or additional service is required. Package installation requires access to the npm registry.

Select Anna or Marek as a candidate, Karolina or Tomasz as an employer, or the instructor. Publish a job, apply, switch person and record the employer decision. Changes survive reload in this browser; settings provide export, import and reset. AI and scores simulate prepared scenarios. Use example CVs only.

## Build and verify

```sh
npm run build
npm run preview
./scripts/verify
```

The static output is dist/. Browser checks require an already provisioned Playwright Chromium; starting the app never installs it. See [participant guide](docs/PARTICIPANT_GUIDE.md), [architecture](docs/architecture.md), [current features](FEATURES.md) and [case protocol](docs/case/CASE_PROTOCOL.md).

To distribute a baseline participant package, run npm run package:participant -- /absolute/output/directory. This excludes Git history and instructor source material. Never distribute this repository’s history as a stage-safe packet.
