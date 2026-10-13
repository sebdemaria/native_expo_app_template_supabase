# NutriPlan Product Context

## Vision

NutriPlan is a personal food-planning assistant. It saves time by preparing a useful weekly menu, reusable recipes, and a consolidated shopping list based on the user's goals, preferences, budget, schedule, and available cooking time.

The weekly plan is the primary product loop. NutriPlan is not intended to become an exhaustive calorie tracker.

## Confirmed Decisions

- Backend: Supabase, not Firebase.
- Nutrition source: USDA plus a curated catalog with regional Spanish aliases and trusted portions.
- AI mode: hybrid. Reuse validated recipes first; generate and validate a new recipe only when needed.
- Medical scope: no therapeutic or condition-specific plans until rules are reviewed by a qualified professional.
- MVP ownership: one personal account. Family collaboration is postponed.
- Development team: the user and OpenCode.

## Core MVP Journey

1. The user creates an account.
2. The user completes nutrition and planning onboarding.
3. The app calculates orientative energy and macro targets deterministically.
4. The user receives or requests a weekly plan.
5. The user reviews recipes, portions, and daily distribution.
6. The user regenerates or replaces individual meals without changing the rest of the week.
7. The user approves the plan.
8. The app derives a consolidated shopping list.
9. The user confirms meals with a simple status and optional consumed percentage.
10. The dashboard shows plan compliance, confirmation coverage, estimated nutrition, and the next meal.
11. The user repeats the approved or modified version in a later week without paying for another AI generation.

## Onboarding Inputs

- Age and the biological inputs required by the selected TMB policy.
- Weight and height.
- Activity level and approximate training frequency/intensity.
- Goal: balanced eating, maintain weight, reduce body fat, or gain muscle.
- Preferred and rejected foods.
- Allergies, intolerances, and exclusions.
- Cooking-time limits.
- Approximate budget level.
- Number of servings.
- Meal slots to plan and usual meal times.
- Planning weekday and food-week start day.
- Initial choice of a new plan or a repeated plan when an approved plan exists.
- Notification preferences.

All numeric targets are orientative, versioned, and editable within safe policy bounds.

## Weekly Planning

Plan statuses should initially support `draft`, `pending_review`, `approved`, and `archived`.

The user can:

- Approve a generated plan.
- Regenerate one meal with structured feedback.
- Replace one meal using available ingredients.
- Replacement priorities: similar nutrition, available ingredients only, or faster preparation. If requirements cannot be satisfied, explain that rather than silently using unavailable foods.
- Swap meals between days.
- Change servings.
- Favorite recipes.
- Repeat a previous approved or modified plan.
- Restore the original approved snapshot when repeating.
- Keep selected meals and generate alternatives only for the others.

Changing one meal must not regenerate unrelated meals.

When repeating an edited plan, ask whether to reuse the modified plan or the original approved snapshot. Both choices must work without AI. A changed profile/goal must not silently rewrite an old plan; flag target differences when repeating.

Define the immutable recipe revision concept without requiring a separate version table from day one: an immutable recipe row or validated snapshot is acceptable. Historical meals and approvals must never point to mutable "latest recipe" values.

## Portion Semantics

Keep three quantities separate:

- **Recipe yield:** base number of servings produced by the recipe ingredients.
- **Prepared servings:** total cooked for all diners; used to scale shopping quantities.
- **User planned portion:** servings allocated to the account owner; used for personal targets and consumption.

For example, a two-serving recipe prepared for four people uses twice its ingredients. If the user eats one serving, their dashboard records one serving, not four. Consumed percentage multiplies the user's planned portion. These operations are deterministic and do not call Gemini.

## Recipes

Every usable recipe contains:

- Immutable recipe version ID.
- Localized title and description.
- Servings.
- Preparation and cooking times.
- Canonical ingredients with quantities, units, and resolved edible grams.
- Ordered instructions.
- Deterministically calculated calories and macros per serving.
- Dietary and allergen tags.
- Source and validation metadata.

AI-proposed nutrition values are ignored. The backend resolves ingredients and computes nutrition from the catalog.

## Feedback

Structured reasons:

- Disliked ingredient.
- Too elaborate.
- Not enough time.
- Too expensive.
- Wants more variety.

