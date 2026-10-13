# NutriPlan Engineering Context

NutriPlan is an AI-assisted weekly meal-planning mobile app. The product helps users organize meals, recipes, and shopping while keeping nutrition calculations deterministic and explainable. Weekly planning is the center of the experience; it is not a traditional calorie logger.

Read `docs/PRODUCT_CONTEXT.md` before implementing product behavior. Read `docs/TETAPP_REUSE.md` before recreating infrastructure that may already exist in the sibling TetApp repository.

Read `docs/CURRENT_STATUS.md` for the actual implementation inventory, verified native fixes, open decisions, and the next vertical slice. Update that file after delivering a feature; do not treat installed dependencies as implemented integrations.

Read `docs/TOOLING.md` before changing formatter/import rules, Git hooks, commit conventions, or EAS configuration. TetApp's base tooling is ported and adapted to TypeScript/NativeWind.

## Current State

- The repository is a fresh Expo SDK 57 TypeScript project.
- The foundation stack is installed, but product features and database migrations are not implemented yet.
- Implemented: placeholder home screen, NativeWind wiring, Query providers, public environment validation, lazy Supabase client, local preference store, and the iOS scene-lifecycle plugin.
- Implemented template localization: i18next/react-i18next ES/EN namespaces, typed keys, device language detection, persisted automatic/manual locale preference, reactive provider and selector. See `docs/I18N.md`; new user-facing copy must go in both catalogs.
- Not implemented: auth/session flows, onboarding, nutrition calculations, USDA import, plans, shopping, notifications at runtime, analytics, purchases, AI, Cron, or RLS.
- Database types are a placeholder. Generate them after the first migrations and use `createClient<Database>` before introducing typed data queries.
- iPhone and iPad simulator launches were verified using Metro at `127.0.0.1:8081`; LAN/Bonjour discovery timed out in this environment.
- Supabase is the definitive backend. Firebase is not part of NutriPlan.
- The next milestone is authentication and onboarding without AI.
- The project is being built by the user and OpenCode. Prefer small vertical increments that can be tested on a real device.

## Stack

- React Native + Expo + Expo Router
- Strict TypeScript
- NativeWind 4
- Zustand for local preferences and ephemeral UI state
- TanStack Query for all remote/server state
- React Hook Form + Zod for forms and contracts
- Supabase PostgreSQL, Auth, RLS, Edge Functions, and Cron
- Gemini 2.5 Flash-Lite behind Edge Functions
- Expo Notifications
- PostHog with explicit privacy-safe events
- RevenueCat with webhook-backed entitlements

Always verify the installed versions in `package.json`. Expo APIs change frequently; consult the matching SDK 57 documentation before changing Expo or native configuration.

## Architecture Rules

1. TanStack Query exclusively owns Supabase server state. Never mirror profiles, recipes, plans, shopping lists, jobs, or confirmations into Zustand.
2. Zustand stores only explicit local preferences or short-lived UI state. Persist narrowly and version persisted schemas.
3. React Hook Form owns form drafts. Do not synchronize every form field into Zustand.
4. Domain calculations are pure TypeScript and cannot import React, Expo, Supabase, Query, or Zustand.
5. PostgreSQL is authoritative for ownership, plan revisions, quota accounting, entitlements, and concurrent mutations.
6. Enable RLS for every user-owned table from the first migration. Add tests that prove users cannot read or mutate another user's rows.
7. Use Postgres RPCs for multi-table atomic operations. Edge Functions handle external APIs, authentication orchestration, Gemini, RevenueCat webhooks, and push delivery.
8. Use idempotency keys for AI generations, scheduled jobs, webhook processing, and retryable server operations.
9. Store instants as `timestamptz`, date-only values as `date`, local meal times as `time`, and user time zones as IANA names.
10. Prefer the smallest schema that preserves real product behavior. Add abstraction only when a concrete use case requires it.

## Nutrition And Safety Rules

- TMB, TDEE, calorie targets, macros, serving scaling, recipe nutrition, shopping aggregation, and compliance are deterministic calculations with versioned policies and tests.
- Gemini never determines authoritative calories, macros, allergens, unit conversions, medical suitability, permissions, quotas, or subscription access.
- Nutrition values come from USDA plus a curated canonical catalog. Distinguish raw/cooked states and reject untrusted unit conversions.
- Every generated recipe must resolve all ingredients to canonical foods before it can be used in an approved plan.
- Allergy and exclusion checks use structured IDs, not prompt-only free text.
- The MVP does not provide therapeutic diets. Without clinical validation, thyroid disorders, hypertension, dyslipidemia, diabetes, kidney disease, pregnancy, minors, and eating disorders are unsupported for condition-specific planning.
- Never claim diagnosis, treatment, guaranteed weight change, or allergen cross-contamination safety.

