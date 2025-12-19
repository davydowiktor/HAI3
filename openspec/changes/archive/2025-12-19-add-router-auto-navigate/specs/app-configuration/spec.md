## ADDED Requirements

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
