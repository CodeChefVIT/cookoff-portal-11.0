# Next Frontend Plus Template — Agent Guide

> Coding-agent reference for this repo. Keep it current when adding tools, scripts, or conventions.

<!-- BEGIN:nextjs-agent-rules -->

## Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

```
node_modules/next/dist/docs/
  index.md                        ← start here for orientation
  01-app/
    01-getting-started/           ← routing, layouts, data fetching, caching
    02-guides/                    ← auth, forms, streaming, ISR, self-hosting …
    03-api-reference/             ← file conventions, functions, config options
  02-pages/                       ← Pages Router (avoid for new code)
```

<!-- END:nextjs-agent-rules -->

---

## Project Overview

Next.js 16 (App Router) production-ready starter with:

- **Tailwind CSS v4** — utility-first styling, `@custom-variant dark` for class-based dark mode
- **Framer Motion** — animation primitives via `LazyMotion + domAnimation`
- **shadcn/ui** — component primitives via `@base-ui/react`
- **next-themes** — system/light/dark theme switching
- **TanStack Query v5** — async server state with SSR prefetch support
- **Axios** — HTTP client with typed error normalisation
- **Zustand v5** — client state with auto-selector helpers
- **t3-env + Zod v4** — build-time environment validation
- **React Hook Form + Zod v4** — type-safe forms via `useZodForm`
- **Sonner** — themed toast notifications
- **nuqs** — type-safe URL search params (requires `NuqsAdapter` in layout)
- **date-fns v4 + nanoid** — date formatting and ID generation
- **Vitest + Testing Library** — unit and component tests
- **ESLint + Prettier** — linting and formatting enforced in CI and pre-commit

---

## Directory Structure

```
src/
  env.ts                # t3-env schema — import here, never read process.env directly
  app/                  # Next.js App Router pages and layouts
    layout.tsx          # Root layout — providers live here
    page.tsx            # Home page
    motion/             # /motion demo route
  components/
    providers/          # Client-side React context providers
      query-provider.tsx
      theme-provider.tsx
      index.ts          # Barrel export
    motion/             # Framer Motion wrapper components
      index.ts
    ui/                 # shadcn-style primitive components
      button.tsx
      sonner.tsx        # Themed <Toaster>
  api/                  # HTTP layer
    client.ts           # axios instance `api` + createApiClient()
    errors.ts           # ApiError class, isApiError(), toApiError()
    request.ts          # request<S>() — typed, optionally schema-validated
    index.ts            # Barrel export
  lib/                  # Cross-cutting utilities (no side effects, tree-shakeable)
    utils.ts            # cn() — clsx + tailwind-merge
    motion.ts           # Shared animation variants and constants
    query.ts            # makeQueryClient(), getQueryClient(), createQueryKeys()
  hooks/                # Cross-cutting use* hooks (≥3 consumers or truly shared)
    use-mounted.ts
    use-zod-form.ts     # useZodForm(schema, options) — RHF + zodResolver
  stores/               # Zustand stores
    create-selectors.ts # createSelectors(store) — auto-generates use.* hooks
    ui-store.ts         # useUiStore — sidebar state example (persist)
    index.ts
  schemas/              # Shared Zod schemas
    common.ts           # emailSchema, paginationSchema, paginatedResponseSchema, …
    index.ts
  utils/                # Pure utility functions
    date.ts             # formatDate, formatDateTime, formatRelativeDate, timeAgo
    id.ts               # nanoid re-export
    index.ts
  constants/            # App-wide constants (no logic)
    api.ts              # API_TIMEOUT_MS, QUERY_STALE_TIME_MS, QUERY_GC_TIME_MS
    env.ts              # IS_PRODUCTION, IS_DEVELOPMENT, IS_TEST
    index.ts
  types/                # Cross-cutting TypeScript interfaces
    index.ts            # ApiResponse<T>, PaginatedResponse<T>, ApiErrorData
  test/
    setup.ts            # Vitest global setup (@testing-library/jest-dom)
```

Feature-specific hooks, types, and helpers should be colocated with their feature. Use `src/hooks/`, `src/types/`, and `src/schemas/` only for cross-cutting concerns used in three or more places.

---

## Commands

| Script              | What it does                 |
| ------------------- | ---------------------------- |
| `pnpm dev`          | Start dev server (Turbopack) |
| `pnpm build`        | Production build             |
| `pnpm start`        | Serve production build       |
| `pnpm lint`         | ESLint                       |
| `pnpm lint:fix`     | ESLint with auto-fix         |
| `pnpm format`       | Prettier write               |
| `pnpm format:check` | Prettier check (used in CI)  |
| `pnpm type-check`   | `tsc --noEmit`               |
| `pnpm test`         | Vitest run (single pass)     |
| `pnpm test:watch`   | Vitest in watch mode         |

