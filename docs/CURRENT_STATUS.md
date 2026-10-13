# NutriPlan Handoff Status

Last audited: 2026-10-10. This is an implementation inventory, not a claim that the MVP is complete. Update it after each delivered vertical slice.

## Implemented And Configured

| Area                | Actual state                                                                                                                                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App shell           | Expo SDK 57, React Native 0.86, strict TypeScript, Router stack, translated Spanish/English placeholder screen with language selector                                                                                                                                                   |
| Styling             | NativeWind 4.2.7/Tailwind 3, Babel/Metro/type wiring; no final design system                                                                                                                                                                                                            |
| Query               | QueryClient/provider, AppState focus and network handling; no feature queries yet                                                                                                                                                                                                       |
| Local state         | Persisted automatic/Spanish/English locale connected to reactive i18n; theme preference remains unwired                                                                                                                                                                                 |
| Localization        | i18next/react-i18next, typed ES/EN namespaces, Expo device-language detection, Spanish fallback, interpolation/plurals, independent translator factory; 12 localization tests                                                                                                           |
| Configuration       | Public environment parsing with Zod and two tests; app can display the shell without backend credentials                                                                                                                                                                                |
| Supabase            | Lazy client with AsyncStorage session persistence; no auth screen, callback, session provider, profile query, or generated database schema types                                                                                                                                        |
| Local backend       | Supabase CLI initialized with default config and an empty seed; no SQL migrations, RLS policies, functions, or Cron jobs                                                                                                                                                                |
| Notifications       | SDK installed and config plugin registered; no permission UX, runtime registry, reconciliation, or tap routing                                                                                                                                                                          |
| Forms               | RHF/resolver/Zod installed; no product form schemas or components                                                                                                                                                                                                                       |
| Analytics/purchases | SDKs and public config fields installed; no initialization, events, paywall, webhooks, or entitlements                                                                                                                                                                                  |
| AI/nutrition        | No Gemini requests, USDA import, TMB/TDEE/macro policy, recipes, or food catalog                                                                                                                                                                                                        |
| Tooling             | TetApp formatting/imports/editor actions, Husky, commitlint, lint-staged, ignores, Jest coverage, Yarn pin and EAS profiles migrated. Seven tests (two environment, five tooling), not product coverage                                                                                 |
| Native              | CNG scene-lifecycle plugin ported from TetApp; iPhone and iPad simulator shell launches verified                                                                                                                                                                                        |
| Agent context       | OpenCode loads engineering/product/reuse/status docs; Codex reads AGENTS and its document pointers; Claude Code imports the same docs through CLAUDE.md. OpenCode's `@tetapp` alias resolves to the sibling repository; Claude uses `../tetapp` with `/add-dir` if permission is needed |

There are no production provider projects or deployment credentials established by this scaffold. Inspect the current environment setup with the user when connecting services; do not assume a service is configured because a dependency is installed.

## Native Lessons Already Resolved

- Xcode 27 requires UIScene adoption. Keep `plugins/withIosSceneLifecycle.js` registered; generate native changes using prebuild, not hand edits.
- Swift source imports only UIKit; unnecessary Expo imports conflicted with SDK 57's `internal import Expo`.
- Metro was reachable at `127.0.0.1:8081`; the LAN IP and Bonjour discovery timed out. Use `yarn ios:simulator` or open the exact localhost development-client URL on a chosen simulator UDID.
- Installing on another simulator does not require restarting Metro: `npx expo run:ios --device --no-bundler`, then explicit localhost connection if needed.
- CoreAnimation, launch metrics, PointerUI, and the Expo strip-script dependency warning were not blockers for the verified shell launch. Investigate visible symptoms rather than hiding all logs.
- Physical devices cannot use the Mac's localhost for Metro or local Supabase. Configure an accessible LAN/tunnel or hosted backend.

## Next Vertical Slice: Auth And Profile Onboarding

Deliver the following together, not a generic template generator:

