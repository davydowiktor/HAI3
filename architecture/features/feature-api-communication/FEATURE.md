# Feature: API Communication

- [ ] `p1` - **ID**: `cpt-hai3-featstatus-api-communication`

- [ ] `p1` - **ID**: `cpt-hai3-feature-api-communication`

## Table of Contents

1. [Feature Context](#feature-context)
2. [Actor Flows](#actor-flows)
3. [Processes / Business Logic](#processes--business-logic)
4. [States](#states)
5. [Definitions of Done](#definitions-of-done)
6. [Acceptance Criteria](#acceptance-criteria)
7. [Additional Context](#additional-context)

---

## Feature Context

### 1. Overview

Provides the unified API service layer for the HAI3 system. Abstracts REST and SSE transport protocols behind a consistent interface that isolates domain code from wire-level concerns. Consumers extend `BaseApiService`, register protocol instances, and add plugins without touching protocol internals.

Problem: API services scattered across screen-sets couple domain code to specific transports; mock logic bleeds into business logic; no centralized mechanism to switch between real and mock responses at runtime.

Primary value: A single, extensible SDK package that any domain plugin can use to define typed API services with pluggable mock, retry, and cross-cutting concerns — without any `@hai3/*` inter-dependencies.

Key assumptions: Consumers run in a browser environment that provides `EventSource`. Axios is the sole external peer dependency. Mock mode is controlled by the framework layer, not by service code.

### 2. Purpose

Enable developers to define domain API services in a protocol-agnostic way, wire cross-cutting plugins (auth, logging, mocking, retry) at both global and service-instance levels, and switch between real and mock transports at runtime through a centralized toggle — all with zero coupling to other `@hai3/*` packages.

Success criteria: A developer can scaffold a new domain service, register it, add a mock plugin, and toggle mock mode without modifying any protocol or registry internals.

### 3. Actors

- `cpt-hai3-actor-developer`
- `cpt-hai3-actor-screenset-author`
- `cpt-hai3-actor-api-protocol`
- `cpt-hai3-actor-studio-user`
- `cpt-hai3-actor-host-app`
- `cpt-hai3-actor-runtime`
- `cpt-hai3-actor-framework-plugin`

### 4. References

- Overall Design: [DESIGN.md](../../DESIGN.md)
- Decomposition: [DECOMPOSITION.md](../../DECOMPOSITION.md) — section 2.4
- PRD: [PRD.md](../../PRD.md) — sections 5.1 (API Package), 5.3 (SSE Streaming), 5.19 (Mock Mode), NFR section (API Retry)
- OpenSpec: [sse-streaming/spec.md](../../../openspec/specs/sse-streaming/spec.md)
- ADRs: `cpt-hai3-adr-protocol-separated-api-architecture`, `cpt-hai3-adr-symbol-based-mock-plugin-identification`

---

## Actor Flows

### Flow 1 — Developer Defines and Registers a Domain Service

- [ ] `p1` - **ID**: `cpt-hai3-flow-api-communication-service-registration`

**Actors**: `cpt-hai3-actor-developer`, `cpt-hai3-actor-host-app`

1. [ ] `p1` - Developer declares a class extending `BaseApiService` — `inst-extend-base`
2. [ ] `p1` - Constructor calls `super({ baseURL }, ...protocols)` with at least one protocol instance — `inst-super-call`
3. [ ] `p1` - Constructor optionally calls `this.registerPlugin(protocol, mockPlugin)` to pre-register mock plugins — `inst-register-mock-plugin`
4. [ ] `p1` - Developer calls `apiRegistry.register(ServiceClass)` to instantiate and store the service — `inst-registry-register`
5. [ ] `p1` - Consumer calls `apiRegistry.getService(ServiceClass)` to retrieve the typed instance — `inst-registry-get`
6. [ ] `p1` - `apiRegistry.getService` RETURN typed service instance — `inst-return-service`
7. [ ] `p1` - IF `ServiceClass` is not registered, RETURN error: `"Service not found. Did you forget to call apiRegistry.register(…)?"` — `inst-not-found-error`

---

### Flow 2 — REST Request with Plugin Chain Execution

- [ ] `p1` - **ID**: `cpt-hai3-flow-api-communication-rest-request`

**Actors**: `cpt-hai3-actor-developer`, `cpt-hai3-actor-api-protocol`, `cpt-hai3-actor-runtime`

1. [ ] `p1` - Domain code calls a service method (e.g., `get`, `post`, `put`, `patch`, `delete`) — `inst-domain-call`
2. [ ] `p1` - `RestProtocol` constructs `RestRequestContext` with method, full URL (baseURL + relative), headers, and body — `inst-build-context`
3. [ ] `p1` - `RestProtocol` iterates `getPluginsInOrder()` (global then instance), calling each plugin's `onRequest` hook in FIFO order — `inst-exec-on-request`
4. [ ] `p1` - IF any plugin returns `RestShortCircuitResponse`, stop the chain and skip the HTTP call — `inst-short-circuit-check`
5. [ ] `p1` - IF short-circuited, execute `onResponse` plugin chain in LIFO order against the short-circuit data, RETURN the response data — `inst-short-circuit-response`
6. [ ] `p1` - IF not short-circuited, send the HTTP request via Axios using the original relative URL (not the full URL passed to plugins) — `inst-axios-request`
7. [ ] `p1` - On success, execute `onResponse` plugin chain in LIFO order, RETURN the final response data — `inst-on-response`
8. [ ] `p1` - On error, execute `onError` plugin chain in LIFO order with `ApiPluginErrorContext` including `retryCount` — `inst-on-error`
9. [ ] `p1` - IF a plugin calls `context.retry(modifiedRequest)`, re-execute the full request pipeline with `retryCount + 1` — `inst-retry-execute`
10. [ ] `p1` - IF `retryCount >= maxRetryDepth` (default: 10), RETURN error: `"Max retry depth exceeded"` — `inst-max-retry-guard`
11. [ ] `p1` - IF a plugin returns `RestResponseContext` from `onError`, treat as recovery and RETURN the response data — `inst-error-recovery`
12. [ ] `p1` - IF no plugin recovers, throw the final error — `inst-throw-error`

---

### Flow 3 — SSE Connection Lifecycle

- [ ] `p1` - **ID**: `cpt-hai3-flow-api-communication-sse-connection`

**Actors**: `cpt-hai3-actor-developer`, `cpt-hai3-actor-api-protocol`, `cpt-hai3-actor-runtime`

1. [ ] `p1` - Domain code calls `this.protocol(SseProtocol).connect(url, onMessage, onComplete)` — `inst-sse-connect-call`
2. [ ] `p1` - `SseProtocol` generates a unique connection ID — `inst-gen-connection-id`
3. [ ] `p1` - `SseProtocol` constructs `SseConnectContext` with full URL and empty headers — `inst-build-sse-context`
4. [ ] `p1` - `SseProtocol` iterates `getPluginsInOrder()` (global then instance), calling each plugin's `onConnect` hook in FIFO order — `inst-exec-on-connect`
5. [ ] `p1` - IF any plugin returns `SseShortCircuitResponse`, use the provided `EventSourceLike` mock instead of creating a real `EventSource` — `inst-sse-short-circuit`
6. [ ] `p1` - IF not short-circuited, create a real `EventSource` with full URL and `withCredentials` from protocol config (default: `true`) — `inst-real-event-source`
7. [ ] `p1` - Attach `onmessage`, `onerror`, and `done` event listener handlers to the `EventSourceLike` (mock or real path is identical) — `inst-attach-handlers`
8. [ ] `p1` - Store the connection in the connections map keyed by connection ID — `inst-store-connection`
9. [ ] `p1` - RETURN connection ID — `inst-return-conn-id`
10. [ ] `p1` - On `done` event, call `onComplete` callback, then call `disconnect(connectionId)` — `inst-sse-done`
11. [ ] `p1` - On error event, log the error and call `disconnect(connectionId)` — `inst-sse-error`

---

### Flow 4 — SSE Disconnection

- [ ] `p1` - **ID**: `cpt-hai3-flow-api-communication-sse-disconnect`

**Actors**: `cpt-hai3-actor-developer`, `cpt-hai3-actor-runtime`

1. [ ] `p1` - Domain code calls `this.protocol(SseProtocol).disconnect(connectionId)` — `inst-disconnect-call`
2. [ ] `p1` - IF connection exists in the map, call `close()` on the `EventSource` — `inst-close-connection`
3. [ ] `p1` - Remove connection from the connections map — `inst-remove-connection`
4. [ ] `p1` - IF connection does not exist, no-op — `inst-disconnect-noop`

---

### Flow 5 — Mock Plugin Registration and Activation by Framework

- [ ] `p2` - **ID**: `cpt-hai3-flow-api-communication-mock-activation`

**Actors**: `cpt-hai3-actor-framework-plugin`, `cpt-hai3-actor-studio-user`, `cpt-hai3-actor-developer`

1. [ ] `p2` - Service constructor registers a `RestMockPlugin` or `SseMockPlugin` via `this.registerPlugin(protocol, mockPlugin)` — `inst-service-register-mock`
2. [ ] `p2` - Framework (or Studio user) triggers `toggleMockMode(true)` action — `inst-toggle-mock-on`
3. [ ] `p2` - Framework iterates `apiRegistry.getAll()`, and for each service calls `service.getPlugins()` — `inst-iterate-services`
4. [ ] `p2` - FOR EACH `[protocol, pluginSet]` in the registered plugins map, FOR EACH plugin in the set, IF `isMockPlugin(plugin)` is true, activate the plugin for the protocol — `inst-activate-mock`
5. [ ] `p2` - On next REST request or SSE connect, the mock plugin's `onRequest` / `onConnect` hook intercepts and returns a short-circuit response — `inst-mock-intercepts`
6. [ ] `p2` - Framework triggers `toggleMockMode(false)` to deactivate mock plugins — `inst-toggle-mock-off`
7. [ ] `p2` - Subsequent requests proceed through real protocols — `inst-real-requests-resume`

---

### Flow 6 — Global Plugin Registration via apiRegistry.plugins

- [ ] `p1` - **ID**: `cpt-hai3-flow-api-communication-global-plugin`

**Actors**: `cpt-hai3-actor-developer`, `cpt-hai3-actor-host-app`

1. [ ] `p1` - Developer calls `apiRegistry.plugins.add(ProtocolClass, pluginInstance)` — `inst-global-add`
2. [ ] `p1` - The plugin is stored in the registry's protocol plugin map keyed by `ProtocolClass` — `inst-global-store`
3. [ ] `p1` - On each request or SSE connect, protocols call `apiRegistry.plugins.getAll(ProtocolClass)`, filter out excluded classes, and prepend global plugins to instance plugins — `inst-global-query`
4. [ ] `p1` - Developer calls `apiRegistry.plugins.remove(ProtocolClass, PluginClass)` to remove a global plugin; `destroy()` is called on the plugin instance — `inst-global-remove`
5. [ ] `p1` - Developer calls `apiRegistry.plugins.has(ProtocolClass, PluginClass)` to check presence — `inst-global-has`
6. [ ] `p1` - Developer calls `apiRegistry.plugins.clear(ProtocolClass)` to remove and destroy all plugins for that protocol — `inst-global-clear`

---

### Flow 7 — Service-Level Plugin Exclusion

- [ ] `p1` - **ID**: `cpt-hai3-flow-api-communication-plugin-exclusion`

**Actors**: `cpt-hai3-actor-developer`

1. [ ] `p1` - Developer calls `service.plugins.exclude(PluginClass)` in the service constructor — `inst-exclude-call`
2. [ ] `p1` - The protocol's `getGlobalPlugins()` queries `getExcludedClasses()` from the service — `inst-query-excluded`
3. [ ] `p1` - FOR EACH global plugin, IF its class is in the excluded set, skip it — `inst-filter-excluded`
4. [ ] `p1` - Only non-excluded global plugins and all instance plugins are included in the execution order — `inst-exclusion-result`

---

### Flow 8 — Service Cleanup

- [ ] `p1` - **ID**: `cpt-hai3-flow-api-communication-service-cleanup`

**Actors**: `cpt-hai3-actor-framework-plugin`, `cpt-hai3-actor-runtime`

1. [ ] `p1` - Framework or registry calls `service.cleanup()` — `inst-cleanup-call`
2. [ ] `p1` - FOR EACH registered protocol, call `protocol.cleanup()` — `inst-protocol-cleanup`
3. [ ] `p1` - `RestProtocol.cleanup()`: calls `destroy()` on all instance plugins, clears instance plugin set, nulls axios client and config — `inst-rest-cleanup`
4. [ ] `p1` - `SseProtocol.cleanup()`: closes all active `EventSource` connections, clears connections map, calls `destroy()` on all instance plugins — `inst-sse-cleanup`
5. [ ] `p1` - Service clears the protocols map — `inst-clear-protocols`

---

## Processes / Business Logic

### Algorithm 1 — REST Plugin Chain Execution (onRequest)

- [ ] `p1` - **ID**: `cpt-hai3-algo-api-communication-rest-plugin-chain-request`

1. [ ] `p1` - Start with `currentContext = requestContext` — `inst-init-context`
2. [ ] `p1` - FOR EACH plugin in `getPluginsInOrder()` (global → instance, FIFO): — `inst-iterate-plugins`
3. [ ] `p1` - IF plugin has `onRequest`, call it with `currentContext` — `inst-call-on-request`
4. [ ] `p1` - IF result satisfies `isRestShortCircuit(result)`, RETURN `result` immediately (stop iteration) — `inst-check-short-circuit`
5. [ ] `p1` - Otherwise, assign `currentContext = result` and continue — `inst-update-context`
6. [ ] `p1` - RETURN `currentContext` after all plugins — `inst-return-context`

---

### Algorithm 2 — REST Plugin Chain Execution (onResponse / onError)

- [ ] `p1` - **ID**: `cpt-hai3-algo-api-communication-rest-plugin-chain-response`

**onResponse (LIFO)**:

1. [ ] `p1` - Start with `currentContext = responseContext` — `inst-init-response-context`
2. [ ] `p1` - FOR EACH plugin in `getPluginsInOrder()` reversed: — `inst-reverse-iterate`
3. [ ] `p1` - IF plugin has `onResponse`, call it with `currentContext` and update — `inst-call-on-response`
4. [ ] `p1` - RETURN final `currentContext` — `inst-return-response-context`

**onError (LIFO with recovery)**:

5. [ ] `p1` - FOR EACH plugin in `getPluginsInOrder()` reversed: — `inst-error-reverse-iterate`
6. [ ] `p1` - IF plugin has `onError`, call it with `ApiPluginErrorContext` — `inst-call-on-error`
7. [ ] `p1` - IF result is a `RestResponseContext` (has `status` and `data`), RETURN it as recovery — `inst-error-recovery-check`
8. [ ] `p1` - IF result is an `Error`, replace `currentError` and continue — `inst-update-error`
9. [ ] `p1` - RETURN final error if no plugin recovered — `inst-return-final-error`

---

### Algorithm 3 — SSE Plugin Chain Execution (onConnect)

- [ ] `p1` - **ID**: `cpt-hai3-algo-api-communication-sse-plugin-chain`

1. [ ] `p1` - Start with `currentContext = { url: fullUrl, headers: {} }` — `inst-init-sse-context`
2. [ ] `p1` - FOR EACH plugin in `getPluginsInOrder()` (global → instance, FIFO): — `inst-sse-iterate-plugins`
3. [ ] `p1` - IF plugin has `onConnect`, call it with `currentContext` — `inst-call-on-connect`
4. [ ] `p1` - IF result satisfies `isSseShortCircuit(result)`, RETURN `result` immediately (stop iteration) — `inst-sse-short-circuit-check`
5. [ ] `p1` - Otherwise, assign `currentContext = result` and continue — `inst-update-sse-context`
6. [ ] `p1` - RETURN `currentContext` if no short-circuit — `inst-return-sse-context`

---

### Algorithm 4 — Mock Factory Matching (RestMockPlugin)

- [ ] `p2` - **ID**: `cpt-hai3-algo-api-communication-mock-factory-match`

1. [ ] `p2` - Build key string as `"METHOD /full/url"` from `RestRequestContext` — `inst-build-key`
2. [ ] `p2` - Try exact key match in `currentMockMap` — `inst-exact-match`
3. [ ] `p2` - IF exact match found, RETURN the corresponding `MockResponseFactory` — `inst-return-exact`
4. [ ] `p2` - FOR EACH entry in `currentMockMap`: — `inst-pattern-iterate`
5. [ ] `p2` - IF entry key contains `:params`, convert path segments to regex (`[^/]+`) and test against full URL — `inst-pattern-regex`
6. [ ] `p2` - IF regex matches, RETURN the factory — `inst-return-pattern`
7. [ ] `p2` - RETURN `undefined` if no match (passthrough — plugin returns original `RestRequestContext`) — `inst-no-match`

---

### Algorithm 5 — Mock Stream Matching (SseMockPlugin)

- [ ] `p2` - **ID**: `cpt-hai3-algo-api-communication-sse-mock-match`

1. [ ] `p2` - Try exact URL match in `currentMockStreams` — `inst-sse-exact-match`
2. [ ] `p2` - IF exact match found, RETURN the corresponding events array — `inst-sse-return-exact`
3. [ ] `p2` - FOR EACH entry in `currentMockStreams`: — `inst-sse-pattern-iterate`
4. [ ] `p2` - IF entry key ends with `*`, perform prefix match against the URL — `inst-sse-prefix-match`
5. [ ] `p2` - IF prefix matches, RETURN the events array — `inst-sse-return-prefix`
6. [ ] `p2` - RETURN `undefined` if no match (passthrough — plugin returns original `SseConnectContext`) — `inst-sse-no-match`

---

### Algorithm 6 — MockEventSource Event Emission

- [ ] `p2` - **ID**: `cpt-hai3-algo-api-communication-mock-event-source`

1. [ ] `p2` - On construction, start `startEmitting()` asynchronously — `inst-start-emitting`
2. [ ] `p2` - Set `readyState = 1` (OPEN) and emit `open` event — `inst-open-state`
3. [ ] `p2` - FOR EACH `SseMockEvent` in events array: — `inst-event-iterate`
4. [ ] `p2` - IF `abortController.signal.aborted`, RETURN early — `inst-abort-check`
5. [ ] `p2` - Wait `delay` milliseconds (default: 50ms); IF abort signal fires during wait, RETURN early — `inst-wait-delay`
6. [ ] `p2` - Determine event type: use `mockEvent.event` if set, otherwise `'message'` — `inst-determine-type`
7. [ ] `p2` - Create `MessageEvent` with the event type and `mockEvent.data` — `inst-create-event`
8. [ ] `p2` - IF event type is `'message'`, call `onmessage` handler — `inst-call-onmessage`
9. [ ] `p2` - Dispatch to all registered listeners for the event type — `inst-dispatch-listeners`
10. [ ] `p2` - After all events, set `readyState = 2` (CLOSED) — `inst-closed-state`

---

### Algorithm 7 — isMockPlugin Type Guard

- [ ] `p2` - **ID**: `cpt-hai3-algo-api-communication-is-mock-plugin`

1. [ ] `p2` - IF `plugin` is `null`, `undefined`, or not an object, RETURN `false` — `inst-null-check`
2. [ ] `p2` - Read the plugin's `constructor` reference — `inst-get-constructor`
3. [ ] `p2` - IF `MOCK_PLUGIN` symbol is present in `constructor`, RETURN `true` — `inst-symbol-check`
4. [ ] `p2` - Otherwise RETURN `false` — `inst-return-false`

---

### Algorithm 8 — Protocol Plugin Ordering

- [ ] `p1` - **ID**: `cpt-hai3-algo-api-communication-plugin-ordering`

This algorithm governs how both `RestProtocol` and `SseProtocol` build their execution order at call time (not at registration time, so that global plugin mutations are reflected immediately).

1. [ ] `p1` - Retrieve global plugins via `apiRegistry.plugins.getAll(ProtocolClass)` — `inst-get-global`
2. [ ] `p1` - Retrieve excluded classes via `service.getExcludedClasses()` — `inst-get-excluded`
3. [ ] `p1` - IF excluded set is empty, use all global plugins as-is — `inst-skip-filter`
4. [ ] `p1` - ELSE FOR EACH global plugin, IF its class is in the excluded set, remove it — `inst-apply-filter`
5. [ ] `p1` - Append all instance plugins (from `_instancePlugins`) after the filtered global plugins — `inst-append-instance`
6. [ ] `p1` - RETURN the concatenated ordered array — `inst-return-ordered`

---

## States

### State 1 — REST Connection State

- [ ] `p1` - **ID**: `cpt-hai3-state-api-communication-rest-connection`

The Axios client on a `RestProtocol` instance transitions through three states during its lifecycle.

1. [ ] `p1` - **FROM** `UNINITIALIZED` **TO** `READY` **WHEN** `initialize()` is called with `ApiServiceConfig` and an Axios instance is created — `inst-rest-init`
2. [ ] `p1` - **FROM** `READY` **TO** `READY` **WHEN** a request completes (success or error with recovery) — `inst-rest-steady`
3. [ ] `p1` - **FROM** `READY` **TO** `DESTROYED` **WHEN** `cleanup()` is called; Axios client is nulled, instance plugins are destroyed — `inst-rest-destroy`
4. [ ] `p1` - IF any method is called while in `UNINITIALIZED` state, RETURN error: `"RestProtocol not initialized"` — `inst-rest-not-init-guard`

---

### State 2 — SSE Connection State

- [ ] `p1` - **ID**: `cpt-hai3-state-api-communication-sse-connection`

Each individual SSE connection tracks its own lifecycle, independent of other connections on the same `SseProtocol` instance.

1. [ ] `p1` - **FROM** `PENDING` **TO** `CONNECTING` **WHEN** `connect()` resolves and handlers are attached to the `EventSourceLike` — `inst-sse-connecting`
2. [ ] `p1` - **FROM** `CONNECTING` **TO** `OPEN` **WHEN** the underlying `EventSource.readyState` reaches 1 (OPEN) — `inst-sse-open`
3. [ ] `p1` - **FROM** `OPEN` **TO** `CLOSED` **WHEN** `disconnect(connectionId)` is called or the `done` event fires — `inst-sse-closed`
4. [ ] `p1` - **FROM** `OPEN` **TO** `CLOSED` **WHEN** an error event fires; error is logged and disconnect is called — `inst-sse-error-state`
5. [ ] `p1` - **FROM** `CLOSED` **TO** `CLOSED` **WHEN** `disconnect()` is called on an already-closed connection (no-op) — `inst-sse-noop-disconnect`

---

### State 3 — MockEventSource Lifecycle

- [ ] `p2` - **ID**: `cpt-hai3-state-api-communication-mock-event-source`

Mirrors the `EventSource` `readyState` spec values for compatibility.

1. [ ] `p2` - **FROM** `0` (CONNECTING) **TO** `1` (OPEN) **WHEN** `startEmitting()` begins and the `open` event is dispatched — `inst-mock-open`
2. [ ] `p2` - **FROM** `1` (OPEN) **TO** `1` (OPEN) **WHEN** each `SseMockEvent` in the events array is dispatched (steady emission) — `inst-mock-emitting`
3. [ ] `p2` - **FROM** `1` (OPEN) **TO** `2` (CLOSED) **WHEN** all events have been emitted — `inst-mock-all-emitted`
4. [ ] `p2` - **FROM** any **TO** `2` (CLOSED) **WHEN** `close()` is called; `abortController.abort()` stops emission — `inst-mock-force-close`
5. [ ] `p2` - IF `close()` is called when already in state `2`, no-op — `inst-mock-close-noop`

---

### State 4 — Mock Mode Toggle State

- [ ] `p2` - **ID**: `cpt-hai3-state-api-communication-mock-mode`

Global mock mode state managed by the framework layer, not within `@hai3/api` itself. `@hai3/api` exposes the identification mechanism (`MOCK_PLUGIN` symbol, `isMockPlugin` guard) that the framework uses to act on this state.

1. [ ] `p2` - **FROM** `REAL` **TO** `MOCK` **WHEN** `toggleMockMode(true)` action fires; framework activates all plugins where `isMockPlugin(plugin)` is `true` — `inst-mock-on`
2. [ ] `p2` - **FROM** `MOCK` **TO** `REAL` **WHEN** `toggleMockMode(false)` action fires; framework deactivates all mock plugins — `inst-mock-off`
3. [ ] `p2` - Initial state is `REAL` — `inst-mock-initial`

---

## Definitions of Done

### DoD 1 — BaseApiService and Protocol Registry

- [ ] `p1` - **ID**: `cpt-hai3-dod-api-communication-base-service`

`BaseApiService` provides the protocol registry, service-level plugin namespace, framework plugin registration, and cleanup contract that all domain services inherit.

**Implementation details**:

- Class: `BaseApiService` in `packages/api/src/BaseApiService.ts`
- Protocol storage: `Map<string, ApiProtocol>` keyed by `protocol.constructor.name`
- Constructor: accepts `ApiServiceConfig` and rest `...protocols`; calls `protocol.initialize(config, getExcludedClasses)` for each
- `protocol<T>(type)` method: looks up by `type.name`, throws typed error if absent
- `plugins.add(...)` / `plugins.exclude(...)` / `plugins.getAll()` / `plugins.getExcluded()` / `plugins.getPlugin(Class)`
- `registerPlugin(protocol, plugin)` stores in `registeredPluginsMap: Map<ApiProtocol, Set<ApiPluginBase>>`; throws if protocol not registered on this service
- `getPlugins()` returns `ReadonlyMap<ApiProtocol, ReadonlySet<ApiPluginBase>>`
- `cleanup()` calls `protocol.cleanup()` on each, clears map

**Implements**:
- `cpt-hai3-flow-api-communication-service-registration`
- `cpt-hai3-flow-api-communication-service-cleanup`
- `cpt-hai3-algo-api-communication-plugin-ordering`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-api-package`
- `cpt-hai3-fr-sse-protocol-registry`
- `cpt-hai3-nfr-rel-api-retry`

**Covers (DESIGN)**:
- `cpt-hai3-principle-event-driven-architecture`
- `cpt-hai3-constraint-no-react-below-l3`
- `cpt-hai3-constraint-zero-cross-deps-at-l1`
- `cpt-hai3-constraint-no-package-internals-imports`
- `cpt-hai3-component-api`

---

### DoD 2 — RestProtocol

- [ ] `p1` - **ID**: `cpt-hai3-dod-api-communication-rest-protocol`

`RestProtocol` wraps Axios with a full plugin chain, supporting request interception, response transformation, error recovery with retry, and short-circuit for mocking.

**Implementation details**:

- Class: `RestProtocol extends ApiProtocol<RestPluginHooks>` in `packages/api/src/protocols/RestProtocol.ts`
- Constructor config: `RestProtocolConfig` with `withCredentials`, `contentType`, `timeout`, `maxRetryDepth` (default: 10)
- `initialize(config, getExcludedClasses)`: creates Axios instance with `baseURL`, `Content-Type`, timeout, and credentials
- `getPluginsInOrder()`: concatenates filtered global plugins (via `apiRegistry.plugins.getAll(RestProtocol)`, excluding excluded classes) with instance plugins
- HTTP methods: `get`, `post`, `put`, `patch`, `delete` — all delegate to `requestInternal(method, relativeUrl, data, params, retryCount)`
- `requestInternal`: builds `ApiRequestContext` with full URL for plugins; sends Axios request with relative URL only; executes `onRequest` → Axios → `onResponse` or `onError` chain
- `plugins.add/remove/getAll` for instance plugins
- State: `cpt-hai3-state-api-communication-rest-connection`

**Implements**:
- `cpt-hai3-flow-api-communication-rest-request`
- `cpt-hai3-algo-api-communication-rest-plugin-chain-request`
- `cpt-hai3-algo-api-communication-rest-plugin-chain-response`
- `cpt-hai3-algo-api-communication-plugin-ordering`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-api-package`
- `cpt-hai3-fr-sse-protocol-registry`
- `cpt-hai3-nfr-rel-api-retry`

**Covers (DESIGN)**:
- `cpt-hai3-constraint-no-react-below-l3`
- `cpt-hai3-constraint-zero-cross-deps-at-l1`
- `cpt-hai3-component-api`

---

### DoD 3 — SseProtocol

- [ ] `p1` - **ID**: `cpt-hai3-dod-api-communication-sse-protocol`

`SseProtocol` wraps the browser `EventSource` API with async `connect()` and `disconnect()`, a plugin chain for connection interception, and uniform handler attachment for both mock and real connections.

**Implementation details**:

- Class: `SseProtocol extends ApiProtocol<SsePluginHooks>` in `packages/api/src/protocols/SseProtocol.ts`
- Constructor config: `SseProtocolConfig` with `withCredentials` (default: `true`), `reconnectAttempts`
- `initialize(baseConfig, getExcludedClasses)`: stores config and excluded classes callback
- `connect(url, onMessage, onComplete)`: async; generates ID; runs plugin chain; branches on short-circuit vs real `EventSource`; calls `attachHandlers`; returns connection ID
- `attachHandlers`: assigns `onmessage`, `onerror`, `done` listener — same code path for mock and real
- `disconnect(connectionId)`: closes and removes from map
- `cleanup()`: closes all connections, destroys instance plugins
- `getPluginsInOrder()`: global (filtered) + instance
- Connection storage: `Map<string, EventSource>` (stores `EventSourceLike` cast)
- State: `cpt-hai3-state-api-communication-sse-connection`

**Implements**:
- `cpt-hai3-flow-api-communication-sse-connection`
- `cpt-hai3-flow-api-communication-sse-disconnect`
- `cpt-hai3-algo-api-communication-sse-plugin-chain`
- `cpt-hai3-algo-api-communication-plugin-ordering`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-api-package`
- `cpt-hai3-fr-sse-protocol`
- `cpt-hai3-fr-sse-protocol-registry`

**Covers (DESIGN)**:
- `cpt-hai3-constraint-no-react-below-l3`
- `cpt-hai3-constraint-zero-cross-deps-at-l1`
- `cpt-hai3-component-api`

---

### DoD 4 — RestMockPlugin

- [ ] `p2` - **ID**: `cpt-hai3-dod-api-communication-rest-mock-plugin`

`RestMockPlugin` intercepts REST requests and returns configured mock data via the short-circuit mechanism, without making a real HTTP call.

**Implementation details**:

- Class: `RestMockPlugin extends RestPluginWithConfig<RestMockConfig>` in `packages/api/src/plugins/RestMockPlugin.ts`
- Static: `static readonly [MOCK_PLUGIN] = true` — required for `isMockPlugin()` identification
- Config: `mockMap?: Record<string, MockResponseFactory>`, `delay?: number`
- `onRequest(context)`: calls `findMockFactory(method, fullUrl)`; if found, optionally delays, then returns `RestShortCircuitResponse` with `status: 200` and mock data; if not found, returns context unchanged
- `findMockFactory`: exact key match first (`"METHOD /url"`), then pattern matching with `:param` → `[^/]+` regex
- `setMockMap(map)`: allows dynamic replacement of mock map at runtime
- `destroy()`: no-op (no resources to release)

**Implements**:
- `cpt-hai3-flow-api-communication-mock-activation`
- `cpt-hai3-algo-api-communication-mock-factory-match`
- `cpt-hai3-algo-api-communication-is-mock-plugin`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-api-package`
- `cpt-hai3-fr-sse-mock-mode`
- `cpt-hai3-fr-mock-toggle`

**Covers (DESIGN)**:
- `cpt-hai3-adr-symbol-based-mock-plugin-identification`
- `cpt-hai3-component-api`

---

### DoD 5 — SseMockPlugin and MockEventSource

- [ ] `p2` - **ID**: `cpt-hai3-dod-api-communication-sse-mock-plugin`

`SseMockPlugin` intercepts SSE connections and returns a `MockEventSource` instance that emits configured events asynchronously, simulating a real SSE stream without a network connection.

**Implementation details**:

- Class: `SseMockPlugin extends SsePluginWithConfig<SseMockConfig>` in `packages/api/src/plugins/SseMockPlugin.ts`
- Static: `static readonly [MOCK_PLUGIN] = true`
- Config: `mockStreams: Record<string, SseMockEvent[]>`, `delay?: number`
- `onConnect(context)`: calls `findMockEvents(url)`; if found, creates `MockEventSource(events, delay)` and returns `SseShortCircuitResponse`; if not found, returns context unchanged
- `findMockEvents`: exact URL match, then wildcard prefix match (`pattern.endsWith('*')`)
- `setMockStreams(map)`: allows dynamic replacement
- Class: `MockEventSource implements EventSourceLike` in `packages/api/src/mocks/MockEventSource.ts`
- `MockEventSource`: emits events asynchronously with configurable delay, supports `AbortController` for `close()`, tracks `readyState` (0/1/2), dispatches to `onmessage` and `addEventListener` listeners
- State: `cpt-hai3-state-api-communication-mock-event-source`

**Implements**:
- `cpt-hai3-flow-api-communication-mock-activation`
- `cpt-hai3-algo-api-communication-sse-mock-match`
- `cpt-hai3-algo-api-communication-mock-event-source`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-api-package`
- `cpt-hai3-fr-sse-mock-mode`
- `cpt-hai3-fr-mock-toggle`

**Covers (DESIGN)**:
- `cpt-hai3-adr-symbol-based-mock-plugin-identification`
- `cpt-hai3-component-api`

---

### DoD 6 — ApiRegistry

- [ ] `p1` - **ID**: `cpt-hai3-dod-api-communication-registry`

`apiRegistry` is the singleton central registry for all domain API service instances, providing type-safe access, global protocol plugin management, and a clean reset mechanism for testing.

**Implementation details**:

- Singleton: `export const apiRegistry = new ApiRegistryImpl()` in `packages/api/src/apiRegistry.ts`
- `register(ServiceClass)`: instantiates `new ServiceClass()` and stores by class constructor key
- `getService(ServiceClass)`: returns typed instance; throws if not registered
- `has(ServiceClass)`: boolean presence check
- `getAll()`: returns all `BaseApiService` instances (for framework iteration)
- `initialize(config?)`: accepts optional `ApiServicesConfig`; stores merged config
- `plugins` namespace: `add(ProtocolClass, plugin)`, `remove(ProtocolClass, PluginClass)`, `has(ProtocolClass, PluginClass)`, `getAll(ProtocolClass)`, `clear(ProtocolClass)`
- `reset()`: calls `service.cleanup()` on all services, calls `plugin.destroy()` on all protocol plugins, clears all maps (for testing only)

**Implements**:
- `cpt-hai3-flow-api-communication-service-registration`
- `cpt-hai3-flow-api-communication-global-plugin`
- `cpt-hai3-flow-api-communication-mock-activation`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-api-package`
- `cpt-hai3-fr-sse-protocol-registry`

**Covers (DESIGN)**:
- `cpt-hai3-constraint-zero-cross-deps-at-l1`
- `cpt-hai3-constraint-no-package-internals-imports`
- `cpt-hai3-component-api`

---

### DoD 7 — Plugin Type System and Type Guards

- [ ] `p1` - **ID**: `cpt-hai3-dod-api-communication-plugin-types`

The type system provides protocol-specific plugin base classes and type guards that enforce correct plugin composition without coupling plugins to each other or to service internals.

**Implementation details**:

- `ApiPluginBase`: abstract class with optional `onRequest`, `onResponse`, `onError` (deprecated), and `destroy` hooks
- `ApiPlugin<TConfig>`: extends `ApiPluginBase` with typed `config` constructor parameter
- `RestPlugin` / `RestPluginWithConfig<TConfig>`: implement `RestPluginHooks` (not extending `ApiPluginBase` to avoid signature conflicts)
- `SsePlugin` / `SsePluginWithConfig<TConfig>`: implement `SsePluginHooks`
- `MOCK_PLUGIN`: `Symbol.for('hai3:plugin:mock')` — stable cross-realm identity
- `isMockPlugin(plugin)`: reads `constructor[MOCK_PLUGIN]`; does not use `instanceof`
- `isShortCircuit`, `isRestShortCircuit`, `isSseShortCircuit`: structural type guards
- `ProtocolPluginType<T>`: conditional type extracting plugin hook type from `ApiProtocol<TPlugin>`
- `ApiPluginErrorContext`: includes `error`, `request`, `retryCount`, and `retry(modifiedRequest?)` function

**Implements**:
- `cpt-hai3-algo-api-communication-is-mock-plugin`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-api-package`
- `cpt-hai3-fr-sse-type-safe-events`

**Covers (DESIGN)**:
- `cpt-hai3-constraint-typescript-strict-mode`
- `cpt-hai3-adr-symbol-based-mock-plugin-identification`
- `cpt-hai3-component-api`

---

### DoD 8 — Package Public API Surface

- [ ] `p1` - **ID**: `cpt-hai3-dod-api-communication-public-api`

The `@hai3/api` package exposes a complete, tree-shakeable public surface through `packages/api/src/index.ts` with zero `@hai3/*` dependencies.

**Implementation details**:

- Exports: `BaseApiService`, `RestProtocol`, `SseProtocol`, `RestMockPlugin`, `SseMockPlugin`, `MockEventSource`
- Exports: `ApiPluginBase`, `ApiPlugin`, `RestPlugin`, `RestPluginWithConfig`, `SsePlugin`, `SsePluginWithConfig`
- Exports: `apiRegistry`
- Exports: `MOCK_PLUGIN`, `isMockPlugin`, `isShortCircuit`, `isRestShortCircuit`, `isSseShortCircuit`
- Type exports: all types from `types.ts` and config interfaces from plugin files
- Peer dependency: `axios` only
- No `@hai3/*` entries in `dependencies` or `devDependencies`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-api-package`
- `cpt-hai3-fr-sdk-flat-packages`

**Covers (DESIGN)**:
- `cpt-hai3-constraint-zero-cross-deps-at-l1`
- `cpt-hai3-constraint-no-package-internals-imports`
- `cpt-hai3-constraint-esm-first-module-format`
- `cpt-hai3-constraint-typescript-strict-mode`
- `cpt-hai3-component-api`

---

## Acceptance Criteria

- [ ] `BaseApiService` constructor registers protocols by constructor name and passes the excluded-classes callback; calling an unregistered protocol throws a typed error
- [ ] `RestProtocol` executes `onRequest` plugins in FIFO order; the first short-circuit response stops the chain and skips the Axios call
- [ ] `RestProtocol` executes `onResponse` and `onError` plugins in LIFO order; a plugin that returns `RestResponseContext` from `onError` is treated as recovery and propagated as the final response
- [ ] `RestProtocol.requestInternal` enforces `maxRetryDepth`; a request that exceeds the limit throws rather than looping
- [ ] `SseProtocol.connect` runs the SSE plugin chain; a plugin returning `SseShortCircuitResponse` causes the returned `EventSourceLike` to be used in place of a real `EventSource`
- [ ] `SseProtocol.attachHandlers` is identical for mock and real `EventSourceLike` instances; `disconnect` closes and removes the connection
- [ ] `SseProtocol.cleanup` closes all open connections and destroys instance plugins
- [ ] `RestMockPlugin.onRequest` returns `RestShortCircuitResponse` for matched keys (exact and `:param` pattern) and returns the original context unchanged for unmatched keys
- [ ] `SseMockPlugin.onConnect` returns `SseShortCircuitResponse` with a `MockEventSource` for matched URLs and returns original context unchanged otherwise
- [ ] `MockEventSource` emits events in order with configured delay, respects `AbortController` abort during delay, and sets `readyState = 2` after all events are emitted
- [ ] `isMockPlugin` returns `true` for `RestMockPlugin` and `SseMockPlugin` instances (via `MOCK_PLUGIN` symbol on constructor); returns `false` for non-mock plugins
- [ ] `apiRegistry.register` instantiates the service; `getService` returns the typed instance; calling `getService` for an unregistered class throws
- [ ] `apiRegistry.plugins.add` / `remove` / `has` / `getAll` / `clear` operate correctly on the protocol plugin map; `remove` and `clear` call `destroy()` on affected plugins
- [ ] Service-level `plugins.exclude(PluginClass)` prevents excluded global plugin classes from appearing in `getPluginsInOrder()` for that protocol
- [ ] `@hai3/api` `package.json` contains zero `@hai3/*` entries in `dependencies` and `devDependencies`
- [ ] TypeScript strict-mode compilation passes with no `any`, `as unknown as`, or `@ts-ignore` usage in any source file under `packages/api/src/`

---

## Additional Context

### Plugin Execution Order Convention

Global plugins execute before instance plugins. Within each group, order follows insertion order (FIFO for `onRequest`/`onConnect`, LIFO for `onResponse`/`onError`). This is not configurable by plugin priority score — the separation between global scope and service scope is the primary ordering axis. Plugins that need to run last globally should use instance-level registration on the specific service.

### Full URL vs Relative URL Split

Plugins in `RestProtocol` receive the full URL (`baseURL + relativeUrl`) in `RestRequestContext.url` for mock key matching. However, the actual Axios call uses the original relative URL because the Axios instance already has `baseURL` configured. This split is intentional — mixing full and relative URLs in Axios produces double-prefixed paths. The `RestMockPlugin` mock keys must therefore use full paths to match.

### MOCK_PLUGIN Symbol Identity

`Symbol.for('hai3:plugin:mock')` is used (not `Symbol()`) so that the symbol is stable across module boundaries and iframe contexts. Any plugin class can be marked as a mock plugin by declaring `static readonly [MOCK_PLUGIN] = true` on its constructor, without inheriting from a specific base class. The `isMockPlugin` guard checks the constructor, not the instance, so subclasses inherit the mark automatically.

### No Mock State in @hai3/api

`@hai3/api` does not track or toggle mock mode state. Mock plugins are plain plugins that intercept requests. Whether they are active is determined purely by whether they are registered in the protocol's plugin chain. The framework layer (`@hai3/framework`) is responsible for activating and deactivating mock plugins in response to `toggleMockMode` events. `@hai3/api` exposes only the identification primitives (`MOCK_PLUGIN`, `isMockPlugin`) that the framework uses to implement this logic.

### MockEventSource Abort Safety

`MockEventSource` uses `AbortController` for cancellation rather than a boolean flag, because `AbortController` integrates naturally with the `Promise`-based sleep delay. The sleep rejects on abort, and the `catch` in the event loop exits early. Callers that hold a reference to `MockEventSource` can call `close()` at any point and the emission loop will terminate at the next checkpoint without emitting further events.
