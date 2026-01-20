# AGENTS.md

## Project Snapshot
- Vite + TanStack Start + React 19 application.
- TypeScript strict mode with bundler module resolution.
- Tailwind CSS v4; class sorting enforced by Biome.
- Data layer: Drizzle ORM + ElectricSQL + Postgres.
- Auth: better-auth with client/server helpers.

## Package Manager + Runtime
- Package manager: `pnpm` (lockfile: `pnpm-lock.yaml`).
- Node runs in ES module mode (`"type": "module"`).

## Build / Run Commands
- Install deps: `pnpm install`
- Dev server: `pnpm dev` (Vite on port 3000)
- Production build: `pnpm build`
- Preview build: `pnpm preview`

## Lint / Format Commands
- Lint only: `pnpm lint` (Biome lint)
- Format only: `pnpm format` (Biome format)
- Full check: `pnpm check` (Biome check)

## Unit / Component Tests (Vitest)
- Run all tests: `pnpm test`
- Run a single file: `pnpm test -- path/to/file.test.ts`
- Run by test name: `pnpm test -- -t "test name"`
- Watch mode: `pnpm vitest`

## E2E Tests (Playwright)
- Run all E2E tests: `pnpm exec playwright test`
- Run a single spec: `pnpm exec playwright test tests/example.spec.ts`
- Run by test name: `pnpm exec playwright test -g "has title"`
- UI mode: `pnpm exec playwright test --ui`

## Database / Drizzle Commands
- Generate migrations: `pnpm db:generate`
- Run migrations: `pnpm db:migrate`
- Push schema: `pnpm db:push`
- Pull schema: `pnpm db:pull`
- Studio UI: `pnpm db:studio`

## Environment + Secrets
- Local env file: `.env.local` (contains credentials).
- Never commit or log secrets; avoid copying `.env.local` content.
- Expected vars include `DATABASE_URL`, `BETTER_AUTH_*`, `ELECTRIC_*`.

## Code Style (General)
- Format with Biome; avoid manual formatting.
- Indentation: spaces (Biome default).
- Quotes: double quotes for JS/TS (Biome config).
- Prefer `const`; use `let` only when reassigned.
- Keep functions focused; use early returns for invalid state.
- Avoid deep nesting; extract helpers when complexity grows.
- Use `type` imports for type-only symbols.

## Naming + Files
- Components: PascalCase function components.
- Hooks: `useSomething` and live in `src/hooks`.
- Route files: export `Route` from TanStack router.
- File names: kebab-case for components and routes.
- Zod schemas: `selectFooSchema`, `insertFooSchema` patterns.

## Imports
- Order imports: external, internal (`@/`), then relative.
- Use the `@/` alias for `src/` paths.
- Let Biome organize imports; avoid manual sorting.
- Prefer named exports; default exports only when established.

## React + UI Conventions
- Function components + hooks only.
- Use `Activity` for conditional visibility where established.
- Tailwind class merging via `cn()` from `src/lib/utils.ts`.
- Tailwind classes should stay sorted (Biome warns otherwise).
- Keep JSX readable; split long prop lists across lines.

## TypeScript Guidelines
- `strict` is enabled; avoid `any`.
- Handle nullable values explicitly (e.g., `session?.user`).
- Avoid non-null assertions unless config guarantees them.
- Prefer explicit return types for exported helpers.

## Routing + Server Handlers
- File routes in `src/routes`; API routes in `src/routes/api`.
- Server handlers return `Response` objects.
- Preserve status/headers when proxying responses.
- Never expose secrets to the client.

## Data + Validation
- Drizzle schemas live in `src/db/schema`.
- Zod schemas in `src/lib/validators.ts`.
- Validate at boundaries (API handlers, forms).

## Error Handling
- Use early returns for invalid inputs.
- Bubble errors to callers when possible.
- Add context when rethrowing; avoid silent failures.

## Testing Notes
- Vitest is the unit/component runner; prefer Testing Library.
- Playwright tests live under `tests/`.
- Keep E2E specs independent and deterministic.

## Generated / Special Files
- `src/routeTree.gen.ts` is generated; do not edit manually.
- `src/styles.css` is excluded from Biome formatting.

## Cursor / Copilot Rules
- No `.cursor/rules`, `.cursorrules`, or Copilot instructions found.
- If added later, mirror them here.

## Suggested Agent Workflow
- Pull latest changes before starting work.
- Run `pnpm lint` and targeted tests for touched areas.
- Use `pnpm check` before final review.
- Keep changes minimal and scoped to the task.

## Quick References
- Vite config: `vite.config.ts`
- TypeScript config: `tsconfig.json`
- Biome config: `biome.json`
- Drizzle config: `drizzle.config.ts`
- Playwright config: `playwright.config.ts`

## Context7 + GitHub MCP Mappings
- Prefer official MCP tools first, then Context7, then GitHub MCP.
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
