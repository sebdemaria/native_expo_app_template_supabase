# TetApp Reuse Map

TetApp lives at `../tetapp` and is exposed to OpenCode as the `@tetapp` reference. It is a read-only implementation reference for NutriPlan unless the user explicitly requests changes there.

## Reuse Strategy

Port the behavior and relevant tests into NutriPlan's stack:

- JavaScript becomes strict TypeScript.
- Firebase integration becomes Supabase queries, RLS, RPCs, Edge Functions, or Cron.
- Remote Zustand arrays become TanStack Query data.
- Manual form state becomes React Hook Form plus Zod.
- StyleSheet UI becomes NativeWind components.
- TetApp names, storage keys, IDs, colors, and health-care terminology are replaced.

Copy leaf modules selectively. Do not copy whole folders without reviewing imports and product assumptions.

The reference grants discovery/access; its description is not an enforced read-only filesystem permission. Never modify TetApp while working on NutriPlan without an explicit user request, and never copy `.env*`, service-account files, signing material, or provider credentials.

## Migration Status And Priority

Already ported: `plugins/withIosSceneLifecycle.js`, adapted for SDK 57/Swift import rules. Query/preferences are newly implemented NutriPlan scaffolding, not copies of TetApp product features.

Base tooling has now also been ported: Prettier conventions, custom import/export groups, VS Code on-save actions, Husky, commitlint, lint-staged, Jest coverage conventions, ignores, and EAS build profile structure. See `docs/TOOLING.md` for adaptations and exclusions; SDK 57 and NativeWind integration remain intact.

No TetApp business feature is required to be copied before work can start. The next useful ports are small auth/form controls and their tests alongside Supabase authentication. Scheduling, notification reconciliation, charts, and exports should be ported when their corresponding feature is built, not preloaded into the scaffold.

## First Milestone: Auth And Profile UX

Reference:

- `../tetapp/src/components/room/RoomLoginSection.jsx`
- `../tetapp/src/components/room/RoomRegisterSection.jsx`
- `../tetapp/src/components/room/RoomResetSection.jsx`
- `../tetapp/src/components/room/RoomPasswordField.jsx`
- `../tetapp/src/components/room/RoomBootScreen.jsx`
- `../tetapp/src/components/PasswordVisibilityIcon.jsx`
- `../tetapp/src/components/room/__tests__/roomAuthValidation.test.js`
- `../tetapp/src/components/room/__tests__/RoomBootScreen.test.jsx`
- `../tetapp/src/modals/content/userAccount/UserProfileModalContent.jsx`
- `../tetapp/src/utils/userProfile.js`
- `../tetapp/src/utils/__tests__/userProfile.test.js`

Reuse password visibility, keyboard/loading/error handling, session-bootstrap UX, save/retry behavior, and pure initials helpers. Read login/new-password validation tests to preserve the distinction: login should not apply a new-password complexity rule that rejects existing valid accounts.

Reimplement the backend flows using Supabase Auth and RHF/Zod. Do not carry over usernames, required first/last names, room access tokens/passwords, Firebase custom auth, credential persistence, or biometric behavior unless explicitly requested. TetApp's auth coordinator is a flow reference, not a porting base.

Before implementation, align signup/reset policy with Supabase, decide email confirmation, configure mobile redirects/callback routing, implement session refresh on native AppState transitions, and define logout/user-switch query-cache cleanup. `detectSessionInUrl: false` means NutriPlan must explicitly handle mobile auth callback URLs.

## Highest Value: Notifications

Reference:

- `../tetapp/src/hooks/useNotifications.js`
- `../tetapp/src/services/notificationPermissions.js`
- `../tetapp/src/services/medicationNotifications.js`
- `../tetapp/src/components/NotificationCoordinator.jsx`
- `../tetapp/src/services/__tests__/medicationNotifications.test.js`
- `../tetapp/src/hooks/__tests__/useNotifications.test.js`
- `../tetapp/src/components/__tests__/NotificationCoordinator.test.jsx`
- `../tetapp/src/consts/notifications.js`
- `../tetapp/src/consts/app.js` (notification constants only)
- `../tetapp/src/hooks/useMedicationNotifications.js`
- `../tetapp/src/hooks/__tests__/useMedicationNotifications.test.js`

Port these behaviors:

- Persistent notification ID registry.
- Serialized registry mutations.
- Grouped and prefix-based cancellation.
- Desired-state reconciliation through deterministic fingerprints.
- Cancellation after completion or plan edits.
- Foreground and cold-start response handling.
- Navigation readiness and response deduplication.
- No scheduling in the past.
- Locale/time changes invalidating fingerprints.

