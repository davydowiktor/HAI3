# Design: Centralize Mock Mode Control

## Overview

This design implements centralized mock mode control across all API services in HAI3. The solution uses a symbol-based marker pattern for OCP-compliant plugin identification, combined with framework-level state and effects for lifecycle management.

## Architecture

### Layer Responsibilities

```
                    DEPENDENCY DIRECTION
                    (higher depends on lower)

L4 (Studio)              L4 (User Code - Services)
    |                           |
    | imports                   | imports
    v                           v
L2 (@hai3/framework)  <---------+
    |
    | imports
    v
L1 (@hai3/api)

                    EVENT FLOW DIRECTION
                    (runtime communication)

L4 (Studio)
    |
    | emit(MockEvents.Toggle, { enabled })
    v
L2 (@hai3/framework)
    |
    | mockEffects handles event
    | iterates apiRegistry.getAll()
    | calls service.getPlugins()
    | filters with isMockPlugin()
    v
L1 (@hai3/api)
    |
    | protocol.plugins.add/remove(plugin)
    v
L4 (User Code - Services)
    |
    | ChatApiService mock plugins activated/deactivated
```

### Component Boundaries

1. **@hai3/api (L1)**: Provides GENERIC infrastructure for plugin registration. No mock mode awareness - just symbols, type guards, and generic `registerPlugin()`/`getPlugins()` methods. BaseApiService is mock-agnostic.

2. **@hai3/framework (L2)**: Owns mock mode state and lifecycle management. Uses `isMockPlugin()` type guard to filter plugins when syncing. Coordinates plugin activation/deactivation.

3. **Studio (L4)**: UI for toggle. Only dispatches events, no plugin management.

4. **Services (L4)**: Register plugins with their protocols using generic `registerPlugin()`. Framework controls when mock plugins are active by filtering with `isMockPlugin()`.

## Data Flow

### Mock Mode Toggle Flow

```
[ApiModeToggle]
      |
      | emit(MockEvents.Toggle, { enabled: true })
      v
[eventBus]
      |
      | subscription
      v
[mockEffects.onMockModeChanged]
      |
      | for each service in apiRegistry.getAll()
      v
[service.getPlugins()]
      |
      | for each { protocol, plugin } tuple
      v
[isMockPlugin(plugin)]  <-- Framework uses type guard to filter
      |
      +--- true ---> protocol.plugins.add(plugin)
      |
      +--- false --> skip (non-mock plugins ignored)
```

### Service Registration Flow

```
[ChatApiService constructor]
      |
      | const restMockPlugin = new RestMockPlugin({ ... })
      v
[this.registerPlugin(restProtocol, restMockPlugin)]  <-- GENERIC method
      |
      | stores { protocol, plugin } tuple
      v
[registeredPlugins Map]  <-- GENERIC storage, not mock-specific
      |
      | (plugin NOT added to protocol yet)
      v
[mockEffects checks on init]
      |
      | calls service.getPlugins()
      | filters with isMockPlugin()
      | if mockSlice.enabled && isMockPlugin(plugin)
      v
[protocol.plugins.add(plugin)]
```

## Component Interfaces

### @hai3/api - Types

```typescript
// Symbol for mock plugin identification
export const MOCK_PLUGIN = Symbol.for('hai3:plugin:mock');

// Type guard - used by FRAMEWORK (L2), not by BaseApiService (L1)
export function isMockPlugin(plugin: unknown): boolean {
  if (!plugin || typeof plugin !== 'object') return false;
  const constructor = (plugin as object).constructor;
  return MOCK_PLUGIN in constructor;
}
```

### @hai3/api - RestMockPlugin

```typescript
export class RestMockPlugin extends RestPluginWithConfig<RestMockConfig> {
  // Symbol marker - class-level property
  static readonly [MOCK_PLUGIN] = true;

  // ... existing implementation unchanged
}
```

### @hai3/api - SseMockPlugin

```typescript
export class SseMockPlugin extends SsePluginWithConfig<SseMockConfig> {
  // Symbol marker - class-level property
  static readonly [MOCK_PLUGIN] = true;

  // ... existing implementation unchanged
}
```

### @hai3/api - BaseApiService

