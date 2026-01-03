# Tasks: Centralize Mock Mode Control

## Task Sequence

Tasks are ordered for logical implementation flow. Each task is atomic and verifiable.

---

### Task 1: Add MOCK_PLUGIN symbol and type guard to @hai3/api

**File**: `packages/api/src/types.ts`

**Changes**:
- Add `MOCK_PLUGIN` symbol export: `export const MOCK_PLUGIN = Symbol.for('hai3:plugin:mock');`
- Add `isMockPlugin()` type guard function

**Traceability**: REQ-1, REQ-2

**Verification**:
- TypeScript compiles
- Symbol is exported from @hai3/api index
- Type guard correctly identifies classes with the symbol marker

---

### Task 2: Add MOCK_PLUGIN marker to RestMockPlugin

**File**: `packages/api/src/plugins/RestMockPlugin.ts`

**Changes**:
- Import `MOCK_PLUGIN` symbol
- Add `static readonly [MOCK_PLUGIN] = true;` to RestMockPlugin class

**Traceability**: REQ-3

**Verification**:
- `isMockPlugin(new RestMockPlugin({ mockMap: {} }))` returns `true`

---

### Task 3: Add MOCK_PLUGIN marker to SseMockPlugin

**File**: `packages/api/src/plugins/SseMockPlugin.ts`

**Changes**:
- Import `MOCK_PLUGIN` symbol
- Add `static readonly [MOCK_PLUGIN] = true;` to SseMockPlugin class

**Traceability**: REQ-4

**Verification**:
- `isMockPlugin(new SseMockPlugin({ mockStreams: {} }))` returns `true`

---

### Task 4: Add registerPlugin() and getPlugins() to BaseApiService

**File**: `packages/api/src/BaseApiService.ts`

**Changes**:
- Add `registeredPlugins: Map<ApiProtocol, Set<ApiPluginBase>>` private field
- Add `registerPlugin(protocol, plugin)` method with validation (GENERIC, not mock-specific)
- Add `getPlugins()` method returning readonly map (GENERIC, returns all plugins)

**Traceability**: REQ-5

**Verification**:
- Services can call `this.registerPlugin(protocol, plugin)` in constructor
- `getPlugins()` returns correct map with all registered plugins
- Error thrown when protocol is not registered on service

---

### Task 5: Add getAll() method to apiRegistry for iterating services

**File**: `packages/api/src/apiRegistry.ts`

**Changes**:
- Add `getAll(): readonly BaseApiService[]` method
- Implementation: `return Array.from(this.services.values());`

**Traceability**: REQ-8 (needed by mockEffects)

**Verification**:
- After registering services, `apiRegistry.getAll()` returns them
- Returns empty array when no services registered

---

### Task 6: Export new symbols and functions from @hai3/api

**File**: `packages/api/src/index.ts`

**Changes**:
- Export `MOCK_PLUGIN` symbol
- Export `isMockPlugin` function

**Traceability**: REQ-1, REQ-2

**Verification**:
- `import { MOCK_PLUGIN, isMockPlugin } from '@hai3/api'` works

---

### Task 7: Audit registerMockMap() usages

**Action**: Search codebase for usages of `registerMockMap()` and `getMockMap()`

**Commands**:
```bash
rg "registerMockMap" --type ts
rg "getMockMap" --type ts
```

**Changes**:
- Document all files using these methods
- Create migration plan for each usage

**Traceability**: REQ-6 (prerequisite for removal)

**Verification**:
- Complete list of files using registerMockMap()/getMockMap()
- Migration plan documented for each usage

---

### Task 8: Create mockSlice in @hai3/framework

**File**: `packages/framework/src/slices/mockSlice.ts` (new file)

**Changes**:
- Create slice with `{ enabled: boolean }` state
- Export `mockSlice`, `setMockEnabled`, `mockReducer`
- Export `MockState` type

**Traceability**: REQ-7

**Verification**:
- Slice can be added to store
- `setMockEnabled(true)` updates state correctly

---

### Task 9: Create mockEffects in @hai3/framework

**File**: `packages/framework/src/effects/mockEffects.ts` (new file)