NutriPlan groups should be meal/plan based. Remove Firebase session restoration, rooms, babies, medications, invitations, exact feeding alarms, and TetApp channel copy.

Do not add exact-alarm permission for meal reminders.

There are two distinct persistent states: the scheduled notification ID registry and the desired-plan fingerprints. Promise queues serialize within one JS runtime only; they are not cross-runtime or distributed locks. Add focused cancellation/concurrency tests during extraction rather than assuming the existing test suites prove every case. Foreground local reminders and server push delivery also need explicit deduplication policy.

## Scheduling And Occurrence Concepts

Reference:

- `../tetapp/src/services/medicationRecords.js`
- `../tetapp/src/screens/Health/subsections/medication/medicationUiHelpers.js`
- `../tetapp/src/services/__tests__/medicationRecords.test.js`

Useful concepts:

- Stable planned occurrence keys.
- Expansion of definitions into dated occurrences.
- Merging planned occurrences with completion records.
- Selecting the next pending occurrence.
- Date-key iteration in an explicit IANA time zone.
- Effective versions preserving historical records.

Do not port TetApp's fixed 24-hour recurrence invariant. Meal reminders must remain at the same local wall-clock time through DST.

The timezone helpers are references, not a complete gap/fold policy. NutriPlan needs explicit behavior for nonexistent spring-forward and duplicate autumn times. Validate invalid IANA zones rather than silently grouping a user's plan in UTC.

## Date Ranges And History

Reference:

- `../tetapp/src/services/historyDataQueries.js`
- `../tetapp/src/components/history/useHistoryData.js`
- `../tetapp/src/hooks/useData.js`
- `../tetapp/src/utils/date.js`
- `../tetapp/src/services/__tests__/historyDataQueries.test.js`

Port these patterns:

- Half-open `[start, end)` ranges.
- Calendar arithmetic rather than assuming every day is 24 hours.
- Recent range by default and historical dates on demand.
- AppState refresh when crossing a day boundary.
- Separate table and chart ranges.
- Full export queries only when requested.

Rewrite all query construction for Supabase and TanStack Query. Do not copy Firestore listeners, aggregate loading state, or arrays stored in Zustand.

TetApp's `localDateOnly` and history bounds use the device/runtime timezone. Adapt the concept to the profile's explicit IANA timezone; copied date helpers do not automatically satisfy NutriPlan's requirements. Build and test this date core before weekly planning.

## UI Primitives

Reference:

- `../tetapp/src/components/AsyncButton.jsx`
- `../tetapp/src/components/TextField.jsx`
- `../tetapp/src/components/SegmentedOptionGroup.jsx`
- `../tetapp/src/components/WheelPicker.jsx`
- `../tetapp/src/components/CalendarPicker.jsx`
- `../tetapp/src/components/FormModal.jsx`
- `../tetapp/src/components/Toast.jsx`
- `../tetapp/src/hooks/useDialog.js`
- `../tetapp/src/hooks/useToast.js`
- `../tetapp/src/components/InputSelect.jsx`

Companion tests to adapt:

- `../tetapp/src/components/WheelPicker.test.jsx`
- `../tetapp/src/components/__tests__/InputSelect.test.jsx`

Reuse interaction behavior such as loading protection, keyboard avoidance, destructive confirmations, tablet width, and asynchronous actions. Rebuild styling with NativeWind and expose typed React Hook Form adapters where applicable.

For the first slice, port only button, text/password field, error presentation, and toast/dialog behavior. Add time/quantity/calendar controls when onboarding/planning needs them. Review select clipping, outside dismissal, and accessibility instead of copying the old dropdown unchanged.

Avoid copying the global modal registry and callbacks stored in Zustand. Prefer route modals, local sheets, and discriminated typed payloads.

## Dashboard And Charts

Reference:

- `../tetapp/src/hooks/useAppDashboard.js`
- `../tetapp/src/components/CollapsibleChart.jsx`
- `../tetapp/src/components/history/HistoryChartsSection.jsx`

Port pure aggregation ideas:

- Group records by local day.
- Planned versus consumed series.
- Seven-day chart construction.
- No-data and insufficient-data states.
- Collapsible chart presentation.
- Tablet width handling.

Create new pure NutriPlan selectors with explicit anchor date and time zone. Do not copy TetApp colors, feeding semantics, or monolithic chart components.