```typescript
export abstract class BaseApiService {
  // GENERIC plugin storage - not mock-specific
  // Stores ALL plugins registered for framework management
  private registeredPlugins: Map<ApiProtocol, Set<ApiPluginBase>> = new Map();

  /**
   * Register a plugin for a protocol (GENERIC - not mock-specific).
   * Plugin is stored but NOT added to protocol.
   * Framework controls activation based on plugin type and state.
   *
   * @param protocol - Protocol instance owned by this service
   * @param plugin - Any plugin instance (mock or non-mock)
   */
  registerPlugin(protocol: ApiProtocol, plugin: ApiPluginBase): void {
    if (!this.protocols.has(protocol.constructor.name)) {
      throw new Error(`Protocol "${protocol.constructor.name}" not registered on this service`);
    }

    if (!this.registeredPlugins.has(protocol)) {
      this.registeredPlugins.set(protocol, new Set());
    }
    this.registeredPlugins.get(protocol)!.add(plugin);
  }

  /**
   * Get all registered plugins (GENERIC - returns all plugins).
   * Framework uses isMockPlugin() type guard to filter for mock plugins.
   *
   * @returns ReadonlyMap of protocol -> plugins
   */
  getPlugins(): ReadonlyMap<ApiProtocol, ReadonlySet<ApiPluginBase>> {
    return this.registeredPlugins;
  }
}
```

### @hai3/api - apiRegistry

```typescript
// In apiRegistry.ts

/**
 * Get all registered service instances.
 * Used by framework effects to iterate services for plugin management.
 *
 * Implementation: return Array.from(this.services.values())
 *
 * @returns Readonly array of all registered BaseApiService instances
 */
getAll(): readonly BaseApiService[] {
  return Array.from(this.services.values());
}
```

### @hai3/framework - mockSlice

```typescript
// File: packages/framework/src/slices/mockSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface MockState {
  enabled: boolean;
}

const initialState: MockState = {
  enabled: false,
};

export const mockSlice = createSlice({
  name: 'mock',
  initialState,
  reducers: {
    setMockEnabled(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },
  },
});

export const { setMockEnabled } = mockSlice.actions;
export const mockReducer = mockSlice.reducer;
```

### @hai3/framework - mockEffects

```typescript
// File: packages/framework/src/effects/mockEffects.ts

import { eventBus, type EffectInitializer } from '@hai3/state';
import { apiRegistry, isMockPlugin } from '@hai3/api';
import { getStore } from '@hai3/state';
import { setMockEnabled } from '../slices/mockSlice';

export const MockEvents = {
  Toggle: 'mock/toggle',
} as const;

export interface MockTogglePayload {
  enabled: boolean;
}

// Module augmentation for type-safe events
declare module '@hai3/state' {
  interface EventPayloadMap {
    'mock/toggle': MockTogglePayload;
  }
}

/**
 * Activate or deactivate all mock plugins based on enabled state.
 * Uses isMockPlugin() type guard to identify mock plugins from generic storage.
 */
function syncMockPlugins(enabled: boolean): void {
  // Iterate all registered services
  for (const service of apiRegistry.getAll()) {
    // getPlugins() returns ALL plugins (generic)
    // We filter for mock plugins using the type guard
    const registeredPlugins = service.getPlugins();

    for (const [protocol, plugins] of registeredPlugins) {
      for (const plugin of plugins) {
        // Framework filters using type guard - BaseApiService doesn't know about mocks
        if (isMockPlugin(plugin)) {
          if (enabled) {
            // Add plugin to protocol if not already present
            if (!protocol.plugins.getAll().includes(plugin)) {
              protocol.plugins.add(plugin);
            }
          } else {
            // Remove plugin from protocol
            protocol.plugins.remove(plugin);
          }
        }
      }
    }
  }
}

/**
 * Initialize mock mode effects.
 */
export const initMockEffects: EffectInitializer = () => {
  const store = getStore();

  // Listen to toggle events
  const unsubscribe = eventBus.on(MockEvents.Toggle, (payload) => {
    // Update Redux state
    store.dispatch(setMockEnabled(payload.enabled));

    // Sync plugins with new state
    syncMockPlugins(payload.enabled);
  });

  // Sync on initialization based on current state
  const currentState = store.getState();
  if (currentState.mock?.enabled) {
    syncMockPlugins(true);
  }

  return () => {
    unsubscribe();
  };
};
```

### @hai3/framework - Action Creator

```typescript
// File: packages/framework/src/actions/mockActions.ts

import { eventBus } from '@hai3/state';
import { MockEvents, type MockTogglePayload } from '../effects/mockEffects';

/**
 * Toggle mock mode on/off.
 * Emits event that mockEffects handles.
 */
export function toggleMockMode(enabled: boolean): void {
  eventBus.emit(MockEvents.Toggle, { enabled });
}
```

### Studio - ApiModeToggle (Simplified)