---

## Conventions

### Modular Code

The single most important structural rule: **one concern per file**.

- A component renders. A hook manages state or side effects. A lib function transforms data. Never mix.
- If a component file exceeds ~150 lines, it is doing too much — extract.
- Logic that isn't directly tied to rendering belongs in a `use*` hook next to the component, or in `src/hooks/` if reused across three or more places.
- Shared pure functions go in `src/lib/`. Do not colocate data-transform logic inside components.
- New UI variants → add to the existing `cva()` call, not a new component.
- Prefer composing small components over branching inside a large one.

### Comments

- Comment **why**, not what. Code shows what; the comment explains the non-obvious decision behind it.
- No commented-out code — delete it, git has history.
- No multiline comments. Inline single-line comments only when the intent cannot be expressed in the code itself.

### TypeScript

- Use `interface` for object shapes and component props. Reserve `type` for unions and aliases.
- Always use `import type` for type-only imports. Enforced by ESLint (`consistent-type-imports`).
- `any` is banned. Use `unknown` and narrow.
- No explicit return types on components — let inference handle it. Explicit return types on exported `lib/` functions only.
- Use Zod v4 top-level APIs: `z.email()`, `z.url()`, `z.uuid()`. Avoid deprecated `ZodTypeAny` — use `ZodType`.

### Imports

Prettier auto-sorts on every format pass. The enforced order is:

```
react / react-dom
next and next/*

<third-party packages>

@/* (internal absolute)

./relative
```

Blank lines between each group are auto-inserted — do not add them by hand.

### Tailwind

- `prettier-plugin-tailwindcss` auto-sorts utility classes on format. Never sort by hand.
- Use `cn()` for conditional or merged class strings.
- Use `cva()` for components with variant axes.
- CSS variables for design tokens live in `src/app/globals.css` — do not inline raw colours.

### Components

- Named exports only — no default exports for components.
- Barrel `index.ts` in every component folder. Consumers import from the folder, not the file.
- Props via `interface Props extends …` — extend a base type where applicable.
- `'use client'` at the top only when the component genuinely needs interactivity. Default to Server Components.

### Environment Variables

- Never read `process.env` directly. Import from `@/env` to get type-safe, validated values.
- Set `SKIP_ENV_VALIDATION=true` in CI or Docker builds to bypass validation without supplying real secrets.

### HTTP / API

- Use `api` from `@/api` for all HTTP calls. Use `createApiClient(url)` for server-side internal URLs.
- Use `request({ ..., schema })` for zod-validated typed responses.
- All rejections from `api` are normalised to `ApiError`. Check with `isApiError(err)`.

### Data Fetching (TanStack Query)

- Define query keys with `createQueryKeys(entity)` from `@/lib/query`. Colocate the result with the feature's API module.
- Server-side prefetch: `getQueryClient()` → `prefetchQuery` → `<HydrationBoundary state={dehydrate(qc)}>`.
- Client components use `useQuery`, `useMutation`, `useSuspenseQuery` from `@tanstack/react-query`.
- The TanStack Query ESLint plugin (`@tanstack/eslint-plugin-query`) enforces exhaustive query keys.

### State Management (Zustand)

- One store per file in `src/stores/`. Use curried `create<State>()` form.
- Wrap with `createSelectors` to get `store.use.field()` auto-hooks.
- For persisted stores, add `persist()` middleware and cast the result as `UseBoundStore<StoreApi<State>>` before passing to `createSelectors`.
- Server-side hydration: guard with `useMounted()` or call `store.persist.rehydrate()` as needed.

### Forms

- Use `useZodForm(schema, options?)` from `@/hooks/use-zod-form` — wires RHF + `zodResolver`.
- Colocate feature form schemas with the feature. Only cross-cutting primitives go in `src/schemas/`.
- Submit handler: validated data → `api`/`request` call → `toast.success/error`.

### Notifications (Sonner)

- Import `toast` from `sonner` and call directly. No wrapper needed.
- `<Toaster />` in `layout.tsx` handles positioning, theming, and stacking automatically.

### URL State (nuqs)

- Use `useQueryState` and `parseAs*` parsers from `nuqs` in client components.
- `NuqsAdapter` in `layout.tsx` is required — it is already wired.

### Adding a Provider

1. Create `src/components/providers/<name>.tsx` with `'use client'` at the top.
2. Export from `src/components/providers/index.ts`.
3. Compose it inside the hierarchy in `src/app/layout.tsx`.

---

## Theming

Dark mode is class-based (`@custom-variant dark (&:is(.dark *))`). `next-themes` stamps `.dark` on `<html>` before hydration — no flash.

