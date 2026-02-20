## Why

Studio control panel choices (GTS Package, mock API, theme, language) are not persisted across reloads, so developers lose their dev setup every session. Persisting these settings in the same way Studio already persists panel position will improve dev experience with no impact on the app or framework, since Studio is a dev-only overlay that is excluded from production.

## What Changes

- **Save path (already in place for position):** Studio uses event-driven effects in `persistenceEffects.ts` that subscribe to framework events and write to localStorage. Extend this pattern so that when the user changes GTS Package, mock API, theme, or language (via control panel), Studio subscribes to or mirrors the same framework events and persists those values.
- **Load path (mirror in reverse):** On initialization, Studio reads persisted settings from localStorage and emits the same framework events the framework already listens to. No new framework or app logic: framework plugins already handle `theme/changed` (themes.ts → themeRegistry.apply), `i18n/language/changed` (i18n.ts → i18nRegistry.setLanguage), and mock mode (mock.ts, e.g. toggleMockMode). GTS Package selection is applied by Studio calling the same registry API the control panel uses (e.g. executeActionsChain). Studio restores state by emitting these events and calling that API with persisted values; the framework applies them as it already does. Zero framework changes, zero app changes.
- Ensure zero footprint on app and framework: no new APIs, no new dependencies, no Studio-specific conditional logic outside the Studio package. Studio remains self-contained; the load path mirrors the save path, and Studio stays fully excluded from production builds.

## Capabilities

### New Capabilities

- `studio-settings-persistence`: Persist Studio control panel settings (GTS Package, mock API, theme, language) via event-driven localStorage. Save path: effects subscribe to framework events and a Studio-only event for package selection, and write to localStorage. Load path: on init, read from localStorage and emit the same framework events (`theme/changed`, `i18n/language/changed`, mock toggle) and call the same registry API for GTS Package; framework plugins already handle the events. All logic and storage keys live in `@hai3/studio`; app and framework unchanged.

### Modified Capabilities

- *(none)*

## Impact

- **Affected code**: `packages/studio` only (events, persistence effects, storage keys, control panel initial state and change handlers). No changes to `packages/framework`, `packages/react`, or app-level code.
- **Registries / layers**: No impact. Studio remains a dev-only overlay with no new integration points.
- **Rollback / risk**: Low. Changes are confined to Studio; reverting is limited to the studio package. No new surface area for app or framework.