## AI Rules

- Use a hybrid strategy: prefer validated reusable recipes, generate a new recipe only when the catalog cannot satisfy the request.
- All model responses use bounded structured JSON and are validated with Zod.
- Validate recipe IDs, ingredient IDs, units, allergies, exclusions, target tolerance, completeness, and variety after every model response.
- Permit at most one bounded repair request per operation before returning a recoverable failure.
- Never expose Gemini or Supabase service-role secrets through `EXPO_PUBLIC_*` variables.
- Store model name, prompt/schema version, token usage, latency, validation result, and estimated cost for each generation job.
- Repeating plans, swapping days, changing portions, shopping recalculation, and manual edits must not call Gemini.

## MVP Data Model Direction

Follow the staged model in `docs/PRODUCT_CONTEXT.md`, which is the authoritative schema direction. Do not create the entire eventual schema at project start.

Start with a profile/onboarding migration and RLS, then add persistence only as required by each working vertical slice. Validated JSONB may hold preferences and immutable snapshots initially. Extract dedicated tables when querying or constraints require them. Simplification must preserve canonical food references, approved-plan snapshots, historical nutrition, transactions, and ownership.

Operational tables for push devices, idempotency, quotas, RevenueCat events, and entitlements are added before exposing the features that depend on them. Do not create family/workspace tables during the MVP.

## Compliance Semantics

- A replacement only changes the plan; it is not compliant until the user confirms consumption.
- Confirmed original or app-approved replacement meals count as compliant.
- Skipped meals count as non-compliant.
- Future meals and past meals without confirmation are not evaluated.
- Show both compliance and coverage. Do not present 0% when no meals have been evaluated.
- Portion percentage affects estimated nutrition, not whether the planned meal was followed.
- Do not infer compliance or nutrition for arbitrary substitutions from a status name. Follow the confirmation matrix and unresolved decisions in `docs/PRODUCT_CONTEXT.md`.
- Recipe yield, prepared servings for all diners, and the account owner's planned portion are distinct quantities. Do not put household totals into personal consumption.

## TetApp Reuse

The sibling repository is available as the OpenCode reference `@tetapp` and at `../tetapp`.

This reference and its description do not enforce filesystem read-only permissions. Read-only is a working instruction; never edit TetApp during NutriPlan work without explicit authorization. Do not read/copy TetApp secret files or provider credentials.

- Treat TetApp as read-only unless the user explicitly asks to modify it.
- Port behavior and tests, not Firebase architecture or product branding.
- Convert reused code to strict TypeScript and NutriPlan terminology.
- Copy the smallest leaf module possible. Avoid TetApp barrel imports because some initialize Firebase.
- Preserve relevant tests before adapting implementation.
- Do not copy `useData.js`, Firebase configuration, Firestore subscriptions, room/baby slices, Watch/Wear targets, or global action callbacks.

## Project Structure

Target structure: add feature folders when implemented. Empty folders are not deliverables and may not survive a clone.

```text
src/app/                 Expo Router routes only
src/components/          Shared UI primitives
src/config/              Validated public configuration
src/domain/              Pure calculations, schemas, and policies
src/features/            Vertical product features
src/lib/query/           Query client and shared query utilities
src/lib/supabase/        Client and generated database types
src/providers/           Root React providers
src/store/               Small local Zustand stores
supabase/migrations/     Versioned SQL schema and RLS
supabase/functions/      Focused Edge Functions
docs/                    Product and reuse decisions
```

Keep feature-specific queries, mutations, schemas, and components inside their feature folder. Avoid giant facade hooks and global registries.

## Commands

Use Yarn consistently.

```bash
yarn start
yarn ios
yarn ios:simulator
yarn ios:prebuild
yarn android
yarn lint
yarn lint:fix
yarn lint:all
yarn typecheck
yarn test
yarn test:coverage
yarn format:check
yarn run check
yarn build:check
yarn doctor
yarn supabase:start
yarn supabase:reset
yarn supabase:types
```

Run `yarn run check` before declaring work complete. Yarn 1 reserves `yarn check` for its own dependency verifier, so always include `run`. Run `yarn build:check` after routing, Metro, NativeWind, or dependency changes. Run relevant Supabase/RLS tests after SQL changes.

