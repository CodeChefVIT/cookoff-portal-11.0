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
`hasCurrency`, `headerSubmit`, `isFinalRound`, …).

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
                ├─ QuestionTabs (overlaid into WorkspaceLayout's TABS_BAND)
                └─ BuyInGate (pass-through on R3) → CodeEngine
                     └─ WorkspaceLayout
                          ├─ ProblemPanel (variant="code")
                          ├─ RoundStatusPill + LanguageSelector
                          ├─ MonacoWrapper + EditorToolbar
                          └─ CustomInputPanel | TestcasePanel | ResultsPlaceholder
```

On an R2/R3 question page `RoundShell` does **not** render the question
tabs — `QuestionWorkspace` owns them so they sit in the problem column above
the panel, exactly as in the Figma frames, across loading/locked/unlocked.

`ProblemPanel` and `ResultModal` are shared verbatim by both engines
(`src/components/rounds/ProblemPanel.tsx` / `ResultModal.tsx`) — `ResultModal`
takes plain `{ pointsAwarded, alreadyAnswered }`, not a code-shaped verdict,
so it has no testcase dependency.

### Design source of truth

- `src/figma/scratch.png` (Figma file `Qc0hMJFVUSxi6jsnhx54Vk`, node
  `312:1042`) is the **only** valid Round 1 design: a three-panel layout
  (question | chain drop-zone | block palette) with the header's Submit
  button and numbered question tabs. R1 implements it pixel-exact via
  `RoundConfig.chrome: 'scratch'` (`ScratchHeader`, `ScratchQuestionTabs`,
  `scratchPanelVariants`, the `--scratch-*` tokens and fonts in
  `layout.tsx`); R2/R3 keep `chrome: 'code'`. Its
  Motion/Control/Operators/Variables palette tabs are **not** implemented —
  a block is just `{id, content}` with no category column, so `BlockPalette`
  is one flat list and its well rises into the space the tabs occupied.
  This is a deliberate divergence from the mock, not a gap.
- Figma file `Qc0hMJFVUSxi6jsnhx54Vk`, nodes `312:1101` (`Desktop - 15`,
  compile-failure state) and `312:1216` (`Desktop - 14`, passing state), is
  the **only** valid R2/R3 design, implemented pixel-exact at 1440px from
  `lg` (the `--code-*` tokens, `public/code-round/` assets, Bruno Ace / Inria
  Sans / General Sans in `layout.tsx`). R3 is identical minus the currency
  block (`hasCurrency`), the buy-in (`hasBuyIn`) and the reward
  (`ResultModal` `showReward`). **`design/R2.svg` and `design/R3.svg` are a different
  product** — a mobile, team-based, QR-station treasure hunt ("Scan QR", "Go
  to new station", "Realm Name: Jotunheim", "Leave Team") with no code editor,
  testcases, or betting. They were rendered and inspected frame-by-frame and
  rejected; do not use them for R2/R3 work.
- Figma file `Qc0hMJFVUSxi6jsnhx54Vk`, node `352:499` (background) composed
  with `352:459` + `352:394` (card) is the **only** valid `(auth)/login`
  design. The mock's "Sign in as xyz" account-chooser row and "LOGIN" button
  are deliberately **not** implemented — there are no credential fields
  anywhere in the design and the backend only supports one auth action
  (`/auth/google` redirect), so both would have been dead UI. Only the
  logo, title, divider, and "Sign in with Google" button are built.

### Server-authoritative state

Never mirror these into client state — always read them via TanStack Query:
`round_qualified`, `balance`, `score`, attempt status (question unlock),
question list/points/buyIn/reward, testcases, submission and visual-chain
verdicts. Client state is presentation only, never gameplay authority:
Zustand `round-store.ts` holds the R2/R3 code/language/custom-input draft,
and `chain-store.ts` holds the R1 in-progress block chain the same way. A
`402/403` from `POST /submit` always re-locks the R2 question — the server
wins over any client-side "unlocked" cache.

### Real backend contract (confirmed against a live `cookoff-11.0-be` pull)

`cookoff-11.0-be/internal/router/router.go` now wires every R2/R3 route.
Every response is wrapped in `dto.SuccessResponse{success,message,data}`;
`src/api/wire.ts#envelope()` unwraps `data` before the domain schema runs —
apply it at every call site, the shape schemas themselves stay
envelope-agnostic so fixtures/tests can pass the domain shape directly.

| Frontend call         | Real endpoint                        | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getSession`          | `GET /dashboard`                     | Also embeds `questions[]` (current round only, with `attempt_status`) — this is the _only_ source of per-user solved/bought flags (L4 resolved via `mergeAttemptStatus`). No `is_banned` field; a banned user never reaches this handler.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `getQuestionsByRound` | `GET /question/round`                | Server-scoped to `WHERE q.round = u.round_qualified` — **no round parameter exists**. Requesting a round the caller isn't currently qualified into returns the _current_ round's questions, which the client-side `round` filter correctly drops instead of showing the wrong round's problems.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `getQuestionById`     | `GET /question/:id`                  | Participant-facing (JWT + ban check only) — confirmed **not** admin-gated, contrary to the original LLD draft.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `getPublicTestcases`  | `GET /question/:id/testcases/public` | `WHERE hidden = false` enforced server-side; plain array, no wrapper struct beyond the envelope.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `createAttempt`       | `POST /attempts/:id`                 | **Not** `/question/:id/attempt` — that path never existed on the deployed backend. `409` = already bought (unlock), `402` = insufficient balance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `submitCode`          | `POST /submit`                       | Body is snake_case `{question_id, language_id, source_code}`. **Does not check attempt/purchase status before enqueueing Judge0** — buy-in accounting instead happens at result-finalize time via `EnsureAttempt`, so a `402/403 "not purchased"` is defensive handling for a contract the LLD describes but this implementation doesn't enforce synchronously.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `getSubmissionResult` | `GET /result/:submission_id`         | **Long-polls server-side for up to 2 minutes** and returns the final, terminal verdict directly — there is no Judge0 numeric status id in the response and no client-side polling loop (`useCodeSubmission` calls it once per submission, `timeout: 130_000`). A `408` means it genuinely wasn't ready; the query retries once, then surfaces "Check again". `dto.ResultResponse.testcases[]` covers **every** testcase (public + hidden — the judge runs against all of them); `TestcasePanel` treats any `testcaseId` absent from the public list as hidden. No `stdout` per case and no `alreadyAnswered` flag — the Output column shows the verdict status instead of real program output, and `ResultModal`'s "already solved" copy is driven by `question.solved` captured _before_ the submission (`CodeEngine`'s `wasAlreadySolved` state). |
| `getRoundTime`        | _(none)_                             | `GET /getTime` does not exist anywhere in the backend — confirmed even after every other route landed. `RoundGate` fails open on this query's error (qualification alone still gates access); only the timer display degrades to "clock unavailable".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `getVisualBlocks`     | `GET /question/:id/blocks`           | Round 1 only: 404 unless the question is `round = 1`, `q_type = visual` and in the caller's `round_qualified`. Returns `[{id, content}]` ordered by UUID (effectively shuffled); no category column (L16).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `submitVisual`        | `POST /submit/visual`                | Body `{question_id, blocks: uuid[]}`, graded synchronously against `visual_solutions` (exact order match; several accepted orders allowed). Returns `{status: "", points_awarded}` — `correct` is derived from `points_awarded > 0` (L15). `403 "Question not bought yet"` without a `bought` attempt (L14).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

### Remaining backend limitations (do not "fix" by touching `cookoff-11.0-be`)

| #   | Limitation                                                                                                                                                                                            | Frontend handling                                                                                                                                                                                                                                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L2  | No endpoint reports the round window or names "the current round".                                                                                                                                    | Derived from `session.roundQualified`; timer degrades gracefully (see above).                                                                                                                                                                                                                                                                       |
| L4  | `GET /question/round` carries no per-user flag.                                                                                                                                                       | Resolved by merging `GET /dashboard`'s embedded `questions[].attempt_status` (`mergeAttemptStatus`) — real data, not a placeholder.                                                                                                                                                                                                                 |
| L6  | No `questions.difficulty` or ordering column.                                                                                                                                                         | `sortQuestionsForRound()` orders by `points` ascending, title as tiebreak — isolated to one function.                                                                                                                                                                                                                                               |
| L7  | Buy-in is a fixed `question.buy_in`, not a user-chosen wager (`attempts.is_buy_in_paid` is boolean; `/attempts/:id` takes no body).                                                                   | `BuyInGate` shows a fixed-amount confirmation modal. Genuine product/backend gap — escalate, don't patch the backend.                                                                                                                                                                                                                               |
| L8  | `/runcode`/`/runcustom` are wired but return a raw Judge0-callback array with no envelope and no persisted submission id — a different contract from `/submit` + `/result/:id`.                       | Gated behind `CAPABILITIES.runCode` (`false`); "Run Code" stays visibly disabled with an explanation.                                                                                                                                                                                                                                               |
| L10 | No Judge0 language-id list exists in the backend.                                                                                                                                                     | Hard-coded in `round-2-3/languages.ts` (C 50, C++ 54, Java 62, Python 71, JS 63) — **verify against the deployed Judge0 instance before the contest**.                                                                                                                                                                                              |
| L13 | Error bodies are inconsistent (`{message}` vs `{error}` vs `{success,message,errors}`).                                                                                                               | `api/errors.ts#toApiError` tolerates all three.                                                                                                                                                                                                                                                                                                     |
| L14 | `submit_round1.go` 403s ("Question not bought yet") unless a non-`available` `attempts` row exists, but Round 1 has no buy-in flow. `EnsureAttempt` exists but only the R2/R3 result worker calls it. | `RoundConfig.autoAttempt` (R1): `BuyInGate` silently calls `POST /attempts/:id` when a question opens (409 = fine), shows a "Retry unlock" banner on failure, and `ChainSubmitButton` stays disabled while it is in flight. Requires R1 questions to have `buy_in = 0`. Ask the backend to call `EnsureAttempt` in `/submit/visual` so this can go. |
| L15 | `dto.SubmitVisualSolutionResponse` (`round1_submit.go`) declares `status`/`note`, but the handler only sets `points_awarded` (`status` arrives as `""`).                                              | `visualSubmissionResultSchema` (`api/visual-submissions.ts`) derives `correct` as `pointsAwarded > 0` — the one place that guesses. Ask the backend to populate `status` (or add `correct`/`already_answered`).                                                                                                                                     |
| L16 | `visual_blocks` has no category/type column — the Figma's Motion/Control/Operators/Variables tabs have no backing data.                                                                               | `BlockPalette` renders one flat list; never fabricate a category from block content.                                                                                                                                                                                                                                                                |
| L18 | `NumericToFloat64` (`helpers/utils/numeric.go`) errors on NULL, so a NULL `questions.buy_in`/`reward` makes `/attempts/:id` and a correct `/submit/visual` return 500.                                | Not patchable client-side. Seed R1 questions with `buy_in = 0` and a `reward`, or ask the backend to treat NULL as 0.                                                                                                                                                                                                                               |

C3/L9 (Bearer-header auth vs cookies) is **resolved**: `VerifyJWTMiddleware`
now reads the `access_token` cookie directly, matching `api/client.ts`'s
`withCredentials` + `401 → POST /refreshToken → replay` interceptor.

`NEXT_PUBLIC_USE_MOCK_API=true` still exists for offline/CI development —
`src/api/fixtures.ts` mirrors the real shapes above exactly (including the
public/hidden testcase split and the `testcaseId` matching `TestcasePanel`
relies on), so flipping the flag never requires a component change.
