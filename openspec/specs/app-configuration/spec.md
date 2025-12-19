# app-configuration Specification

## Purpose
TBD - created by archiving change add-tenant-event. Update Purpose after archive.
## Requirements
### Requirement: Tenant Type Definition

The system SHALL define a `Tenant` type with the following structure:

```typescript
export type Tenant = {
  id: string;
};
```

#### Scenario: Type-safe tenant state

- **GIVEN** a tenant is stored in app state
- **WHEN** accessing `state.uicore.app.tenant`
- **THEN** the value SHALL be typed as `Tenant | null`

### Requirement: Tenant Event Configuration

The system SHALL provide a tenant change event that allows consuming applications to set tenant context via the event bus.

#### Scenario: Set tenant from consuming app

- **GIVEN** an app created via `hai3 create <project-name>`
- **WHEN** the app emits `uicore/tenant/changed` event with tenant payload
- **THEN** the system SHALL update `state.uicore.app.tenant` with the provided tenant data

```typescript
import { eventBus } from '@hai3/uicore';

eventBus.emit('uicore/tenant/changed', {
  tenant: { id: '123' }
});
```

#### Scenario: Access tenant state

- **GIVEN** tenant has been set via event
- **WHEN** a component uses `useAppSelector`
- **THEN** the component SHALL receive the current tenant value

```typescript
import { useAppSelector } from '@hai3/uicore';

const tenant = useAppSelector((state) => state.uicore.app.tenant);
```

### Requirement: App Configuration Event API

The system SHALL expose a consistent event-driven API for configuring tenant, language, theme, and navigation from consuming applications.

#### Scenario: Configure app via events

- **GIVEN** an app created via `hai3 create <project-name>`
- **WHEN** the app needs to configure runtime settings
- **THEN** the system SHALL support the following events:

| Event | Payload | State Path |
|-------|---------|------------|
| `uicore/tenant/changed` | `{ tenant: T }` | `state.uicore.app.tenant` |
| `uicore/i18n/languageChanged` | `{ language: Language }` | `state.uicore.app.language` |
| `uicore/theme/changed` | `{ themeName: string }` | `state.uicore.layout.theme` |
| `uicore/navigation/screenNavigated` | `{ screenId: string }` | `state.uicore.layout.selectedScreen` |

```typescript
import { eventBus } from '@hai3/uicore';

// Tenant configuration
eventBus.emit('uicore/tenant/changed', { tenant: { id: '123' } });

// Language configuration
eventBus.emit('uicore/i18n/languageChanged', { language: 'ru' });

// Theme configuration
eventBus.emit('uicore/theme/changed', { themeName: 'dark' });

// Navigation
eventBus.emit('uicore/navigation/screenNavigated', { screenId: 'machines-list' });
```

#### Scenario: Type-safe event emission

- **GIVEN** a consuming app importing `eventBus` from `@hai3/uicore`
- **WHEN** emitting configuration events
- **THEN** TypeScript SHALL enforce correct payload types via `EventPayloadMap`

```typescript
// Correct - TypeScript passes
eventBus.emit('uicore/tenant/changed', { tenant: { id: '123' } });

// Error - missing tenant property
eventBus.emit('uicore/tenant/changed', { });

// Error - wrong event name
eventBus.emit('uicore/tenant/change', { tenant: {} }); // typo in event name
```

### Requirement: Router Configuration Props

The system SHALL provide a `router` prop on HAI3Provider for configuring the router type.

#### Scenario: Configure hash router

- **GIVEN** an app using HAI3Provider
- **WHEN** the `router` prop is set to `{ type: 'hash' }`
- **THEN** the system SHALL use HashRouter instead of BrowserRouter

```tsx
<HAI3Provider router={{ type: 'hash' }}>
  <App />
</HAI3Provider>
```

#### Scenario: Configure memory router

- **GIVEN** an app requiring in-memory routing (testing, embedded)
- **WHEN** the `router` prop is set to `{ type: 'memory' }`
- **THEN** the system SHALL use MemoryRouter

```tsx
<HAI3Provider router={{ type: 'memory' }}>
  <App />
</HAI3Provider>
```

#### Scenario: Default router behavior

- **GIVEN** an app using HAI3Provider without router prop
- **WHEN** the application renders
- **THEN** the system SHALL use BrowserRouter as default

### Requirement: Layout Visibility Props

The system SHALL provide a `layout` prop on HAI3Provider for controlling visibility of layout parts.

#### Scenario: Hide header and footer

- **GIVEN** an app requiring minimal chrome
- **WHEN** the `layout` prop is set to `{ header: { visible: false }, footer: { visible: false } }`
- **THEN** the system SHALL hide Header and Footer components