```typescript
// File: packages/studio/src/sections/ApiModeToggle.tsx

import React from 'react';
import { useTranslation, useAppSelector, toggleMockMode } from '@hai3/react';
import { Switch } from '@hai3/uikit';

export const ApiModeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const enabled = useAppSelector((state) => state.mock?.enabled ?? false);

  const handleToggle = (checked: boolean) => {
    toggleMockMode(checked);
  };

  return (
    <div className={`flex items-center justify-between h-9 ${className ?? ''}`}>
      <label
        htmlFor="api-mode-toggle"
        className="text-sm text-muted-foreground cursor-pointer select-none whitespace-nowrap"
      >
        {t('studio:controls.mockApi')}
      </label>
      <Switch
        id="api-mode-toggle"
        checked={enabled}
        onCheckedChange={handleToggle}
      />
    </div>
  );
};
```

### User Code - ChatApiService (Migrated)

```typescript
// File: src/screensets/chat/api/ChatApiService.ts

import {
  BaseApiService,
  RestProtocol,
  SseProtocol,
  apiRegistry,
  RestMockPlugin,
  SseMockPlugin,
} from '@hai3/react';
import { chatRestMockMap, chatSseMockStreams } from './mocks';

export class ChatApiService extends BaseApiService {
  constructor() {
    const restProtocol = new RestProtocol({ timeout: 30000 });
    const sseProtocol = new SseProtocol({ withCredentials: true });

    super({ baseURL: '/api/chat' }, restProtocol, sseProtocol);

    // Register plugins using GENERIC method (framework controls activation)
    // No more DEV check needed - framework handles mock mode state
    this.registerPlugin(
      restProtocol,
      new RestMockPlugin({
        mockMap: chatRestMockMap,
        delay: 100,
      })
    );

    this.registerPlugin(
      sseProtocol,
      new SseMockPlugin({
        mockStreams: chatSseMockStreams,
        delay: 50,
      })
    );
  }

  // ... rest of implementation unchanged
}

apiRegistry.register(ChatApiService);
```

## Alternative Approaches Considered

### Alternative 1: Interface-Based Mock Detection

**Approach**: Use TypeScript interfaces to mark mock plugins.

**Rejected Because**: Interfaces are erased at runtime. Cannot detect at runtime without symbols or class checks.

### Alternative 2: Plugin Priority System

**Approach**: Use high priority numbers to identify mock plugins.

**Rejected Because**: Arbitrary convention that could conflict with real priority needs. Not self-documenting.

### Alternative 3: Centralized Mock Registry

**Approach**: Separate registry for mock plugins independent of services.

**Rejected Because**: Violates vertical slice architecture. Mocks should be co-located with services.

### Alternative 4: Mode Flag on BaseApiService

**Approach**: Add `mockMode` property to BaseApiService that controls plugin execution.

**Rejected Because**: Violates SRP - services shouldn't know about mock mode. Also harder to coordinate across services.

### Alternative 5: Mock-Specific Methods on BaseApiService

**Approach**: Add `registerMockPlugin()` and `getRegisteredMockPlugins()` methods.

**Rejected Because**: Violates layer separation - L1 (BaseApiService) should not have mock-specific knowledge. The generic `registerPlugin()`/`getPlugins()` pattern keeps L1 mock-agnostic while L2 (framework) handles mock-specific filtering via `isMockPlugin()` type guard.

## Risks and Mitigations

### Risk 1: Breaking Existing Services

**Risk**: Services using current pattern will break.

**Mitigation**:
- Clear migration guide in proposal
- Limited surface area (only ChatApiService and AccountsApiService)
- Backward compatibility period not needed (internal change)

### Risk 2: Performance Impact from Plugin Iteration

**Risk**: Iterating all services on toggle could be slow.

**Mitigation**:
- Number of services is typically small (<10)
- Toggle is infrequent user action
- Can optimize with lazy iteration if needed

### Risk 3: Race Conditions During Initialization

**Risk**: Mock plugins might not be active before first API call.

**Mitigation**:
- Effects run during app initialization before first render
- Store state is synchronous
- Services register plugins in constructor (before any API calls)

## Dependencies

### Required Changes in Order

1. **@hai3/api**: Add MOCK_PLUGIN symbol, isMockPlugin(), update plugins
2. **@hai3/api**: Add generic registerPlugin()/getPlugins() to BaseApiService
3. **@hai3/api**: Add getAll() to apiRegistry
4. **@hai3/api**: Verify and migrate registerMockMap() usages
5. **@hai3/api**: Remove RestProtocol.registerMockMap()
6. **@hai3/framework**: Add mockSlice
7. **@hai3/framework**: Add mockEffects, mockActions
8. **@hai3/framework**: Export new APIs
9. **Studio**: Simplify ApiModeToggle
10. **User Code**: Migrate ChatApiService and AccountsApiService

### Build Order Impact

No impact on build order - changes are within existing packages.