- Default theme: `system` — follows `prefers-color-scheme` automatically.
- Use `useMounted()` from `src/hooks/use-mounted.ts` to guard any client-only rendering (e.g. reading `useTheme()` before hydration).

---

## Motion

All animation components use `LazyMotion + domAnimation` (tree-shaken, ~16 kB). Use the `m.*` namespace; never import from `motion/*` directly in components.

Shared variants and transition presets live in `src/lib/motion.ts` — add new ones there, not inline in components.

---

## Testing

- Tests live next to their source in `__tests__/` subdirectories.
- Setup file: `src/test/setup.ts` — imports jest-dom matchers and registers `afterEach(cleanup)`.
- Import `describe`, `it`, `expect`, etc. explicitly from `vitest`.
- Use `@testing-library/react` for component tests; `@testing-library/user-event` for interactions.
- **What to test:** unit tests for all `lib/`, `api/`, `schemas/`, `utils/`, and `stores/` utilities; component tests for interactive components (state, events, ARIA). Skip pure layout/presentational components.
- Test behaviour, not implementation. Assert roles, labels, and states — not class strings or style values.
- Set `SKIP_ENV_VALIDATION=true` when running tests that transitively import `@/env` or `@/api/client`.

---

## Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint (local hook + CI).

```
<type>(<scope>): <description>

feat(auth): add OAuth provider
fix(button): correct disabled state focus ring
ci: add release workflow
```

Allowed types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`.
Scope is optional, lowercase, single word.

---

## CI

`.github/workflows/`

| File                       | Trigger                         | Jobs                                                                  |
| -------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| `ci.yml`                   | Push to any branch; PR → `main` | `lint` + `typecheck` + `test` in parallel → `build` (needs all three) |
| `release.yml`              | Push tag `v*`                   | Full CI → GitHub Release (auto release notes)                         |
| `commit.yml`               | PR → `main`                     | commitlint                                                            |
| `dependabot_bot_issue.yml` | Dependabot PR                   | Creates tracking issue                                                |

All CI jobs set `SKIP_ENV_VALIDATION=true` — no secrets required in the pipeline.
Concurrency groups cancel in-progress runs on new pushes (except release).

---

## Pull Requests

Use the PR template (`.github/pull_request_template.md`). Every PR must:

- Tick the correct type
- State what changed and why in 1–2 sentences
- Pass `pnpm lint && pnpm test` locally before opening
- Keep each file/component to a single concern

---

## Rounds architecture (Round 1 "Scratch" / Round 2 "Chef's Pantry" / Round 3 "the Crucible")

All three rounds share one shell configured by
`src/components/rounds/round-config.ts`. **A `roundId === <n>` conditional
anywhere outside that file is a defect** — every behavioural difference
between the rounds belongs in `RoundConfig` (`engine`, `hasBuyIn`,
`hasCurrency`, `headerSubmit`, `minimalHud`, `isFinalRound`, …).

```
RoundGate (qualification + window)
  └─ RoundShell (header — currency/headerAction config-gated — question tabs)
       │
       ├─ R1 ("visual" engine): QuestionList | VisualQuestionWorkspace
       │        └─ BuyInGate (pass-through, R1 has no buy-in) → ScratchEngine
       │             └─ ScratchLayout
       │                  ├─ ProblemPanel
       │                  ├─ WorkspaceCanvas (the chain) + VisualVerdict
       │                  └─ BlockPalette
       │        Submit lives in the header (`ChainSubmitButton`,
       │        `RoundConfig.headerSubmit`), not inside the engine.
       │
       └─ R2/R3 ("code" engine): QuestionList | QuestionWorkspace
                └─ BuyInGate (pass-through on R3) → CodeEngine
                     └─ WorkspaceLayout
                          ├─ ProblemPanel
                          ├─ MonacoWrapper + EditorToolbar
                          └─ TestcasePanel + JudgeStatus
