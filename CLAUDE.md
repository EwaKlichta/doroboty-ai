> **Current visual authority (2026-11-15):** Ewa requires the entire application to follow [SELECTED-DIRECTION.md](docs/design-system/SELECTED-DIRECTION.md). Preserve product behavior and the immutable historical kit.

@AGENTS.md

Start with npm ci and npm run dev. Do not infer work from historical course material. Keep durable task notes in docs/tasks and review the actual diff before claiming completion.

## UI work

Read [selected direction](docs/design-system/SELECTED-DIRECTION.md) and [GUI.md](GUI.md). Apply that visual system to every screen through existing React features, Base UI controls and host tokens. Preserve hash routing, Zod, persona data, localStorage and application/employer workflows.

The older Poster People kit remains immutable in docs/design-system/agent-kit as a historical reference; `npm run design-system:check` verifies it. The main app runs at port 3001. Validate desktop/mobile, long content, keyboard and state behavior; run ./scripts/verify, update FEATURES.md for behavior changes and report actual evidence.