Feedback must distinguish stable preferences from temporary context. Free-text feedback can guide generation but must never become an authoritative allergy or medical rule automatically.

## Shopping List

- Derived from the active approved plan revision.
- Scale ingredients by servings.
- Aggregate only compatible canonical foods and units.
- Preserve source links to recipes and meals.
- Group by category.
- Allow purchased, already-at-home, and manual quantity states.
- Recalculate affected items after meal replacements.
- No persistent pantry inventory in the MVP.

## Meal Confirmation

Statuses:

- `eaten_as_planned`
- `eaten_modified`
- `substituted`
- `skipped`
- `pending`

Optional consumed percentage presets: 50%, 75%, 100%, and 125%. Unconfirmed meals mean unknown consumption, never zero consumption.

Compliance is calculated only over evaluated meals. Coverage communicates how many past planned meals have a confirmation. Future meals and unconfirmed past meals do not lower compliance.

| Situation                                              | Evaluated?          | Compliant?                        | Nutrition                                                             |
| ------------------------------------------------------ | ------------------- | --------------------------------- | --------------------------------------------------------------------- |
| Original meal confirmed consumed                       | Yes                 | Yes                               | Captured recipe nutrition × user's portion × consumed percentage      |
| App-approved replacement confirmed consumed            | Yes                 | Yes                               | Captured replacement nutrition × user's portion × consumed percentage |
| Portion-only change                                    | Yes, once confirmed | Yes                               | Scaled deterministically                                              |
| Skipped meal                                           | Yes                 | No                                | Explicitly zero for this occurrence                                   |
| Future meal or pending/absent confirmation             | No                  | Not applicable                    | Unknown, not zero                                                     |
| Arbitrary other food or unspecified ingredient changes | Yes, once confirmed | Requires an explicit product rule | Unknown unless actual ingredients/recipe and quantities are recorded  |

The `substituted`/`eaten_modified` labels alone do not establish compliance. Track whether the substitution was approved within the app. Do not invent a rule for arbitrary substitutions; resolve it before implementing the dashboard.

Confirmations belong to a stable planned-meal occurrence, not a reusable recipe. Preserve the recipe/nutrition snapshot consumed; later edits cannot rewrite past confirmations.

Compliance = compliant evaluated occurrences / evaluated occurrences. With no evaluated occurrences, show no-data copy. Coverage = evaluated eligible occurrences / eligible occurrences. For coverage, eligible means a meal whose planned instant is at or before the supplied `now`; future confirmations need a separate UX policy before being enabled.

## Dashboard Priority

1. Weekly compliance, the dominant metric.
2. Confirmation coverage and outstanding confirmations.
3. Next meal and direct recipe access.
4. Completed and pending meals.
5. Estimated daily calories and macros versus orientative targets.

Nutrition is secondary to following the weekly plan.

## Notifications

- Weekly plan ready.
- Upcoming meal reminder.
- Optional cooking reminder.
- Optional post-meal confirmation reminder.

Notification taps deep-link to the exact plan meal. Plan edits cancel or reschedule only affected reminders.

## Minimal Data Model

This is a staged direction, not a mandatory inventory to create before development.

### First slice: authentication and onboarding

- `profiles`, keyed by the Supabase user ID with ownership RLS.
- Initially colocate validated planning preferences and structured dietary settings where appropriate. Client-editable inputs and server-authoritative calculation outputs must have separate write permissions; RLS row ownership alone does not enforce that separation.
- Snapshot calculation inputs, outputs, and policy version when producing a plan. Add a separate nutrition-profile history table only when the history use case needs it.

### Working non-AI planning slice

Introduce `foods`, `recipes`, `recipe_ingredients`, `weekly_plans`, `planned_meals`, `plan_revisions`, `meal_confirmations`, and `shopping_items` as their screens/operations are built.

- Canonical foods may store versioned per-100g nutrients and trusted portion metadata in columns or validated JSONB initially.
- Separate food aliases, portions, nutrient rows, dietary rules, or recipe versions into tables when SQL querying/constraints justify that decision.
- `plan_revisions` may use validated JSONB snapshots instead of a full event-sourced model.
- Preserve stable occurrence IDs, optimistic revision checks, immutable original approved and modified snapshots, and the exact recipe/nutrition snapshot consumed.
- Do not introduce plan change-event tables or mandatory full history snapshots for every keystroke.