```

`ProblemPanel` and `ResultModal` are shared verbatim by both engines
(`src/components/rounds/ProblemPanel.tsx` / `ResultModal.tsx`) — `ResultModal`
takes plain `{ pointsAwarded, alreadyAnswered }`, not a code-shaped verdict,
so it has no testcase dependency.

### Design source of truth

- `src/figma/scratch.png` is the **only** valid Round 1 design: a
  three-panel layout (question | chain drop-zone | block palette) with the
  header's Submit button and numbered question tabs. Its
  Motion/Control/Operators/Variables palette tabs are **not** implemented —
  a block is just `{id, content}` with no category column, so `BlockPalette`
  is one flat list. This is a deliberate divergence from the mock, not a gap.
- `src/figma/Desktop - 15.png` (dark, LeetCode-style IDE) is the **only**
  valid R2/R3 design. **`design/R2.svg` and `design/R3.svg` are a different
  product** — a mobile, team-based, QR-station treasure hunt ("Scan QR", "Go
  to new station", "Realm Name: Jotunheim", "Leave Team") with no code editor,
  testcases, or betting. They were rendered and inspected frame-by-frame and
  rejected; do not use them for R2/R3 work.

### Server-authoritative state

Never mirror these into client state — always read them via TanStack Query:
`round_qualified`, `balance`, `score`, `attempts` status (question unlock),
question list/points/buyIn/reward, testcases, submission and visual-chain
verdicts, and the round clock (`server_time`/`round_start_time`/
`round_end_time`). Client state is presentation only, never gameplay
authority: Zustand `round-store.ts` holds the R2/R3 code/language/
custom-input draft, and `chain-store.ts` holds the R1 in-progress block
chain the same way. A `402/403` from `POST /submit` always re-locks the R2
question — the server wins over any client-side "unlocked" cache.

### Backend limitations (do not "fix" by touching `cookoff-11.0-be`)

| #     | Limitation                                                                                                                                                                                       | Frontend handling                                                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1    | No R1/R2/R3 endpoint is implemented (`router.go` wires only `/health`, `/docs`).                                                                                                                 | `src/api/*.ts` is Zod-schema'd against the LLD; `src/api/fixtures.ts` + `NEXT_PUBLIC_USE_MOCK_API=true` serve deterministic fixtures until the backend ships.                                 |
| L2    | No endpoint names "the current round".                                                                                                                                                           | Derived from `session.roundQualified`; `/getTime` supplies that round's window.                                                                                                               |
| L3    | `POST /question/:id/attempt` has no read counterpart.                                                                                                                                            | `200` and `409` (already bought) are both treated as a successful unlock.                                                                                                                     |
| L4    | `GET /question/round` may not carry per-user `solved`/`bought` flags.                                                                                                                            | Badges render only when those fields are present; never guessed.                                                                                                                              |
| L6    | No `questions.difficulty` or ordering column.                                                                                                                                                    | `sortQuestionsForRound()` orders by `points` ascending, title as tiebreak — isolated to one function.                                                                                         |
| L7    | Buy-in is a fixed `question.buyIn`, not a user-chosen wager (`attempts.is_buy_in_paid` is boolean; `/attempt` takes no body).                                                                    | `BuyInGate` shows a fixed-amount confirmation modal. This is a genuine product/backend gap — escalate, don't patch the backend.                                                               |
| L8    | `/runcode` and `/runcustom` have no documented contract.                                                                                                                                         | Gated behind `CAPABILITIES.runCode` (currently `false`); the UI shows a disabled, explained "Run Code" button.                                                                                |
| L10   | No Judge0 language-id list exists in the backend.                                                                                                                                                | Hard-coded in `round-2-3/languages.ts` (C 50, C++ 54, Java 62, Python 71, JS 63) — **verify against the deployed Judge0 instance before the contest**.                                        |
| L11   | No WebSocket/SSE for verdicts.                                                                                                                                                                   | `useCodeSubmission` polls `GET /result/:id` every ~1.2s, capped at ~60 polls, then offers "Check again".                                                                                      |
| L13   | Error bodies are inconsistent (`{message}` vs `{error}` vs `{success,message,errors}`).                                                                                                          | `api/errors.ts#toApiError` tolerates all three.                                                                                                                                               |
| L14   | `submit_round1.go` 403s ("Question not bought yet") unless an `attempts` row exists with a non-`available` status — but Round 1 has no buy-in flow, so no `attempts` row is ever created for it. | A genuine backend gap, not something the frontend can paper over: escalate to drop the attempt check for round 1, or auto-create a zero-cost, pre-bought attempt at round-qualification time. |
| L15   | `dto.SubmitVisualSolutionResponse` (`round1.go`) returns only `points_awarded` — no `correct`/`already_answered` flag.                                                                           | `visualSubmissionResultSchema` (`api/visual-submissions.ts`) derives `correct` as `pointsAwarded > 0` — the one place that guesses. Ask the backend to add both fields explicitly.            |
| L16   | `visual_blocks` has no category/type column — the Figma's Motion/Control/Operators/Variables tabs have no backing data.                                                                          | `BlockPalette` renders one flat list; never fabricate a category from block content.                                                                                                          |
| C3/L9 | `internal/middlewares/jwt.go` expects a Bearer header, but it is attached to no route; the LLD and `cookoff-admin-11.0` use httpOnly cookies.                                                    | `api/client.ts` uses `withCredentials` + a single-shot `401 → POST /refreshToken → replay` interceptor. Confined to one file.                                                                 |

Flipping `NEXT_PUBLIC_USE_MOCK_API` to `false` the moment the backend ships
these endpoints requires no component changes — every resource module
already calls the real `request()`/`schema` path when the flag is off.