```tsx
<HAI3Provider layout={{ header: { visible: false }, footer: { visible: false } }}>
  <App />
</HAI3Provider>
```

#### Scenario: Hide menu for embedded mode

- **GIVEN** an app embedded in another application
- **WHEN** the `layout` prop is set to `{ menu: { visible: false } }`
- **THEN** the system SHALL hide the Menu component

```tsx
<HAI3Provider layout={{ menu: { visible: false }, header: { visible: false }, footer: { visible: false } }}>
  <App />
</HAI3Provider>
```

#### Scenario: Default layout behavior

- **GIVEN** an app using HAI3Provider without layout prop
- **WHEN** the application renders
- **THEN** all layout parts (header, menu, footer, sidebar) SHALL be visible by default

#### Scenario: Partial layout configuration

- **GIVEN** an app specifying only some layout parts
- **WHEN** the `layout` prop is set to `{ footer: { visible: false } }`
- **THEN** unspecified parts SHALL retain their default visibility (true)

### Requirement: Header Domain Configuration

The system SHALL support configuration state for the Header component consistent with other layout domains (Menu, Footer, Sidebar).

#### Scenario: Header respects visible flag

- **GIVEN** header visibility is set to false in Redux state
- **WHEN** the Header component renders
- **THEN** the Header SHALL return null (not render)

#### Scenario: Header visibility via config action

- **GIVEN** an effect needs to hide the header programmatically
- **WHEN** `setHeaderConfig({ visible: false })` is dispatched
- **THEN** the header visibility state SHALL update to false

#### Scenario: Header config action

- **GIVEN** an effect needs to configure header
- **WHEN** `setHeaderConfig({ visible: false })` is dispatched
- **THEN** the header state SHALL merge with the provided config

```typescript
// Consistent with other domains
dispatch(setHeaderConfig({ visible: false }));
dispatch(setMenuConfig({ visible: false }));
dispatch(setFooterConfig({ visible: false }));
dispatch(setSidebarConfig({ visible: false }));
```

### Requirement: Router Auto-Navigation Control

The system SHALL provide an optional `autoNavigate` boolean flag in `RouterConfig` to control initial routing behavior, allowing applications to defer navigation until external trigger.

#### Scenario: Auto-navigation enabled by default

- **GIVEN** an app uses HAI3Provider without specifying `autoNavigate`
- **WHEN** the app loads on root path "/"
- **THEN** the system SHALL automatically redirect to the first registered screen
- **AND** maintain backward compatibility with existing apps

```typescript
<HAI3Provider router={{ type: 'browser' }}>
  <App />
</HAI3Provider>
// Automatically redirects "/" → "/first-screen"
```

#### Scenario: Disable auto-navigation for external control

- **GIVEN** an app sets `autoNavigate: false` in router config
- **WHEN** the app loads on root path "/"
- **THEN** the system SHALL render Layout without redirect
- **AND** wait for explicit `navigateToScreen()` call
- **AND** URL SHALL remain on "/"

```typescript
<HAI3Provider
  router={{
    type: 'browser',
    autoNavigate: false
  }}>
  <App />
</HAI3Provider>

// Later - external navigation
navigateToScreen('target-screen');
// Now redirects "/" → "/target-screen"
```

#### Scenario: Programmatic navigation after disabled auto-navigation

- **GIVEN** an app with `autoNavigate: false`
- **WHEN** application calls `navigateToScreen(screenId)`
- **THEN** the system SHALL update `state.uicore.layout.selectedScreen` to the specified screen
- **AND** RouterSync SHALL update URL to match the screen
- **AND** Layout SHALL render the target screen

```typescript
import { navigateToScreen } from '@hai3/uicore';

// App initialized with autoNavigate: false
// User action or external trigger
navigateToScreen('dashboard');

// Results in:
// - Redux: state.uicore.layout.selectedScreen = 'dashboard'
// - URL: changes to '/dashboard'
// - UI: renders dashboard screen
```

#### Scenario: Type-safe router configuration

- **GIVEN** a consuming app importing `HAI3Provider` from `@hai3/uicore`
- **WHEN** configuring router prop
- **THEN** TypeScript SHALL enforce correct `RouterConfig` structure
- **AND** `autoNavigate` field SHALL be typed as optional boolean

```typescript
// Correct - TypeScript passes
<HAI3Provider router={{ type: 'browser', autoNavigate: false }}>

// Correct - autoNavigate is optional
<HAI3Provider router={{ type: 'browser' }}>

// Error - wrong type for autoNavigate
<HAI3Provider router={{ type: 'browser', autoNavigate: 'false' }}>
```
