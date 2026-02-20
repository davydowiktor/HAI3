## 1. Storage keys and Studio event

- [x] 1.1 Add THEME, LANGUAGE, MOCK_ENABLED, and ACTIVE_PACKAGE_ID to STORAGE_KEYS in packages/studio/src/types.ts (same prefix as existing keys)
- [x] 1.2 Add Studio-only event studio/activePackageChanged with payload type (e.g. activePackageId or extensionId) in studioEvents.ts and extend EventPayloadMap

## 2. Save path: persistence effects

- [x] 2.1 In persistenceEffects.ts subscribe to theme/changed and on payload call saveStudioState(STORAGE_KEYS.THEME, payload.themeId)
- [x] 2.2 In persistenceEffects.ts subscribe to i18n/language/changed and on payload call saveStudioState(STORAGE_KEYS.LANGUAGE, payload.language)
- [x] 2.3 In persistenceEffects.ts subscribe to mock/toggle and on payload call saveStudioState(STORAGE_KEYS.MOCK_ENABLED, payload.enabled)
- [x] 2.4 In persistenceEffects.ts subscribe to studio/activePackageChanged and on payload call saveStudioState(STORAGE_KEYS.ACTIVE_PACKAGE_ID, payload id)
- [x] 2.5 Return cleanup for all new subscriptions from initPersistenceEffects

## 3. Control panel: emit studio/activePackageChanged when package changes

- [x] 3.1 In GTS Package dropdown (MfePackageSelector) or wrapper, after successful executeActionsChain for package change, emit studio/activePackageChanged with the selected package or extension id

## 4. Restore: read from storage and apply

- [x] 4.1 Add restoreStudioSettings() (or equivalent) that reads theme, language, mockEnabled from localStorage via loadStudioState; if present, emit theme/changed, i18n/language/changed, mock/toggle with those values
- [x] 4.2 In restore logic, read activePackageId (GTS Package) from storage; when screensetsRegistry is available and id is valid, call executeActionsChain with HAI3_ACTION_MOUNT_EXT for persisted extension/domain; skip or defer if registry not ready or id invalid (no throw)

## 5. Wire restore into StudioProvider

- [x] 5.1 In StudioProvider useEffect (after initPersistenceEffects), call restore for theme, language, mock so they run once on mount
- [x] 5.2 Run GTS Package restore when registry is available (e.g. effect that has access to app/registry and runs when persisted activePackageId exists and registry is ready; defer with one-off or dependency on useHAI3/registry)

## 6. Verification

- [x] 6.1 Confirm no changes in packages/framework or packages/react for this feature
- [x] 6.2 Confirm control panel components do not read from localStorage for theme, language, mock, or GTS Package; they use hooks only and restore sets framework state on init
