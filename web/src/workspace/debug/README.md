# workspace/debug

Archived "debugging" surface for the panel workspace. The homepage mounts the
**content** variant (`<Workspace variant="content" />`) — borderless, Atlas-fed,
no command line. These pieces power the standalone **debug** workspace at
`/workspace` instead, and are kept here so the terminal line, scratch panels, and
console can be reintroduced as optional features later.

- `CommandLine.tsx` — the `›` console (open/list/snap/maximize… ; `help`).
- `DebugPanels.tsx` — placeholder per-type content (notes, file-browser,
  preview, terminal, settings).

The engine itself (`controller.ts`, `drag.ts`, `snap.ts`, `store.ts`, the
floating/snap components) is shared by both variants.