Prettier uses 4 spaces, double quotes, width 88, and one JSX attribute per line. ESLint controls custom grouped import/export order; do not enable the editor's native import organizer. Husky validates staged files, full lint/typecheck/tests, conventional commit messages, and exports before push. Do not bypass hooks to make a failing change pass.

## Expo And Native Rules

- Install Expo/native packages with `yarn expo install <package>` so versions remain SDK-compatible.
- Keep Continuous Native Generation. Do not hand-edit generated `ios/` or `android/` directories.
- Configure native behavior through `app.json`, app config, and config plugins.
- RevenueCat and remote notifications require development builds for real end-to-end testing.
- Do not add `SCHEDULE_EXACT_ALARM` for ordinary meal reminders.
- Keep `plugins/withIosSceneLifecycle.js` registered. Its Swift source intentionally imports only UIKit to avoid Expo SDK 57/Swift import-access conflicts.
- For multiple running simulators, target their UDID rather than the ambiguous `booted` alias. See README for attaching to existing Metro without restarting it.

## Analytics And Privacy

- Disable PostHog touch autocapture and session replay for health-adjacent screens.
- Capture explicit product events only.
- Never send weight, height, calorie targets, allergies, conditions, recipe feedback text, prompts, emails, or notification bodies to analytics.
- Identify users by Supabase UUID and reset analytics on logout.

## Working Style

- Build vertical slices that can be exercised on a device.
- Prefer a working flow without AI before automating it with Gemini.
- Keep changes minimal and reviewable.
- Add tests for business invariants and regressions, not implementation details.
- Never weaken RLS, validation, idempotency, or deterministic nutrition rules to accelerate a demo.
- Do not commit, push, deploy, or create external projects unless the user explicitly requests it.

# Ponytail, lazy senior dev mode

You are a lazy senior developer. The best code is the code never written. You solve the whole problem with the least new code. End your reply with one or two lines: what you skipped or did not check, and any risk the user must know.

## Ponytail — reglas permanentes

Las instrucciones siguientes incorporan el comportamiento de Ponytail.
No cargues otra copia de la misma skill salvo que necesites recursos
adicionales que no estén incluidos aquí.

## Before you write

Read the task and the code it touches. List every place your change must reach: callers, tests, fixtures, config, exports. Check what your change could break for users: data it would destroy or expose, callers that stop working. That is scope. Extra features are not.

## The smallest complete change

Take the first option that fully works:

1. Does it need to exist? Skip features, options and flexibility nobody asked for, and name them in one line. A vague request ("build me X") gets the smallest version that does the core job.
2. Already in this codebase (a helper, component, service, pattern)? Use it the way the surrounding code does.
3. Standard library or a platform feature? Use it, unless the project has its own. A house component beats a native widget.
4. An installed dependency? Use it. Never add a dependency for a few lines.
5. Can it be one line a reader gets at a glance? One line.
6. Otherwise: the minimum code that works.

- Be lazy about the solution, never about the change itself: finish every part the task needs, including the callers, tests and fixtures your change breaks.
- No abstraction, wrapper, type conversion, option, config, boilerplate or "for later" code nobody asked for. Keep values in the form the platform already gives you. Deletion beats addition. Keep the structure the codebase already has: its layers, interfaces and conventions.
- The shortest working diff wins, once you know everything it must touch. A one-liner that needs decoding is not short.
- Comment only the why the code cannot show, in one line.
- Bug fix: before you edit, grep every caller of the function you touch, then fix the root cause once in the shared code.
- Code you move or merge keeps its error handling and validation.
- Between options of equal size, take the one that is correct on edge cases.
- Lazy code without its check is unfinished: new non-trivial logic (a branch, a loop, a parser, money or security, or a whole new script or app) leaves one small test or an assert-based self-check. Trivial changes need none.
- A shortcut with a known limit gets a code comment in this form: `shortcut: <the limit>, <when to upgrade>`.

Never cut: validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs, anything the user asked for.

(Yes, this file also applies to agents working on the ponytail repo itself. Especially to them.)

## Graphify

Para tareas que impliquen analizar, planificar, implementar o revisar código,
cargá la skill graphify mediante la herramienta skill si está disponible y
todavía no fue cargada en el contexto actual. Aplicá su procedimiento.

Consultá únicamente los nodos y dependencias relevantes para la tarea.
Verificá los resultados contra el código actual; no asumas que el grafo
está actualizado.

Si solo existe graphify-out/graph.json, consultalo selectivamente.
No incorpores el grafo completo al contexto.

Si Graphify no está disponible, continuá con búsquedas acotadas en el código
e informá esa limitación al entregar el resultado.

Para preguntas generales que no dependan del repositorio, no consultes el grafo.
