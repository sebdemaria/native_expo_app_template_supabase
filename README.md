# NutriPlan

AI-assisted weekly meal planning built with Expo, TypeScript, Supabase, and deterministic nutrition calculations.

Current state: development scaffold only. Product features, auth, SQL/RLS, nutrition, AI, notifications, analytics, and subscriptions are not implemented yet. See `docs/CURRENT_STATUS.md` for the handoff inventory and first milestone.

## Requirements

- Node.js 22+
- Yarn 1.22
- Docker Desktop for local Supabase
- Xcode or Android Studio for local native builds

## Setup

```bash
yarn install
cp .env.example .env.local
yarn supabase:start
yarn start
```

Fill `.env.local` with the local or hosted Supabase URL and anon key before using authentication or data features.

Local Supabase requires Docker. A hosted Supabase project can be used instead; do not run local database reset commands against it. A simulator can reach local Supabase via the Mac's loopback address; a physical device needs an accessible host address or hosted backend.

After the first migrations have been applied with `yarn supabase:reset`, run `yarn supabase:types`. It overwrites `src/lib/supabase/database.types.ts`; the data client must then use `createClient<Database>`. No schema exists yet, so generating types now does not implement the backend.

RevenueCat and remote push notifications require a development build for complete testing.

## iOS development build

NutriPlan includes `plugins/withIosSceneLifecycle.js` because the current Xcode SDK requires UIKit's scene lifecycle. After cloning or changing native dependencies, regenerate and build the iOS project:

```bash
yarn ios:prebuild
yarn ios
```

If an older simulator build reports that `UIScene life cycle is required`, delete that app from the simulator and rerun both commands.

Once the development build is installed, use `yarn ios:simulator` for Metro over localhost. This avoids LAN IP timeouts in the iOS simulator. Stop an existing Metro process before starting this command. Physical iPhones require LAN access or an Expo tunnel instead; their localhost is not the Mac.

To install on another simulator without restarting Metro, run `npx expo run:ios --device --no-bundler` in a second terminal. If the new simulator cannot discover Metro or tries an unreachable LAN address, open the running server explicitly:

```bash
xcrun simctl list devices booted
xcrun simctl openurl "SIMULATOR_UDID" 'exp+nutriplan://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081'
```

Replace `SIMULATOR_UDID` with the target simulator's ID. Avoid `booted` when several simulators are running, because it may select the wrong device.

## Validation

```bash
yarn run check
yarn build:check
yarn doctor
```

## Localization

Spanish/English localization is implemented with i18next/react-i18next, typed namespaces, automatic device-language selection, Spanish fallback, and a persisted language selector. The current home screen is translated and updates without restart. See `docs/I18N.md` for adding translations and background notification copy.

## Development Tooling

Install the recommended VS Code extensions to enable Prettier and ESLint on save. Formatting and import order follow TetApp's conventions, adapted to TypeScript and NativeWind. Run `yarn lint:all` to fix imports and format the repository; run `yarn run check` to validate it.

Husky hooks install automatically with `yarn install` (`yarn prepare` reinstalls them). Commits validate staged files, lint, types, tests, and Conventional Commit messages; pushes validate the app export. See `docs/TOOLING.md` for the full migrated configuration and `eas.json` profiles.

## Agent Context

- `AGENTS.md`: engineering constraints and workflow for OpenCode.
- `docs/PRODUCT_CONTEXT.md`: product behavior and MVP scope.
- `docs/TETAPP_REUSE.md`: selective reuse map for the sibling TetApp repository.
- `docs/CURRENT_STATUS.md`: implemented/configured/planned inventory and the next actionable slice.
- `docs/TOOLING.md`: migrated editor, formatting, import groups, Git hooks, commit rules, ignores, coverage, and build profiles.

OpenCode loads these files through `opencode.json` and can access TetApp through the `@tetapp` reference.

Claude Code loads the same shared documents through the root `CLAUDE.md` imports. If access to the sibling reference requires approval, use `/add-dir ../tetapp` in Claude Code. Codex reads `AGENTS.md`, which points to the same documents. Do not maintain separate copies of the product specification for each agent.

Claude used as a model inside OpenCode already receives `opencode.json` instructions; no standalone Claude Code CLI is needed for that workflow. After changing agent context/configuration, restart the agent session so it reads the current files.
