# sdk-core Specification Delta

## ADDED Requirements

### Requirement: Mock Plugin Identification Symbol

The system SHALL provide a symbol-based marker for identifying mock plugins in an OCP-compliant manner.

#### Scenario: MOCK_PLUGIN symbol is exported

- **WHEN** importing from `@hai3/api`
- **THEN** `MOCK_PLUGIN` symbol is available
- **AND** it is defined as `Symbol.for('hai3:plugin:mock')`
- **AND** it can be used as a static class property marker

#### Scenario: isMockPlugin type guard function

- **WHEN** calling `isMockPlugin(plugin)` with a plugin instance
- **THEN** it returns `true` if the plugin's constructor has `MOCK_PLUGIN` symbol marker
- **AND** it returns `false` otherwise
- **AND** it handles null/undefined safely (returns false)

```typescript
// Type guard implementation
function isMockPlugin(plugin: unknown): boolean {
  if (!plugin || typeof plugin !== 'object') return false;
  const constructor = (plugin as object).constructor;
  return MOCK_PLUGIN in constructor;
}
```

### Requirement: RestMockPlugin Has MOCK_PLUGIN Marker

The system SHALL mark RestMockPlugin as a mock plugin using the MOCK_PLUGIN symbol.

#### Scenario: RestMockPlugin is identified as mock plugin

- **WHEN** checking `isMockPlugin(new RestMockPlugin({ mockMap: {} }))`
- **THEN** it returns `true`
- **AND** the class has `static readonly [MOCK_PLUGIN] = true;` property

### Requirement: SseMockPlugin Has MOCK_PLUGIN Marker

The system SHALL mark SseMockPlugin as a mock plugin using the MOCK_PLUGIN symbol.

#### Scenario: SseMockPlugin is identified as mock plugin

- **WHEN** checking `isMockPlugin(new SseMockPlugin({ mockStreams: {} }))`
- **THEN** it returns `true`
- **AND** the class has `static readonly [MOCK_PLUGIN] = true;` property

### Requirement: BaseApiService Generic Plugin Registration

The system SHALL allow services to register plugins via GENERIC methods that the framework can manage, without immediately activating them. BaseApiService remains mock-agnostic; the framework uses `isMockPlugin()` type guard to filter for mock plugins.

#### Scenario: registerPlugin method (GENERIC)

- **WHEN** calling `service.registerPlugin(protocol, plugin)` in a service constructor
- **THEN** the plugin is stored in association with the protocol
- **AND** the plugin is NOT added to the protocol (not activated)
- **AND** the framework can later activate/deactivate plugins based on their type
- **AND** this method works for ANY plugin type, not just mock plugins

#### Scenario: getPlugins method (GENERIC)

- **WHEN** calling `service.getPlugins()`
- **THEN** a ReadonlyMap is returned with protocol as key and Set of plugins as value
- **AND** the map contains ALL plugins registered via `registerPlugin()`
- **AND** the framework uses `isMockPlugin()` type guard to filter for mock plugins

#### Scenario: Protocol validation in registerPlugin

- **WHEN** calling `service.registerPlugin(protocol, plugin)` with a protocol not owned by the service
- **THEN** an error is thrown with message indicating protocol not registered on service

#### Scenario: Duplicate registration is idempotent

- **WHEN** the same plugin instance is registered twice for the same protocol
- **THEN** the plugin is stored only once (Set semantics)
- **AND** no error is thrown

### Requirement: ApiRegistry getAll Method

The system SHALL provide a method to iterate all registered service instances.

#### Scenario: apiRegistry.getAll() returns all services

- **WHEN** calling `apiRegistry.getAll()`
- **THEN** a readonly array of all registered BaseApiService instances is returned
- **AND** the order is registration order
- **AND** returns empty array if no services registered

#### Scenario: Implementation uses Map.values()

- **WHEN** implementing `getAll()` in apiRegistry
- **THEN** the implementation is `return Array.from(this.services.values());`
- **BECAUSE** apiRegistry stores services in a `Map<ServiceClass, BaseApiService>`

## MODIFIED Requirements

### Requirement: No Static Properties on Mock Plugin Classes (MODIFIED)

The system SHALL allow static symbol properties on mock plugin classes for identification purposes, while maintaining tree-shaking compliance for other static properties.

#### Scenario: Symbol marker is allowed as static property

- **WHEN** defining `RestMockPlugin` or `SseMockPlugin`
- **THEN** `static readonly [MOCK_PLUGIN] = true;` IS allowed
- **AND** this does not break tree-shaking
- **BECAUSE** symbol-keyed properties are used for runtime identification, not side effects

## REMOVED Requirements

### Requirement: RestProtocol.registerMockMap() and getMockMap()

The `registerMockMap()` and `getMockMap()` methods on RestProtocol are removed.

#### Scenario: registerMockMap not available

- **WHEN** checking RestProtocol interface
- **THEN** `registerMockMap()` method does NOT exist
- **AND** mock data is provided via RestMockPlugin config instead

#### Scenario: getMockMap not available

- **WHEN** checking RestProtocol interface
- **THEN** `getMockMap()` method does NOT exist
- **AND** RestMockPlugin uses its own config for mock data