1. Settle Supabase auth methods, email confirmation, password policy, and reset callback flow. The local config still uses default web redirects; do not present mobile recovery as implemented.
2. Port typed button/text/password/error components from TetApp behavior and companion tests. Use NativeWind and RHF/Zod, without room/baby/global-store dependencies.
3. Add Supabase session bootstrap, auth-state handling, native refresh lifecycle, route guards, and logout/user-switch cache cleanup. Handle recovery/deep-link flows explicitly.
4. Add the first profile/onboarding SQL migration with ownership RLS and two-user isolation tests. Avoid the entire eventual schema upfront.
5. Generate Supabase database types after applying migrations; replace the placeholder and type `createClient<Database>`.
6. Implement the first profile form and explicit loading/error/save/retry states. Do not collect unused medical/identity fields simply because TetApp has them.
7. Wire the theme preference when settings are implemented. Locale preference and the bilingual home screen are already implemented; reuse the i18n template for all new forms and messages.

Acceptance: account create/login/logout/restore and profile save work; one user cannot access another user's data; password recovery matches the chosen flow; checks and device smoke tests pass. Tests alone do not prove production email/OAuth configuration.

## Before Weekly Planning

- Build the date/time core with explicit local dates, local meal times, IANA zones, week starts, and DST tests.
- Establish minimum deterministic nutrition, trusted portion conversion, and catalog fixtures before approval/shopping/dashboard relies on them.
- Separate recipe yield, prepared servings, and the user's portion.
- Preserve immutable approved/modified plan snapshots and consumed nutrition while keeping schema small.
- Resolve the open product policies listed in `PRODUCT_CONTEXT.md` at the feature that needs them.

## TetApp Migration Queue

| When                | What to port                                                                | Why                                     |
| ------------------- | --------------------------------------------------------------------------- | --------------------------------------- |
| Already done        | UIScene config plugin                                                       | Required by the current iOS runtime     |
| Auth/onboarding     | Form controls, auth/profile UX, validation/test patterns                    | Immediate development accelerator       |
| Weekly-plan slice   | Date-key/history boundary concepts and relevant tests                       | Consistent weeks and scheduling         |
| Notifications slice | Scheduled-ID registry, fingerprints, reconciliation, response deduplication | Avoid stale/duplicate reminders         |
| Dashboard slice     | Pure aggregation/series and no-data UX concepts                             | Nutrition and compliance presentation   |
| Before release      | Account deletion UX and local cleanup tests                                 | Complete account lifecycle              |
| Optional later      | Native file/share and export tests                                          | Not required for the first product loop |

No further bulk TetApp migration is a prerequisite to start. Firebase auth/data facades, rooms/babies, and Watch/Wear code are deliberately excluded. Do not copy secrets or old provider project identities.

## Development Validation

```bash
yarn run check
yarn doctor
yarn build:check
```

No Supabase RLS, catalog, AI, subscription, or E2E tests exist yet. Add them with their features. Docker/local Supabase availability and external project configuration are environmental prerequisites to verify, not migrated TetApp features.

### Latest Audit Results

- `yarn run check`: passed lint, TypeScript, formatting, and 19 tests (two environment, five tooling, twelve localization).
- `yarn doctor`: 21/21 checks passed.
- `git diff --check`: passed.
- OpenCode and Claude Code load the same five shared documents, including `docs/TOOLING.md`. OpenCode also exposes the TetApp reference; `CLAUDE.md` is the import wrapper for standalone Claude Code.
- All 68 unique referenced TetApp file paths exist, including newly added auth/profile and UI test references.
- Docker daemon was not reachable during the audit. Start Docker before local Supabase development, or connect a hosted Supabase project. No database stack was started or deployed by this audit.
- The `claude` executable was not found in the audit shell. Claude Code context files are ready, but the standalone CLI installation/PATH is not verified. This does not prevent using Claude through OpenCode.
- The context audit changed documentation only. The subsequent tooling migration added configs/hooks, reformatted the scaffold, and added regression tests. Native launches were previously verified; no new native dependency was added by the tooling migration.
- Husky was installed through its normal `prepare` lifecycle. The commit-message hook accepted a Conventional Commit fixture and rejected an invalid fixture; the pre-push hook exported iOS/Android/web successfully. No actual commit or push was performed.
