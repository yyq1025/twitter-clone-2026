# AGENTS.md

## Project Overview
- Vite + TanStack Start + React 19 app.
- TypeScript-first, strict compiler options enabled.
- Styling is Tailwind CSS v4 with utility-first classes.
- Data layer uses Drizzle ORM, ElectricSQL, and Postgres.
- Uses Biome for formatting + linting.

## Tooling + Package Manager
- Package manager: `pnpm` (lockfile: `pnpm-lock.yaml`).
- Node is assumed to support ES modules (`"type": "module"`).

## Build / Run Commands
- Install deps: `pnpm install`
- Dev server: `pnpm dev` (runs Vite on port 3000)
- Production build: `pnpm build`
- Preview build: `pnpm preview`

## Lint / Format Commands
- Lint only: `pnpm lint` (Biome lint)
- Format only: `pnpm format` (Biome format)
- Lint + format + code checks: `pnpm check` (Biome check)

## Test Commands (Vitest)
- Run all tests: `pnpm test`
- Run a single test file: `pnpm test -- path/to/file.test.ts`
- Run tests by name: `pnpm test -- -t "test name"`
- Watch mode (if needed): `pnpm vitest` (not in scripts; use directly)

## Database / Drizzle Commands
- Generate migrations: `pnpm db:generate`
- Run migrations: `pnpm db:migrate`
- Push schema: `pnpm db:push`
- Pull schema: `pnpm db:pull`
- DB studio UI: `pnpm db:studio`

## Environment + Secrets
- Local env file: `.env.local` (contains credentials).
- Never commit or log secrets; avoid copying `.env.local`.
- Required vars include: `DATABASE_URL`, `BETTER_AUTH_*`, `ELECTRIC_*`.

## Code Style (General)
- Format with Biome; do not hand-format.
- Indentation: spaces (Biome default).
- Strings: double quotes in JS/TS (Biome config).
- Prefer `const` and `readonly` where possible.
- Use `type` imports for type-only symbols (e.g., `import type { Foo }`)
- Avoid one-letter variable names; prefer descriptive names.
- Keep functions focused; avoid deep nesting.

## Imports
- Use path aliases from `tsconfig` (`@/` for `src/`).
- Group imports by source: external, internal (`@/`), then relative.
- Let Biome organize imports; avoid manual sorting.
- Prefer named exports over default unless pattern demands.

## React + UI Conventions
- Components are written as function components.
- Prefer hooks for state (`useState`, `useEffect`, `useLiveQuery`).
- Use `Activity` for conditional visibility behavior where shown.
- For class names, use `cn()` helper from `src/lib/utils.ts`.
- Tailwind classes should be sorted; Biome warns on unsorted classes.
- Keep JSX readable; split long props onto new lines.

## TypeScript Guidelines
- `strict` mode is enabled; no `any` unless unavoidable.
- Handle nullable values explicitly (e.g., `session?.user`).
- Avoid `!` non-null assertions unless config/infra guarantees.
- Prefer explicit return types for exported helpers where useful.

## Routing + Server Handlers
- File-based routes live under `src/routes` (TanStack Router).
- API routes live under `src/routes/api`.
- Server handlers should return `Response` objects.
- Avoid leaking secrets to the client.

## Data + Validation
- Drizzle schemas under `src/db/schema`.
- Validators in `src/lib/validators` (Zod/Drizzle Zod).
- Prefer Zod validation at boundaries (API, forms).

## Error Handling
- Use early returns for invalid state.
- Bubble errors to callers when possible.
- For fetch proxy handlers, preserve status/headers.
- Avoid swallowing exceptions; add context when rethrowing.

## Testing Notes
- No test files currently found in repo.
- When adding tests, colocate with feature or use `src/**/__tests__`.
- Prefer Testing Library (`@testing-library/react`).

## File/Generated Assets
- `src/routeTree.gen.ts` is generated; avoid manual edits.
- `src/styles.css` is excluded from Biome format rules.

## Cursor / Copilot Rules
- No `.cursor/rules`, `.cursorrules`, or Copilot rules found.
- If added later, mirror them here.

## Suggested Agent Workflow
- Start with `pnpm lint` and `pnpm test` for verification.
- Use `pnpm check` before final review.
- Keep changes minimal and scoped to the task.

## Quick References
- Vite config: `vite.config.ts`
- TypeScript config: `tsconfig.json`
- Biome config: `biome.json`
- Drizzle config: `drizzle.config.ts`

## Context7 + GitHub MCP Mappings
- Prefer official MCP tools first (if available), then Context7 MCP, then GitHub MCP.
- Frameworks
  - `react`: Context7 `/reactjs/react.dev`; GitHub `facebook/react`
  - `@tanstack/react-router`: Context7 `/tanstack/router`; GitHub `TanStack/router`
  - `@tanstack/react-start`: Context7 `/websites/tanstack_start`; GitHub `TanStack/router`
- UI + UX
  - `tailwindcss`: Context7 `/tailwindlabs/tailwindcss.com`; GitHub `tailwindlabs/tailwindcss`
  - `@tanstack/react-form`: Context7 `/tanstack/form`; GitHub `TanStack/form`
  - `@tanstack/react-virtual`: Context7 `/websites/tanstack_virtual`; GitHub `TanStack/virtual`
- Data Layer
  - `drizzle-orm`: Context7 `/drizzle-team/drizzle-orm-docs`; GitHub `drizzle-team/drizzle-orm`
  - `@tanstack/react-db`: Context7 `/tanstack/db`; GitHub `TanStack/db`
  - `@electric-sql/client`: Context7 `/electric-sql/electric`; GitHub `electric-sql/electric`
- Tooling
  - `vite`: Context7 `/vitejs/vite`; GitHub `vitejs/vite`
  - `vitest`: Context7 `/vitest-dev/vitest`; GitHub `vitest-dev/vitest`
  - `@biomejs/biome`: Context7 `/biomejs/biome`; GitHub `biomejs/biome`