### AI and automation slices

- Add `meal_feedback` and `generation_jobs` with their workflows.
- Implement quotas and idempotency before making provider calls available, not after launching AI.
- Add push devices/delivery state before server notifications, and RevenueCat events/entitlements before paid access.

Simplify storage, not safety: canonical ingredients, trusted conversions, deterministic calculations, transactional writes, RLS, and historical reproducibility remain mandatory.

## AI Generation Pipeline

1. Authenticate user and reserve quota atomically.
2. Snapshot profile, targets, dietary rules, and preferences.
3. Filter incompatible recipes deterministically.
4. Send a bounded candidate set to Gemini.
5. Parse bounded structured JSON with Zod.
6. Resolve and validate every selected or generated recipe.
7. Check completeness, restrictions, target tolerances, and variety.
8. Allow one repair attempt.
9. Save a reviewable plan revision transactionally.
10. Commit quota and notify the user.

Generation uses a durable `generation_jobs` record so the app may close and resume. Cron leases eligible jobs rather than performing uncontrolled direct generations.

Respect each user's planning weekday and IANA time zone. Avoid duplicate plans for the same user/week and stop automatic generations after an explicitly configured inactivity threshold. Model identity is configurable; verify availability/pricing before integration instead of hardcoding the model throughout the domain.

## Monetization

Freemium with RevenueCat. Exact quotas remain a product decision.

USD 2.99/month is a price hypothesis only, not an approved store price. Validate price and generation limits against measured provider costs.

- Manual edits, confirmations, repeats, and shopping recalculation do not consume AI quota.
- Weekly generations, meal regenerations, and AI replacements can have separate quotas.
- RevenueCat webhooks are authoritative for entitlements.
- Backend checks entitlement and quota before calling Gemini.

## Analytics

Initial metrics:

- Onboarding completion.
- First plan requested, generated, and approved.
- Regeneration and replacement frequency/reasons.
- Shopping-list usage.
- Meal-confirmation coverage.
- Weekly compliance.
- D7 and D30 retention.
- Four consecutive planned weeks.
- AI cost per successful plan and active user.
- Paywall conversion and cancellations.

Analytics events contain no nutrition or health values.

## Out Of Scope For MVP

- Condition-specific therapeutic plans.
- Apple Health and Health Connect.
- Photo ingredient recognition.
- Persistent pantry inventory.
- Family/shared accounts.
- Dietitian or clinician access.
- Watch/Wear apps and voice assistants.
- Exact-alarm permission.

## Implementation Stages

1. Foundation: auth, navigation, RLS, local UI primitives.
2. Vertical flow without AI: onboarding, a small verified catalog, minimum tested nutrition/portion calculations, one weekly plan, approval, shopping, confirmations.
3. Nutrition engine expansion: additional canonical foods, aliases, units, target policies, serving cases, and tests. Do not postpone the basic calculations required by stage 2.
4. AI hybrid: jobs, generation, regeneration, replacement, feedback.
5. Automation: scheduled planning, repetition, notifications.
6. Launch: RevenueCat, deletion, hardening, store release. Add privacy-safe analytics with the first product loop and cost telemetry/quotas with AI, not only at launch.

## Open Decisions Before Relevant Features

- Auth methods, email verification, mobile password-reset callback, and password policy aligned with Supabase.
- TMB formula inputs, activity multipliers, goal adjustments, target bounds, and medical eligibility screening. No policy is approved just because a formula was suggested in discussion.
- Compliance classification for arbitrary other food/ingredient changes and corrections to past confirmations.
- Behavior for travel/timezone changes, missing/duplicated DST wall times, and reminders for unapproved plans.
- Budget means an approximate preference until ingredient price data exists; do not promise a verified monetary budget.
- How list recalculation preserves purchased/at-home/manual overrides when required quantities change.
- Initial curated catalog size, licensing/provenance, and regional aliases.
- Inactivity threshold, per-operation quotas, subscription pricing, and consent/retention policy.

These decisions are not prerequisites to create the scaffold, but must be settled before their production behavior is implemented.
