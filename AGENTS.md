# AGENTS.md

## Cursor Cloud specific instructions

This is a frontend-only React + TypeScript app built with Vite, using shadcn/ui and Tailwind CSS. There is no backend, database, or external API dependency.

### Services

| Service | Command | Port |
|---------|---------|------|
| Dev server | `npm run dev` | 8080 |

### Standard commands

See `package.json` scripts for lint (`npm run lint`), test (`npm test`), build (`npm run build`), and dev server (`npm run dev`).

### Notes

- ESLint has 3 pre-existing errors and 10 warnings in generated shadcn/ui components and `tailwind.config.ts`. These are not regressions.
- The app uses in-memory state (React Context) — all data is lost on refresh. No persistence layer exists.
- Both `package-lock.json` (npm) and `bun.lockb` (Bun) lockfiles exist; use **npm** as the package manager (matches README instructions).
- Vite dev server binds to `::` (all interfaces) on port **8080**, configured in `vite.config.ts`.
