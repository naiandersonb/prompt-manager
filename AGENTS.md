# prompts-manager — AGENTS.md

## Quick start

```bash
pnpm install
docker compose up -d              # PostgreSQL 17 on :5432
pnpm db:migrate                   # apply migrations
pnpm db:generate                  # generate Prisma client → src/generated/prisma/
pnpm db:seed                      # seed 20 random prompts (via @faker-js/faker)
pnpm dev                          # next dev on :3000
```

## Commands

| Script | Command |
|---|---|
| `pnpm dev` | `next dev` |
| `pnpm build` | `next build` |
| `pnpm lint` | `eslint` |
| `pnpm test` | `jest` |
| `pnpm test:watch` | `jest --watch` |
| `pnpm test:coverage` | `jest --coverage` |
| `pnpm test:e2e` | `playwright test` |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:generate` | `prisma generate` |
| `pnpm db:seed` | `prisma db seed` (executes `tsx prisma/seed.ts`) |
| `pnpm db:studio` | `prisma studio` |

## Architecture

```
src/
├── app/            Next.js App Router pages & server actions
│   ├── actions/    "use server" actions (prompt.actions.ts)
│   ├── new/        /new page (PromptForm)
│   └── page.tsx    /     page (empty state)
├── core/
│   ├── domain/     Entities & repository interfaces
│   └── application/ Use cases & DTOs (zod schemas)
├── infra/
│   └── repository/ PrismaPromptRepository (implements domain interfaces)
├── components/     React components (shadcn/ui in ui/, feature components elsewhere)
├── lib/            prisma.ts (singleton), utils.ts (cn), test-utils.tsx (render)
└── generated/      prisma/ — gitignored, must run db:generate
```

- `@/` → `./src/*` (tsconfig paths)
- Sidebar is an **async server component** that reads prompts directly from DB.
- Server actions in `src/app/actions/` instantiate use cases with `PrismaPromptRepository`.

## DB setup

- **Env**: `DATABASE_URL=postgresql://postgres:password@localhost:5432/prompt_manager?schema=public`
- `.env` checked in (dev only). Never commit real secrets.
- Prisma client output: `src/generated/prisma/` (in `.gitignore` — must regenerate after pulls).
- Seed count controlled via `E2E_SEED_COUNT` env var (default 20).

## Testing

- **Jest** (jsdom), config in `jest.config.ts`, setup in `jest.setup.ts`.
- Use `@/lib/test-utils` (re-exports `@testing-library/react` with a custom `render`).
- Use `userEvent.setup()` (from `@testing-library/user-event`).
- Server actions are tested by **mocking the use case module** (`jest.mock`), not the infra layer.
- Repository tests mock the Prisma client delegate methods.
- Use cases mock the repository interface with `jest.fn()`.
- **Playwright** for e2e tests (`pnpm test:e2e`), config in `playwright.config.ts`, tests in `e2e/`.
  - Web server auto-starts on `http://localhost:3000`; DB + seed required before running.
  - Only Chromium installed by default.
- Coverage ignores: `node_modules`, `.next`, `e2e`, `src/components/ui/`, `src/lib/`, `src/generated/`.

## Important notes

- **pnpm** only — do not use npm/yarn/bun.
- Tailwind CSS v4 with `@tailwindcss/postcss` (no tailwind.config).
- ESLint uses `eslint-config-next` core-web-vitals + TypeScript presets.
- React 19.2.4, Next.js 16.2.4 (App Router, RSC by default).
- Shadcn UI style: `radix-lyra`, icon library: `phosphor`.
- Single Prisma model: `Prompt` (id, title unique, content, createdAt, updatedAt).
- After pulling new migrations, run `pnpm db:generate && pnpm db:migrate`.