**Changes**:
- Define `MockEvents.Toggle` event type
- Add module augmentation for EventPayloadMap
- Implement `syncMockPlugins(enabled)` function that:
  - Calls `apiRegistry.getAll()` to iterate services
  - Calls `service.getPlugins()` to get all registered plugins
  - Uses `isMockPlugin()` type guard to filter for mock plugins
  - Adds/removes filtered plugins from protocols based on enabled state
- Implement `initMockEffects` EffectInitializer

**Traceability**: REQ-8

**Verification**:
- Effect initializes and subscribes to toggle event
- Emitting toggle event updates store and syncs plugins

---

### Task 10: Create mockActions in @hai3/framework

**File**: `packages/framework/src/actions/mockActions.ts` (new file)

**Changes**:
- Export `toggleMockMode(enabled: boolean)` action creator
- Action emits `MockEvents.Toggle` event

**Traceability**: REQ-8, REQ-11

**Verification**:
- `toggleMockMode(true)` emits correct event
- Event payload has correct shape

---

### Task 11: Export mock APIs from @hai3/framework index

**File**: `packages/framework/src/index.ts`

**Changes**:
- Export mockSlice, setMockEnabled, mockReducer, MockState
- Export initMockEffects, MockEvents
- Export toggleMockMode
- Export MOCK_PLUGIN, isMockPlugin (re-export from @hai3/api)

**Traceability**: REQ-7, REQ-8

**Verification**:
- All exports accessible via `import { ... } from '@hai3/framework'`

---

### Task 12: Register mockSlice with store in framework

**File**: `packages/framework/src/plugins/index.ts` or relevant plugin file

**Changes**:
- Include `mockSlice` in store configuration
- Ensure mockEffects is initialized during app setup

**Traceability**: REQ-7, REQ-8

**Verification**:
- `state.mock.enabled` exists in Redux state after app init

---

### Task 13: Re-export mock APIs from @hai3/react

**File**: `packages/react/src/index.ts`

**Changes**:
- Re-export `toggleMockMode` from @hai3/framework
- Re-export `MOCK_PLUGIN`, `isMockPlugin` from @hai3/framework

**Traceability**: REQ-8, REQ-11

**Verification**:
- Studio and user code can import from @hai3/react

---

### Task 14: Migrate ChatApiService to new pattern

**File**: `src/screensets/chat/api/ChatApiService.ts`

**Changes**:
- Replace `restProtocol.plugins.add(...)` with `this.registerPlugin(restProtocol, ...)`
- Replace `sseProtocol.plugins.add(...)` with `this.registerPlugin(sseProtocol, ...)`
- Remove `if (import.meta.env.DEV)` guard (framework handles this)

**Traceability**: REQ-9, Scenario: Service registers mock plugins at construction

**Verification**:
- ChatApiService compiles
- Mock plugins not active until toggle enabled
- When toggle enabled, mocks work as before

---

### Task 15: Migrate AccountsApiService to new pattern (if applicable)

**File**: `packages/uicore/src/api/services/AccountsApiService.ts` or user code location

**Changes**:
- Audit current AccountsApiService implementation for mock plugin usage
- If using `protocol.plugins.add()` for mocks, replace with `this.registerPlugin(protocol, ...)`
- Remove any `if (import.meta.env.DEV)` guards for mock plugins

**Traceability**: REQ-10

**Verification**:
- AccountsApiService compiles
- Mock plugins (if any) follow new pattern

---

### Task 16: Verify zero usages of registerMockMap() before removal

**Action**: Confirm all usages have been migrated

**Commands**:
```bash
rg "registerMockMap" --type ts
rg "getMockMap" --type ts
```

**Traceability**: REQ-6 (verification before removal)

**Verification**:
- Both commands return zero results
- All usages confirmed migrated to new pattern

---

### Task 17: Remove registerMockMap() and getMockMap() from RestProtocol

**File**: `packages/api/src/protocols/RestProtocol.ts`

**Changes**:
- Remove `mockMap` private field
- Remove `registerMockMap()` method
- Remove `getMockMap()` method

**Traceability**: REQ-6

**Verification**:
- TypeScript compiles (no usages should exist after migration)
- Methods no longer accessible on RestProtocol instances

**Note**: This task MUST be done after Task 14, Task 15, and Task 16 to avoid breaking changes.

---

