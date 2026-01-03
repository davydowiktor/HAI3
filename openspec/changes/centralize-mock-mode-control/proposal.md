# Centralize Mock Mode Control

## Problem Statement

The "Mock API" toggle in Studio currently only controls **global** mock plugins registered via `apiRegistry.plugins.add(RestProtocol, mockPlugin)`. However, services like `ChatApiService` register mock plugins at the **instance level** directly on their protocol instances (`restProtocol.plugins.add(...)`), which bypass the global toggle entirely.

This creates an inconsistent developer experience where:
1. Instance-level mock plugins are always active in DEV mode regardless of the toggle state
2. Developers cannot easily switch between mock and real API behavior for all services
3. The toggle's behavior is confusing - it appears to control mocking but only works for some services

## Motivation

- **Consistent DX**: All mock plugins should respect the single "Mock API" toggle
- **Testability**: Developers need to test real API integration without code changes
- **Simplicity**: One control point for all mock behavior is easier to understand
- **OCP-Compliance**: Solution must allow third-party mock plugins to integrate automatically

## Requirements

### REQ-1: Symbol-Based Mock Plugin Identification (Priority: High)

Add `MOCK_PLUGIN` symbol marker to identify mock plugins in an OCP-compliant way.

**Rationale**: Using a symbol allows any plugin class to be identified as a mock plugin without inheritance hierarchies or type checking against specific classes.

### REQ-2: Mock Plugin Type Guard (Priority: High)

Provide `isMockPlugin()` type guard function for checking if a plugin is a mock plugin.

**Rationale**: Framework needs a reliable way to identify mock plugins when iterating registered plugins.

### REQ-3: Update RestMockPlugin with Symbol Marker (Priority: High)

Add `MOCK_PLUGIN` symbol marker to `RestMockPlugin` class.

### REQ-4: Update SseMockPlugin with Symbol Marker (Priority: High)

Add `MOCK_PLUGIN` symbol marker to `SseMockPlugin` class.

### REQ-5: Plugin Registration API on BaseApiService (Priority: High)

Add `registerPlugin(protocol, plugin)` and `getPlugins()` methods to `BaseApiService` to allow services to register plugins that the framework can manage.

**Rationale**: Services need to declare their plugins without immediately activating them. The framework controls plugin lifecycle based on mock mode state.

### REQ-6: Remove RestProtocol.registerMockMap() (Priority: Medium)

Remove the `registerMockMap()` and `getMockMap()` methods from `RestProtocol` as they violate Single Responsibility Principle.

**Rationale**: Protocols should not know about mocks. Mock data should be provided via plugins.

### REQ-7: Mock Slice in Framework (Priority: High)

Add `mockSlice` to `@hai3/framework` with `{ enabled: boolean }` state.

**Rationale**: Framework needs state to track mock mode and persist it across navigation.

### REQ-8: Mock Effects in Framework (Priority: High)

Add `mockEffects` to `@hai3/framework` that:
- Listens to mock mode toggle events
- Iterates all services in apiRegistry
- Uses `isMockPlugin()` to find mock plugins
- Adds/removes mock plugins from protocols based on state

**Rationale**: Effects handle the side effects of mock mode changes, keeping the toggle UI decoupled from implementation.

### REQ-9: Migrate ChatApiService to New Pattern (Priority: High)

Update `ChatApiService` to use the new plugin registration pattern instead of directly adding plugins.

### REQ-10: Migrate AccountsApiService to New Pattern (Priority: Medium)

Update `AccountsApiService` (if applicable) to use the new plugin registration pattern.

### REQ-11: Simplify ApiModeToggle Component (Priority: Medium)

Update `ApiModeToggle` in Studio to dispatch an event/action instead of directly managing plugins.

**Rationale**: The toggle should only emit intent; the framework effects handle the actual plugin management.

## User Scenarios

### Scenario: Developer enables mock mode via toggle

**Given** the application is running in DEV mode
**And** mock mode is disabled
**And** ChatApiService has registered RestMockPlugin and SseMockPlugin
**When** the developer clicks the "Mock API" toggle to enable
**Then** the framework dispatches a mock mode change event
**And** mockEffects iterates all registered services
**And** mockEffects finds plugins marked with MOCK_PLUGIN symbol
**And** mockEffects adds those plugins to their respective protocols
**And** subsequent API calls return mock data

### Scenario: Developer disables mock mode via toggle

**Given** the application is running with mock mode enabled
**And** ChatApiService's mock plugins are active on protocols
**When** the developer clicks the "Mock API" toggle to disable
**Then** the framework dispatches a mock mode change event
**And** mockEffects removes mock plugins from all protocols
**And** subsequent API calls hit real endpoints

### Scenario: Third-party creates custom mock plugin

**Given** a developer creates a custom WebSocketMockPlugin
**And** the plugin class has `static readonly [MOCK_PLUGIN] = true`
**When** the plugin is registered via `service.registerPlugin(protocol, plugin)`
**And** mock mode is toggled on
**Then** the framework automatically activates the custom mock plugin

### Scenario: Service registers mock plugins at construction

**Given** ChatApiService is being instantiated
**When** the constructor calls `this.registerPlugin(restProtocol, restMockPlugin)`
**And** the constructor calls `this.registerPlugin(sseProtocol, sseMockPlugin)`
**Then** the plugins are stored but NOT added to protocols
**And** the plugins remain inactive until mock mode is enabled

### Scenario: Mock mode is persisted across page reload (Edge Case)

**Given** the developer has enabled mock mode
**When** the page is reloaded
**Then** mock mode state is read from mockSlice initial state
**And** if enabled, mockEffects activates mock plugins on app initialization

## Error Cases

### Error: Plugin registered for non-existent protocol

**Given** a service attempts to register a plugin
**When** the protocol is not one that the service owns
**Then** an error is thrown with clear message about protocol ownership

### Error: Duplicate plugin registration

**Given** a plugin is already registered for a protocol
**When** the same plugin instance is registered again
**Then** the registration is silently ignored (idempotent)

## Acceptance Criteria

1. **AC-1**: When mock mode is disabled, NO mock plugins are active on any protocol (verifiable by `protocol.getPluginsInOrder().filter(isMockPlugin).length === 0`)

2. **AC-2**: When mock mode is enabled, ALL registered mock plugins are active on their respective protocols (verifiable by checking plugin presence)

3. **AC-3**: Toggle state in UI matches `mockSlice.enabled` state in Redux store

4. **AC-4**: ChatApiService mock plugins only intercept requests when mock mode is enabled

5. **AC-5**: Third-party mock plugins with `MOCK_PLUGIN` symbol are automatically managed by the toggle

6. **AC-6**: `RestProtocol.registerMockMap()` and `RestProtocol.getMockMap()` methods are removed

7. **AC-7**: All existing mock functionality continues to work (no regression)

## Breaking Changes

1. **RestProtocol API Change**: Remove `registerMockMap()` and `getMockMap()` methods
2. **Service Pattern Change**: Services must use `this.registerPlugin()` instead of `protocol.plugins.add()` for mock plugins
3. **Migration Required**: ChatApiService and AccountsApiService need code changes

## Out of Scope

- Persisting mock mode preference to localStorage (can be added later)
- Per-service mock mode control (this proposal is for global control only)
- Mock data editing in Studio UI
