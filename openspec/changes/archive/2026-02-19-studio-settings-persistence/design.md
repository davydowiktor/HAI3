## Context

Studio already persists panel UI state (position, size, button position, collapsed) via event-driven effects: `persistenceEffects.ts` subscribes to Studio events and writes to localStorage; hooks like `useDraggable` call `loadStudioState()` for initial value and emit events on change, and effects persist those events. The framework does not know about Studio; Studio reads and controls app state only through public hooks and the event bus.

Framework plugins already subscribe to domain events: themes plugin to `theme/changed`, i18n to `i18n/language/changed`, mock effects to `mock/toggle`. The microfrontends plugin uses `screensetsRegistry.executeActionsChain` for mounting extensions; there is no single "navigation/screenset/navigated" event in the current architecture—Studio’s GTS Package dropdown (MfePackageSelector) calls `registry.executeActionsChain(HAI3_ACTION_MOUNT_EXT, …)` directly. Control panel components use `useTheme().setTheme`, `useTranslation().setLanguage`, `toggleMockMode()`, and the registry; those ultimately emit the framework events above (theme, i18n, mock). GTS Package selection is done by calling the registry, not by emitting an event.

Constraints: zero changes to app and framework; no new framework events or APIs; no Studio-specific branches outside `packages/studio`. Event-driven architecture and existing event names must be respected.

## Goals / Non-Goals

**Goals:**

- Persist control panel settings (theme, language, mock API, GTS Package selection) across reloads using the same event-driven persistence pattern as panel position.
- Save path: subscribe to the same framework events that already fire when the user changes these settings and write values to localStorage.
- Load path: on Studio init, read persisted values and re-apply them by emitting the same framework events (theme, i18n, mock) and by calling the same registry API used for GTS Package selection (no new framework API).
- Keep all new logic and storage keys inside `@hai3/studio`; framework and app remain unchanged.

**Non-Goals:**

- Changing framework plugins, event contracts, or app code.
- Persisting app-level or framework-level state that is not already controllable from the Studio control panel.
- Adding a new "restore settings" event to the framework; restoration is done by Studio emitting existing events and calling existing APIs.

## Decisions

**1. Save path: subscribe to framework events in Studio persistence effects**

- Persistence effects in `packages/studio` will subscribe to `theme/changed`, `i18n/language/changed`, and `mock/toggle` (same events the framework already uses). On each event, persist the payload to localStorage under Studio-owned keys (e.g. under existing `STORAGE_PREFIX`).
- **Rationale:** Matches the existing position/size pattern (effects subscribe to events, write to localStorage). No framework change; framework already emits these events when the user changes theme, language, or mock mode from the control panel or elsewhere.
- **Alternative considered:** Persist only when Studio control panel triggers the change. Rejected so that any source of these events (e.g. app code or other UI) is reflected in persisted "last used" settings.

**2. Save path for GTS Package selection: subscribe to a Studio-emitted event**

- The GTS Package dropdown does not emit a framework event when the selection changes; it calls `screensetsRegistry.executeActionsChain`. So we introduce a **Studio-only** event (e.g. `studio/activePackageChanged`) that the GTS Package dropdown (or a thin wrapper) emits when the user selects a package, and persistence effects subscribe to that and persist the package id (or relevant extension id).
- **Rationale:** Keeps the rule "effects subscribe to events and write"; we do not subscribe to framework events for package because there is no such event. The new event is internal to Studio and not part of the framework contract.
- **Alternative considered:** Have persistence effects call the registry to read "current" package after every framework event. Rejected to avoid tight coupling and to keep a single pattern: events drive persistence.

**3. Load path: emit framework events and call registry from Studio init**

- When Studio mounts (e.g. in `StudioProvider` or a dedicated init effect), after the app/registry is available:
  - Read persisted theme, language, and mock enabled from localStorage.
  - Emit `theme/changed`, `i18n/language/changed`, and `mock/toggle` with those values. Framework plugins already handle these; no framework change.
  - Read persisted GTS Package (or extension) id; call `screensetsRegistry.executeActionsChain` with `HAI3_ACTION_MOUNT_EXT` for the persisted extension/domain, if the registry and persisted id are valid.
- **Rationale:** Load path is the inverse of save: we push persisted values back through the same channels the framework already understands. No new framework behavior; Studio remains self-contained.
- **Alternative considered:** Framework "restore" hook or event. Rejected to preserve zero framework footprint.

**4. Where to run load (restore) logic**

- Run restore in a `useEffect` in `StudioProvider` (or a small helper invoked from it), after `initPersistenceEffects` so that both save and load are initialized when Studio mounts. Use the same `eventBus` and, where needed, `useHAI3()` or a way to get `screensetsRegistry` (e.g. from a hook that already has app context) so we can call `executeActionsChain` for package restore. If the registry is not yet available on first paint, defer package restore until it is (e.g. one-off effect that runs when registry becomes available).
- **Rationale:** Keeps init in one place and avoids duplicating "when Studio is ready" logic.

**5. Storage keys and payload shape**

- Add keys to `STORAGE_KEYS` (e.g. `theme`, `language`, `mockEnabled`, `activePackageId` or `mountedExtensionId`) and persist the same shapes the framework events use (`ChangeThemePayload`, `SetLanguagePayload`, `MockTogglePayload`) plus a single string for package/extension id. Use existing `saveStudioState` / `loadStudioState` and the same prefix so keys stay under `hai3:studio:*`.
- **Rationale:** Consistent with existing position/size/collapsed keys; no new persistence abstraction.

**6. No UI reads from localStorage for these settings**

- Control panel components continue to use only hooks (`useTheme`, `useTranslation`, `useAppSelector` for mock, `useActivePackage` / registry for package). Initial app state after load is set by the restore step (emitting events / calling registry); the UI then reflects framework state. We do not pass "initial value from localStorage" into selectors or dropdowns.
- **Rationale:** Single source of truth (framework state); restore runs once on init and syncs that state from localStorage.

## Risks / Trade-offs

- **Stale or invalid persisted values:** If the user had a theme/language/package that was later removed, restore might apply an invalid id. **Mitigation:** Use the same validation the framework uses (e.g. themeRegistry/i18nRegistry only apply if the id exists); for package, only call `executeActionsChain` if the extension/package still exists in the registry. Optionally guard with try/catch and fall back to default.
- **Order of restore vs. framework readiness:** If we emit theme/language/mock before the framework has registered its listeners, the events might be missed. **Mitigation:** Run restore in an effect that runs after mount; the app and framework are already initialized when Studio overlay mounts (Studio is a sibling to app content). If needed, run restore on next tick or after a short delay so plugin subscriptions are in place.
- **GTS Package restore depends on registry:** If `screensetsRegistry` or extensions are not yet registered when Studio mounts, we cannot mount the persisted extension immediately. **Mitigation:** Defer GTS Package restore until the registry and extensions are available (e.g. effect that depends on registry and persisted id, or retry once when `useRegisteredPackages` / registry reports ready).
