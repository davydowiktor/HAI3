# studio-settings-persistence Specification

## Purpose

Persist Studio control panel settings (theme, language, mock API, GTS Package selection) across page reloads using the same event-driven localStorage pattern as Studio panel position. Save path: Studio effects subscribe to framework events (and one Studio-only event for GTS Package) and write to localStorage. Load path: on Studio init, read from localStorage and emit the same framework events or call the same registry API so the framework applies the persisted state. The control panel uses the GTS Package dropdown (MfePackageSelector), not a screenset dropdown. All logic and storage keys live in `@hai3/studio`; app and framework are unchanged.

## ADDED Requirements

### Requirement: Persist theme when it changes

The system SHALL persist the current theme id to localStorage whenever the framework emits the `theme/changed` event.

#### Scenario: Theme change is persisted
- **WHEN** the event bus emits `theme/changed` with a payload (e.g. `{ themeId: 'dark' }`)
- **AND** Studio persistence effects are active
- **THEN** the theme id from the payload SHALL be written to localStorage under a Studio-owned key (e.g. `hai3:studio:theme`)
- **AND** the write SHALL be performed by Studio code only (no framework or app code)

#### Scenario: Theme persistence uses same pattern as position
- **WHEN** Studio mounts
- **THEN** persistence effects SHALL subscribe to `theme/changed` in addition to existing Studio UI events
- **AND** on each `theme/changed` emission the effect SHALL call the same persistence utility used for position/size (e.g. saveStudioState)

### Requirement: Persist language when it changes

The system SHALL persist the current language to localStorage whenever the framework emits the `i18n/language/changed` event.

#### Scenario: Language change is persisted
- **WHEN** the event bus emits `i18n/language/changed` with a payload (e.g. `{ language: 'de' }`)
- **AND** Studio persistence effects are active
- **THEN** the language from the payload SHALL be written to localStorage under a Studio-owned key (e.g. `hai3:studio:language`)
- **AND** the write SHALL be performed by Studio code only

### Requirement: Persist mock mode when it changes

The system SHALL persist the mock API enabled state to localStorage whenever the framework emits the `mock/toggle` event.

#### Scenario: Mock toggle is persisted
- **WHEN** the event bus emits `mock/toggle` with a payload (e.g. `{ enabled: true }`)
- **AND** Studio persistence effects are active
- **THEN** the enabled value from the payload SHALL be written to localStorage under a Studio-owned key (e.g. `hai3:studio:mockEnabled`)
- **AND** the write SHALL be performed by Studio code only

### Requirement: Persist GTS Package selection when user selects it in Studio

The system SHALL persist the active GTS Package or mounted extension id to localStorage when the user changes the selection via the GTS Package dropdown in the Studio control panel (MfePackageSelector).

#### Scenario: GTS Package selection is persisted
- **WHEN** the user selects a different GTS Package from the Studio control panel dropdown (MfePackageSelector)
- **AND** the selection triggers a Studio-only event (e.g. `studio/activePackageChanged`) with the selected package or extension id
- **THEN** Studio persistence effects SHALL subscribe to that event
- **AND** the persisted id SHALL be written to localStorage under a Studio-owned key (e.g. `hai3:studio:activePackageId`)
- **AND** no framework event or API SHALL be added for this; the event is internal to Studio

### Requirement: Restore theme on Studio initialization

The system SHALL restore the persisted theme when Studio mounts by reading from localStorage and emitting the framework `theme/changed` event.

#### Scenario: Persisted theme is applied on load
- **WHEN** Studio mounts (e.g. StudioProvider effect runs)
- **AND** a theme id was previously persisted (e.g. `hai3:studio:theme` exists)
- **THEN** Studio SHALL read the value from localStorage
- **AND** Studio SHALL emit `theme/changed` with that theme id
- **AND** the framework themes plugin SHALL apply the theme as it normally does (no framework change)

#### Scenario: No persisted theme
- **WHEN** Studio mounts
- **AND** no theme key exists in localStorage or the key is empty
- **THEN** Studio SHALL NOT emit `theme/changed` for restore
- **AND** the application SHALL keep its default or current theme

### Requirement: Restore language on Studio initialization

The system SHALL restore the persisted language when Studio mounts by reading from localStorage and emitting the framework `i18n/language/changed` event.

#### Scenario: Persisted language is applied on load
- **WHEN** Studio mounts
- **AND** a language was previously persisted (e.g. `hai3:studio:language` exists)
- **THEN** Studio SHALL read the value from localStorage
- **AND** Studio SHALL emit `i18n/language/changed` with that language
- **AND** the framework i18n plugin SHALL set the language as it normally does (no framework change)

### Requirement: Restore mock mode on Studio initialization

The system SHALL restore the persisted mock API state when Studio mounts by reading from localStorage and emitting the framework `mock/toggle` event.

#### Scenario: Persisted mock state is applied on load
- **WHEN** Studio mounts
- **AND** a mock enabled value was previously persisted (e.g. `hai3:studio:mockEnabled` exists)
- **THEN** Studio SHALL read the value from localStorage
- **AND** Studio SHALL emit `mock/toggle` with that enabled value
- **AND** the framework mock effects SHALL apply the state as they normally do (no framework change)

### Requirement: Restore GTS Package selection when registry is available

The system SHALL restore the persisted GTS Package or extension when Studio mounts and the screensets registry (and relevant extensions) are available, by calling the same registry API the GTS Package dropdown uses (e.g. `executeActionsChain` with `HAI3_ACTION_MOUNT_EXT`).

#### Scenario: Persisted GTS Package is mounted on load
- **WHEN** Studio mount restore runs
- **AND** a GTS Package or extension id was previously persisted (e.g. `hai3:studio:activePackageId`)
- **AND** the app’s screensets registry is available and the persisted id is valid (e.g. extension or package exists)
- **THEN** Studio SHALL call the same API used by the GTS Package dropdown to mount that extension (e.g. `screensetsRegistry.executeActionsChain` with the appropriate action and payload)
- **AND** no new framework event or API SHALL be introduced; only existing registry usage

#### Scenario: Registry not ready or invalid id
- **WHEN** Studio mount restore runs
- **AND** either the screensets registry is not yet available or the persisted id is not valid (e.g. extension no longer registered)
- **THEN** Studio SHALL NOT throw; it SHALL skip GTS Package restore or defer until registry/id is valid
- **AND** the application SHALL remain in its default or current screen state

### Requirement: Zero footprint on app and framework

The system SHALL implement all persistence and restore logic, storage keys, and event subscriptions inside the `@hai3/studio` package only. The app and framework SHALL not be modified for this capability.

#### Scenario: No framework changes
- **WHEN** this capability is implemented
- **THEN** no file in `packages/framework` or `packages/react` SHALL be changed to add Studio-specific logic or new events for settings persistence
- **AND** framework plugins SHALL continue to listen only to existing events (`theme/changed`, `i18n/language/changed`, `mock/toggle`) and SHALL NOT listen to any new Studio restore event

#### Scenario: No app changes
- **WHEN** this capability is implemented
- **THEN** no app-level code SHALL be required to opt in or configure Studio settings persistence
- **AND** Studio SHALL remain excluded from production builds as today
