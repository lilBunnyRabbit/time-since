# Time Since - Svelte 5 PWA

A progressive web app for tracking time since events happened. Reset timers and view history of resets with duration between them.

## Quick Start
```bash
bun install
bun dev
```

## Tech Stack
- **Svelte 5** with runes (`$state`, `$derived`, `$effect`, `$props`)
- **TypeScript**
- **Vite** + **vite-plugin-pwa**
- **Tailwind CSS** via `@tailwindcss/vite`
- **bits-ui** for UI primitives
- **@lucide/svelte** / **phosphor-svelte** for icons

## Code Style

- **snake_case** for variables, functions, properties, and file names
- **PascalCase** for types, interfaces, classes, and components
- Svelte 5 runes only - no legacy `export let`, `$:`, or `createEventDispatcher()`
- TypeScript with `<script lang="ts">` and explicit prop interfaces (no `any`)

## Project Structure
```
src/
  main.ts          # Entry point
  App.svelte       # Root component
  app.css          # Global styles
  lib/             # Application code
public/            # Static assets (PWA icons, etc.)
```

## Key Files
- `vite.config.ts` - Vite config with PWA manifest, Tailwind, and version plugin
- `index.html` - Entry HTML
- `components.json` - shadcn-svelte component config