## Exports

Reference:

- `../tetapp/src/services/nativeExcelExport.js`
- `../tetapp/src/services/historyExportWorkbook.js`
- `../tetapp/src/services/__tests__/nativeExcelExport.test.js`
- `../tetapp/src/services/__tests__/historyExportWorkbook.test.js`

The native write/share adapter and its dependency-injected tests are highly reusable. Replace workbook sheets with weekly plans, shopping items, confirmations, and nutrition summaries. Verify the Expo SDK 57 FileSystem API instead of blindly retaining `expo-file-system/legacy`.

Export is not required for the first NutriPlan vertical slice.

## Localization

Already adapted in NutriPlan: typed ES/EN resources, regional locale normalization, fallback, interpolation/plurals, device-language selection, persisted preferences, reactive UI, independent background translator instances, and completeness/regression tests. See `docs/I18N.md`. TetApp's global mutable locale was not ported.

Reference:

- `../tetapp/src/i18n/index.js`
- `../tetapp/src/i18n/__tests__/medicationTranslations.test.js`

Reuse locale normalization, interpolation behavior, fallback ideas, and translation-tree completeness tests. Do not copy the monolithic dictionary or mutable global locale. NutriPlan should use typed namespaces and reactive locale state.

## Account Deletion

Reference:

- `../tetapp/src/modals/content/userAccount/UserDeleteModalContent.jsx`
- `../tetapp/src/screens/AccountDeletionScreen.jsx`
- `../tetapp/src/hooks/useUser.js`
- `../tetapp/src/modals/content/__tests__/UserDeleteModalContent.test.jsx`
- `../tetapp/src/screens/__tests__/AccountDeletionScreen.test.jsx`

Port the irreversible-action UX, loading/error/retry states, cancellation of local notifications, cache clearing, persisted-state cleanup, analytics reset, and navigation to auth. Replace the backend completely with an authenticated Supabase Edge Function and database cascades/anonymization policy.

Do not copy TetApp room ownership transfer logic.

## Tooling And Tests

Reference:

- `../tetapp/package.json`
- `../tetapp/jest.config.js`
- `../tetapp/eslint.config.js`
- `../tetapp/.prettierrc`

Reuse the discipline of a combined check command, dependency injection for native APIs, and pure service tests. NutriPlan additionally requires TypeScript checking and Supabase RLS integration tests.

High-value test scenarios to recreate:

- Week/month/year boundaries.
- DST meal times staying fixed locally.
- Half-open history ranges.
- Notification reconciliation after plan edits and confirmations.
- Cold-start notification navigation.
- RLS isolation between two users.
- Idempotent AI jobs and webhook processing.
- Deterministic nutrition fixtures and unit conversions.

## Expo And Native Configuration

Reference only:

- `../tetapp/app.config.js`
- `../tetapp/app.json`
- `../tetapp/eas.json`

Reuse environment validation, EAS profile separation, deep-link schemes, notification plugins, and CNG principles. Never copy TetApp bundle IDs, EAS IDs, Firebase service files, app groups, signing configuration, update URLs, or emulator plugins.

NutriPlan already ports `../tetapp/plugins/withIosSceneLifecycle.js` as `plugins/withIosSceneLifecycle.js` because Xcode 27 requires the UIKit scene lifecycle. Keep it registered in `app.json` and regenerate native projects after changing it.

## Explicitly Do Not Copy

- `../tetapp/firebaseConfig.js`
- `../tetapp/functions/`
- `../tetapp/functions-actions/`
- `../tetapp/src/hooks/useData.js` as an architecture
- `../tetapp/src/hooks/useSession.js`
- `../tetapp/src/services/roomDataSubscriptions.js`
- `../tetapp/src/services/feedingSessionRepository.js`
- TetApp remote-data Zustand slices
- Room/member/baby collaboration infrastructure
- Watch, Wear OS, Siri, App Intents, and Android App Actions
- Firebase emulator configuration and service files
- Global action callbacks stored in Zustand
- Broad `@utils` imports that initialize Firebase

## Porting Checklist

Before porting a TetApp module:

1. Identify the product invariant NutriPlan needs.
2. Read the leaf module and its tests.
3. List Firebase, Zustand, translation, and StyleSheet coupling.
4. Copy or recreate tests using NutriPlan terminology.
5. Implement a strict TypeScript pure core.
6. Add Supabase or native adapters at the boundary.
7. Verify with `yarn run check` and the relevant device flow.
8. Document intentional behavior differences.