### Task 18: Simplify ApiModeToggle component

**File**: `packages/studio/src/sections/ApiModeToggle.tsx`

**Changes**:
- Remove `mockPluginRef` and direct plugin management
- Import `toggleMockMode` from @hai3/react
- Import `useAppSelector` and read `state.mock.enabled`
- Call `toggleMockMode(checked)` on toggle change

**Traceability**: REQ-11, Scenario: Developer enables mock mode via toggle

**Verification**:
- Toggle reflects Redux state
- Clicking toggle emits event (check Redux DevTools)
- Mock behavior activates/deactivates correctly

---

### Task 19: Update slices index to export mockSlice

**File**: `packages/framework/src/slices/index.ts`

**Changes**:
- Import and re-export from mockSlice.ts

**Traceability**: REQ-7

**Verification**:
- Build passes

---

### Task 20: Add unit tests for new APIs

**Files**:
- `packages/api/src/__tests__/isMockPlugin.test.ts` (new)
- `packages/api/src/__tests__/BaseApiService.registerPlugin.test.ts` (new)
- `packages/framework/src/__tests__/mockSlice.test.ts` (new)
- `packages/framework/src/__tests__/mockEffects.test.ts` (new)

**Changes**:
- Test `isMockPlugin()` returns true for RestMockPlugin/SseMockPlugin instances
- Test `isMockPlugin()` returns false for non-mock plugins
- Test `isMockPlugin()` handles null/undefined safely
- Test `registerPlugin()` stores plugins correctly
- Test `registerPlugin()` throws for unowned protocols
- Test `getPlugins()` returns all registered plugins
- Test `mockSlice` reducer updates state correctly
- Test `mockEffects` subscribes to toggle event
- Test `syncMockPlugins()` adds/removes plugins based on enabled state

**Traceability**: All requirements, AC-1 through AC-7

**Verification**:
- All tests pass
- Coverage includes happy paths and edge cases

---

### Task 21: Build and validate all packages

**Commands**:
```bash
npm run build:packages
npm run arch:check
npm run lint
npm test
```

**Traceability**: All requirements

**Verification**:
- All packages build successfully
- No architecture violations
- No lint errors
- All tests pass

---

### Task 22: Manual testing of mock toggle functionality

**Steps**:
1. Start dev server with `npm run dev`
2. Navigate to a screen that uses ChatApiService
3. Open Studio panel
4. Toggle "Mock API" ON
5. Verify API calls return mock data
6. Toggle "Mock API" OFF
7. Verify API calls attempt real endpoints

**Traceability**: AC-1, AC-2, AC-3, AC-4, AC-7

**Verification**:
- Toggle state matches Redux state
- Mock data appears only when toggle ON
- No console errors

---

## Parallelizable Tasks

The following tasks can be done in parallel:
- Task 2 and Task 3 (independent plugin changes)
- Task 8, Task 9, Task 10 (new framework files, no dependencies between them)
- Task 14 and Task 15 (independent service migrations)

## Dependencies Graph

```
Task 1 (symbol)
   |
   +---> Task 2 (RestMockPlugin)
   |
   +---> Task 3 (SseMockPlugin)
   |
   +---> Task 6 (export from api)
         |
         +---> Task 11 (export from framework)
               |
               +---> Task 13 (export from react)

Task 4 (BaseApiService methods)
   |
   +---> Task 14 (migrate ChatApiService)
   |
   +---> Task 15 (migrate AccountsApiService)

Task 5 (apiRegistry.getAll)
   |
   +---> Task 9 (mockEffects)

Task 7 (audit registerMockMap usages)
   |
   +---> Task 14, Task 15 (migrations)
         |
         +---> Task 16 (verify zero usages)
               |
               +---> Task 17 (remove registerMockMap)

Task 8 (mockSlice)
   |
   +---> Task 9 (mockEffects)
   |
   +---> Task 12 (register with store)
   |
   +---> Task 19 (slices index)

Task 9, Task 10 (effects, actions)
   |
   +---> Task 11 (export from framework)

Task 14, Task 15, Task 17, Task 18 (all migrations)
   |
   +---> Task 20 (unit tests)
         |
         +---> Task 21 (build validation)
               |
               +---> Task 22 (manual testing)
```
