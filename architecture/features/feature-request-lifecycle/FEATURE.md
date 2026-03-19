# Feature: Request Lifecycle & Query Integration


<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Flow 1 — REST Request with AbortSignal Cancellation](#flow-1-rest-request-with-abortsignal-cancellation)
  - [Flow 2 — Declarative Query via useApiQuery Hook](#flow-2-declarative-query-via-useapiquery-hook)
  - [Flow 3 — Declarative Mutation via useApiMutation Hook](#flow-3-declarative-mutation-via-useapimutation-hook)
  - [Flow 5 — Cross-Feature Orchestration via Flux (Escape Hatch)](#flow-5-cross-feature-orchestration-via-flux-escape-hatch)
  - [Flow 4 — QueryClient Lifecycle in HAI3Provider](#flow-4-queryclient-lifecycle-in-hai3provider)
- [3. Processes / Business Logic (CDSL)](#3-processes-business-logic-cdsl)
  - [Algorithm 1 — AbortSignal Threading in RestProtocol](#algorithm-1-abortsignal-threading-in-restprotocol)
  - [Algorithm 2 — CanceledError Detection and Bypass](#algorithm-2-cancelederror-detection-and-bypass)
  - [Algorithm 3 — RequestOptions Pattern for HTTP Methods](#algorithm-3-requestoptions-pattern-for-http-methods)
  - [Algorithm 4 — QueryClient Default Configuration](#algorithm-4-queryclient-default-configuration)
  - [Algorithm 5 — Optimistic Update with Rollback](#algorithm-5-optimistic-update-with-rollback)
  - [Algorithm 6 — Query Invalidation After Mutation](#algorithm-6-query-invalidation-after-mutation)
- [4. States (CDSL)](#4-states-cdsl)
  - [State 1 — Query Lifecycle State](#state-1-query-lifecycle-state)
  - [State 2 — Mutation Lifecycle State](#state-2-mutation-lifecycle-state)
- [5. Definitions of Done](#5-definitions-of-done)
  - [DoD 1 — AbortSignal Support in RestProtocol](#dod-1-abortsignal-support-in-restprotocol)
  - [DoD 2 — QueryClientProvider in HAI3Provider](#dod-2-queryclientprovider-in-hai3provider)
  - [DoD 3 — useApiQuery Hook](#dod-3-useapiquery-hook)
  - [DoD 4 — useApiMutation Hook](#dod-4-useapimutation-hook)
- [6. Acceptance Criteria](#6-acceptance-criteria)
- [Additional Context](#additional-context)
  - [TanStack Query Retry Disabled by Default](#tanstack-query-retry-disabled-by-default)
  - [Event-Driven Pattern Coexistence](#event-driven-pattern-coexistence)
  - [AbortSignal in Short-Circuit Path](#abortsignal-in-short-circuit-path)
  - [Shared QueryClient Across MFEs](#shared-queryclient-across-mfes)

<!-- /toc -->

- [ ] `p1` - **ID**: `cpt-hai3-featstatus-request-lifecycle`

- [ ] `p2` - `cpt-hai3-feature-request-lifecycle`
---

## 1. Feature Context

### 1.1 Overview

Adds request cancellation via `AbortSignal` to the REST protocol at L1, and integrates `@tanstack/react-query` at L3 to provide declarative data fetching with automatic caching, deduplication, background refetch, and cancellation on top of existing `BaseApiService` instances.

Problem: `RestProtocol` has no mechanism to cancel in-flight requests. Screen-set authors must manually manage loading/error/data states in Redux slices and write action/event/effect boilerplate for every API call. No request deduplication exists when multiple components fetch the same data.

Primary value: Developers get automatic request cancellation on unmount, stale-while-revalidate caching, request deduplication, and a declarative hook API — while preserving the existing plugin chain, mock mode, and service registry patterns.

Key assumptions: `@tanstack/react-query` remains a peer dependency (not bundled). `@tanstack/query-core` has zero runtime dependencies. TanStack Query is the default mechanism for both reads and writes at the component level. The existing event-driven Flux pattern (action → event → effect → reducer) is reserved for cross-feature orchestration where a mutation in one screen-set must trigger effects in another.

### 1.2 Purpose

Enable developers to cancel in-flight REST requests via the standard `AbortSignal` browser API at L1, and adopt declarative query and mutation hooks at L3 that eliminate per-endpoint Redux boilerplate for both reads and writes while preserving the service registry, plugin chain, and mock mode architecture.

Success criteria: A developer can fetch data with `useApiQuery` and submit changes with `useApiMutation` — with automatic loading/error states, request cancellation on unmount, cached responses on re-mount, optimistic updates, and cache invalidation — without writing a slice, effect, event, or action.

### 1.3 Actors

- `cpt-hai3-actor-developer`
- `cpt-hai3-actor-screenset-author`
- `cpt-hai3-actor-runtime`
- `cpt-hai3-actor-host-app`

### 1.4 References

- Overall Design: [DESIGN.md](../../DESIGN.md)
- Decomposition: [DECOMPOSITION.md](../../DECOMPOSITION.md) — sections 2.4, 2.7
- PRD: [PRD.md](../../PRD.md) — sections 5.1 (API Package), 5.19 (Mock Mode)
- Parent features: `cpt-hai3-feature-api-communication`, `cpt-hai3-feature-react-bindings`
- ADRs: `cpt-hai3-adr-protocol-separated-api-architecture`, `cpt-hai3-adr-tanstack-query-data-management`

---

## 2. Actor Flows (CDSL)

### Flow 1 — REST Request with AbortSignal Cancellation

- [ ] `p1` - **ID**: `cpt-hai3-flow-request-lifecycle-rest-abort`

**Actors**: `cpt-hai3-actor-developer`, `cpt-hai3-actor-runtime`

1. [ ] - `p1` - Developer creates an `AbortController` instance — `inst-create-controller`
2. [ ] - `p1` - Developer calls a REST method with `signal` option (e.g., `protocol.get(url, { signal })`) — `inst-call-with-signal`
3. [ ] - `p1` - `RestProtocol` builds `RestRequestContext` including the `signal` property — `inst-build-context-signal`
4. [ ] - `p1` - `RestProtocol` executes `onRequest` plugin chain; plugins receive context with `signal` — `inst-plugin-chain-signal`
5. [ ] - `p1` - IF any plugin short-circuits, RETURN short-circuit response (signal is irrelevant) — `inst-short-circuit-bypass`
6. [ ] - `p1` - `RestProtocol` passes `signal` to `AxiosRequestConfig` for the HTTP call — `inst-axios-signal`
7. [ ] - `p1` - IF `controller.abort()` is called before response arrives, Axios throws `CanceledError` — `inst-abort-fires`
8. [ ] - `p1` - `RestProtocol` catches the `CanceledError` and re-throws it without entering the `onError` plugin chain — `inst-cancel-skip-plugins`
9. [ ] - `p1` - RETURN error to caller; caller handles cancellation (typically a no-op on unmount) — `inst-return-cancel-error`

---

### Flow 2 — Declarative Query via useApiQuery Hook

- [ ] `p2` - **ID**: `cpt-hai3-flow-request-lifecycle-use-api-query`

**Actors**: `cpt-hai3-actor-screenset-author`, `cpt-hai3-actor-runtime`

1. [ ] - `p2` - Screen-set author calls `useApiQuery({ queryKey, queryFn })` in a component — `inst-call-use-api-query`
2. [ ] - `p2` - `useApiQuery` delegates to `@tanstack/react-query`'s `useQuery` with the provided options — `inst-delegate-use-query`
3. [ ] - `p2` - TanStack Query invokes `queryFn({ signal })`, passing an internally created `AbortSignal` — `inst-tanstack-provides-signal`
4. [ ] - `p2` - `queryFn` calls the appropriate `BaseApiService` method, forwarding the `signal` — `inst-service-call-with-signal`
5. [ ] - `p2` - IF the query key is already cached and fresh, TanStack Query returns cached data immediately — `inst-cache-hit`
6. [ ] - `p2` - IF another component has the same query key in-flight, TanStack Query deduplicates (shares the single request promise) — `inst-dedup`
7. [ ] - `p2` - On success, TanStack Query caches the response and RETURN `{ data, isLoading: false, error: null }` — `inst-return-data`
8. [ ] - `p2` - On error, RETURN `{ data: undefined, isLoading: false, error }` — `inst-return-error`
9. [ ] - `p2` - On component unmount, TanStack Query aborts the in-flight request via the signal — `inst-unmount-abort`

---

### Flow 3 — Declarative Mutation via useApiMutation Hook

- [ ] `p2` - **ID**: `cpt-hai3-flow-request-lifecycle-use-api-mutation`

**Actors**: `cpt-hai3-actor-screenset-author`, `cpt-hai3-actor-runtime`

1. [ ] - `p2` - Screen-set author calls `useApiMutation({ mutationFn, onMutate?, onSuccess?, onError?, onSettled? })` — `inst-call-use-api-mutation`
2. [ ] - `p2` - Hook returns `{ mutate, mutateAsync, isPending, error, data, reset }` — `inst-return-mutation-state`
3. [ ] - `p2` - Author calls `mutate(variables)` from an event handler or form submission — `inst-invoke-mutate`
4. [ ] - `p2` - IF `onMutate` provided (optimistic update), execute it before the request: snapshot current cache, apply optimistic data via `queryClient.setQueryData`, RETURN snapshot for rollback — `inst-optimistic-apply`
5. [ ] - `p2` - TanStack Query invokes `mutationFn(variables)` which calls the service method (e.g., `service.post()`, `service.put()`, `service.delete()`) — `inst-mutation-service-call`
6. [ ] - `p2` - On success, IF `onSuccess` provided, execute it — typically calls `queryClient.invalidateQueries({ queryKey })` to refetch affected queries — `inst-mutation-on-success`
7. [ ] - `p2` - On error, IF `onError` provided, execute it — IF optimistic update was applied, rollback by restoring snapshot via `queryClient.setQueryData(queryKey, snapshot)` — `inst-mutation-on-error-rollback`
8. [ ] - `p2` - On settled (success or error), IF `onSettled` provided, execute it — typically used for final cleanup or unconditional invalidation — `inst-mutation-on-settled`

---

### Flow 5 — Cross-Feature Orchestration via Flux (Escape Hatch)

- [ ] `p2` - **ID**: `cpt-hai3-flow-request-lifecycle-flux-escape-hatch`

**Actors**: `cpt-hai3-actor-developer`, `cpt-hai3-actor-runtime`

1. [ ] - `p2` - Developer determines that a mutation must trigger effects across multiple screen-sets or update shared Redux state — `inst-identify-cross-feature`
2. [ ] - `p2` - Developer uses the existing Flux pattern: action → eventBus.emit → effect → service call → dispatch — `inst-use-flux`
3. [ ] - `p2` - Effect calls the service method directly (not through TanStack) — `inst-effect-service-call`
4. [ ] - `p2` - After effect completes, IF TanStack queries are active for the affected data, effect calls `queryClient.invalidateQueries({ queryKey })` to keep the query cache consistent — `inst-invalidate-after-flux`
5. [ ] - `p2` - RETURN: both Redux state and TanStack cache are synchronized — `inst-state-sync`

---

### Flow 4 — QueryClient Lifecycle in HAI3Provider

- [ ] `p2` - **ID**: `cpt-hai3-flow-request-lifecycle-query-client-lifecycle`

**Actors**: `cpt-hai3-actor-host-app`, `cpt-hai3-actor-runtime`

1. [ ] - `p2` - `HAI3Provider` creates a `QueryClient` instance with default options during mount — `inst-create-query-client`
2. [ ] - `p2` - `HAI3Provider` renders `QueryClientProvider` wrapping children, making the client available to all query hooks — `inst-render-query-provider`
3. [ ] - `p2` - IF MFE mode, MFEs inherit the host's `QueryClient` from `HAI3Provider` — shared cache across all MFEs, each using its own `apiRegistry` as `queryFn` — `inst-mfe-query-client`
4. [ ] - `p2` - On `HAI3Provider` unmount, `QueryClient` is cleared and garbage-collected — `inst-cleanup-query-client`

---

## 3. Processes / Business Logic (CDSL)

### Algorithm 1 — AbortSignal Threading in RestProtocol

- [ ] `p1` - **ID**: `cpt-hai3-algo-request-lifecycle-signal-threading`

1. [ ] - `p1` - Receive `signal` from caller via `RequestOptions` parameter — `inst-receive-signal`
2. [ ] - `p1` - Attach `signal` to `RestRequestContext` as a readonly optional property — `inst-attach-to-context`
3. [ ] - `p1` - Pass `RestRequestContext` through `executePluginOnRequest` chain (plugins can read `signal` but MUST NOT replace it) — `inst-plugin-passthrough`
4. [ ] - `p1` - Copy `signal` from context to `AxiosRequestConfig.signal` before HTTP execution — `inst-copy-to-axios`
5. [ ] - `p1` - IF `signal` is already aborted before Axios call, Axios throws synchronously — `inst-pre-aborted`
6. [ ] - `p1` - RETURN: Axios handles abort natively; no additional wiring needed — `inst-axios-native`

---

### Algorithm 2 — CanceledError Detection and Bypass

- [ ] `p1` - **ID**: `cpt-hai3-algo-request-lifecycle-cancel-detection`

1. [ ] - `p1` - In `requestInternal` catch block, check if error is an Axios `CanceledError` (via `axios.isCancel(error)`) — `inst-check-is-cancel`
2. [ ] - `p1` - IF `axios.isCancel(error)` is true, re-throw immediately without entering `executePluginOnError` — `inst-rethrow-cancel`
3. [ ] - `p1` - IF `axios.isCancel(error)` is false, proceed to `executePluginOnError` as before — `inst-normal-error-path`
4. [ ] - `p1` - RETURN: cancellation errors are never retried and never processed by plugins — `inst-no-retry-cancel`

---

### Algorithm 3 — RequestOptions Pattern for HTTP Methods

- [ ] `p1` - **ID**: `cpt-hai3-algo-request-lifecycle-request-options`

1. [ ] - `p1` - Define `RestRequestOptions` interface with optional `signal?: AbortSignal` and optional `params?: Record<string, string>` — `inst-define-options`
2. [ ] - `p1` - Update `get`, `post`, `put`, `patch`, `delete` method signatures to accept `RestRequestOptions` as final parameter — `inst-update-signatures`
3. [ ] - `p1` - Extract `signal` and `params` from options in each method, forward to `request()` — `inst-extract-options`
4. [ ] - `p1` - `request()` passes `signal` and `params` to `requestInternal()` — `inst-forward-to-internal`
5. [ ] - `p1` - RETURN: existing callers without options continue to work (options parameter is optional) — `inst-backward-compat`

---

### Algorithm 4 — QueryClient Default Configuration

- [ ] `p2` - **ID**: `cpt-hai3-algo-request-lifecycle-query-client-defaults`

1. [ ] - `p2` - Set `staleTime` to 30 seconds (avoid immediate refetch on re-mount) — `inst-stale-time`
2. [ ] - `p2` - Set `gcTime` to 5 minutes (garbage-collect unused cache entries) — `inst-gc-time`
3. [ ] - `p2` - Set `retry` to 0 (HAI3 has its own retry plugin system; avoid double retry) — `inst-no-retry`
4. [ ] - `p2` - Set `refetchOnWindowFocus` to `true` (refresh stale data on tab switch) — `inst-refetch-focus`
5. [ ] - `p2` - Allow overrides via `HAI3ProviderProps.queryClientConfig` — `inst-config-override`
6. [ ] - `p2` - RETURN configured `QueryClient` instance — `inst-return-client`

---

### Algorithm 5 — Optimistic Update with Rollback

- [ ] `p2` - **ID**: `cpt-hai3-algo-request-lifecycle-optimistic-update`

1. [ ] - `p2` - In `onMutate` callback, cancel any outgoing refetches for the affected query key via `queryClient.cancelQueries({ queryKey })` to prevent race conditions — `inst-cancel-refetches`
2. [ ] - `p2` - Snapshot the current cache value via `queryClient.getQueryData(queryKey)` — `inst-snapshot`
3. [ ] - `p2` - Apply the optimistic update via `queryClient.setQueryData(queryKey, optimisticData)` — `inst-apply-optimistic`
4. [ ] - `p2` - RETURN the snapshot as the `onMutate` return value (TanStack passes it to `onError` as `context`) — `inst-return-snapshot`
5. [ ] - `p2` - IF mutation fails, `onError` receives the snapshot via `context` and restores it via `queryClient.setQueryData(queryKey, context.snapshot)` — `inst-rollback`
6. [ ] - `p2` - In `onSettled`, call `queryClient.invalidateQueries({ queryKey })` to refetch the authoritative server state regardless of success or failure — `inst-refetch-authoritative`

---

### Algorithm 6 — Query Invalidation After Mutation

- [ ] `p2` - **ID**: `cpt-hai3-algo-request-lifecycle-query-invalidation`

1. [ ] - `p2` - In `onSuccess` or `onSettled` callback, determine which query keys are affected by the mutation — `inst-determine-keys`
2. [ ] - `p2` - Call `queryClient.invalidateQueries({ queryKey })` for each affected key — `inst-invalidate`
3. [ ] - `p2` - TanStack Query marks matched cached entries as stale — `inst-mark-stale`
4. [ ] - `p2` - IF any component is currently mounted and observing an invalidated key, TanStack Query triggers a background refetch automatically — `inst-auto-refetch`
5. [ ] - `p2` - IF no component is observing the key, the stale data remains in cache until next access or GC — `inst-lazy-refetch`

---

## 4. States (CDSL)

### State 1 — Query Lifecycle State

- [ ] `p2` - **ID**: `cpt-hai3-state-request-lifecycle-query`

**States**: IDLE, FETCHING, SUCCESS, ERROR, STALE

**Initial State**: IDLE

1. [ ] - `p2` - **FROM** IDLE **TO** FETCHING **WHEN** `useApiQuery` mounts and no cached data exists — `inst-initial-fetch`
2. [ ] - `p2` - **FROM** FETCHING **TO** SUCCESS **WHEN** `queryFn` resolves — `inst-fetch-success`
3. [ ] - `p2` - **FROM** FETCHING **TO** ERROR **WHEN** `queryFn` rejects — `inst-fetch-error`
4. [ ] - `p2` - **FROM** SUCCESS **TO** STALE **WHEN** `staleTime` elapses — `inst-become-stale`
5. [ ] - `p2` - **FROM** STALE **TO** FETCHING **WHEN** component re-mounts or window refocuses — `inst-refetch`
6. [ ] - `p2` - **FROM** ERROR **TO** FETCHING **WHEN** manual refetch triggered — `inst-retry-manual`
7. [ ] - `p2` - **FROM** any **TO** IDLE **WHEN** component unmounts and `gcTime` elapses — `inst-gc`

### State 2 — Mutation Lifecycle State

- [ ] `p2` - **ID**: `cpt-hai3-state-request-lifecycle-mutation`

**States**: IDLE, PENDING, SUCCESS, ERROR

**Initial State**: IDLE

1. [ ] - `p2` - **FROM** IDLE **TO** PENDING **WHEN** `mutate(variables)` is called — `inst-mutation-start`
2. [ ] - `p2` - **FROM** PENDING **TO** SUCCESS **WHEN** `mutationFn` resolves; `onSuccess` and `onSettled` callbacks fire — `inst-mutation-success`
3. [ ] - `p2` - **FROM** PENDING **TO** ERROR **WHEN** `mutationFn` rejects; `onError` and `onSettled` callbacks fire, optimistic rollback executes if applicable — `inst-mutation-error`
4. [ ] - `p2` - **FROM** SUCCESS **TO** IDLE **WHEN** `reset()` is called or component unmounts — `inst-mutation-reset-success`
5. [ ] - `p2` - **FROM** ERROR **TO** IDLE **WHEN** `reset()` is called or component unmounts — `inst-mutation-reset-error`
6. [ ] - `p2` - **FROM** ERROR **TO** PENDING **WHEN** `mutate(variables)` is called again (retry) — `inst-mutation-retry`

---

## 5. Definitions of Done

### DoD 1 — AbortSignal Support in RestProtocol

- [ ] `p1` - **ID**: `cpt-hai3-dod-request-lifecycle-abort-signal`

The system **MUST** support request cancellation via `AbortSignal` in `RestProtocol` without modifying the plugin chain contract.

**Implementation details**:

- Type: `RestRequestOptions` interface in `packages/api/src/types.ts` with `signal?: AbortSignal` and `params?: Record<string, string>`
- Type: Add `signal?: AbortSignal` to `RestRequestContext` interface
- Class: `RestProtocol` in `packages/api/src/protocols/RestProtocol.ts` — update HTTP method signatures to accept `RestRequestOptions`
- Method: `requestInternal` — pass `signal` to `AxiosRequestConfig.signal`
- Method: `requestInternal` catch block — detect `axios.isCancel(error)` and re-throw without plugin chain

**Implements**:
- `cpt-hai3-flow-request-lifecycle-rest-abort`
- `cpt-hai3-algo-request-lifecycle-signal-threading`
- `cpt-hai3-algo-request-lifecycle-cancel-detection`
- `cpt-hai3-algo-request-lifecycle-request-options`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-api-package`
- `cpt-hai3-fr-api-request-cancellation`

**Covers (DESIGN)**:
- `cpt-hai3-constraint-zero-cross-deps-at-l1`
- `cpt-hai3-constraint-no-react-below-l3`
- `cpt-hai3-component-api`

---

### DoD 2 — QueryClientProvider in HAI3Provider

- [ ] `p2` - **ID**: `cpt-hai3-dod-request-lifecycle-query-provider`

The system **MUST** create and provide a single `QueryClient` instance via `QueryClientProvider` inside `HAI3Provider`, shared across all MFEs.

**Implementation details**:

- Package: `@tanstack/react-query` added as peer dependency of `@hai3/react`
- Component: `HAI3Provider` in `packages/react/src/HAI3Provider.tsx` — wrap children with `QueryClientProvider`
- Component: `MfeProvider` in `packages/react/src/mfe/MfeProvider.tsx` — does NOT create its own `QueryClient`; MFEs inherit the host's client from `HAI3Provider`
- Config: Default `staleTime: 30_000`, `gcTime: 300_000`, `retry: 0`, `refetchOnWindowFocus: true`
- Props: `HAI3ProviderProps.queryClientConfig` for override

**Implements**:
- `cpt-hai3-flow-request-lifecycle-query-client-lifecycle`
- `cpt-hai3-algo-request-lifecycle-query-client-defaults`

**Covers (PRD)**:
- `cpt-hai3-fr-sdk-react-layer`
- `cpt-hai3-fr-react-query-client-isolation`

**Covers (DESIGN)**:
- `cpt-hai3-constraint-no-react-below-l3`
- `cpt-hai3-component-react`

---

### DoD 3 — useApiQuery Hook

- [ ] `p2` - **ID**: `cpt-hai3-dod-request-lifecycle-use-api-query`

The system **MUST** export a `useApiQuery` hook from `@hai3/react` that wraps `@tanstack/react-query`'s `useQuery` and automatically threads `AbortSignal` to the service call.

**Implementation details**:

- Hook: `useApiQuery` in `packages/react/src/hooks/useApiQuery.ts`
- Signature: accepts `UseApiQueryOptions<TData>` extending TanStack's `UseQueryOptions` with `queryFn` receiving `{ signal }`
- Re-exports TanStack's `queryOptions` helper for defining reusable query factories
- Returns the standard TanStack `UseQueryResult<TData>`

**Implements**:
- `cpt-hai3-flow-request-lifecycle-use-api-query`

**Covers (PRD)**:
- `cpt-hai3-fr-react-query-hooks`

**Covers (DESIGN)**:
- `cpt-hai3-constraint-no-react-below-l3`
- `cpt-hai3-component-react`

---

### DoD 4 — useApiMutation Hook

- [ ] `p2` - **ID**: `cpt-hai3-dod-request-lifecycle-use-api-mutation`

The system **MUST** export a `useApiMutation` hook from `@hai3/react` that wraps `@tanstack/react-query`'s `useMutation` as the default mechanism for all write operations, with support for optimistic updates, rollback, and cache invalidation.

**Implementation details**:

- Hook: `useApiMutation` in `packages/react/src/hooks/useApiMutation.ts`
- Signature: accepts `UseApiMutationOptions<TData, TVariables>` extending TanStack's `UseMutationOptions` with `onMutate`, `onSuccess`, `onError`, `onSettled` callbacks
- Returns the standard TanStack `UseMutationResult<TData, Error, TVariables>` including `mutate`, `mutateAsync`, `isPending`, `error`, `data`, `reset`
- Provides access to `queryClient` via `useQueryClient()` for cache invalidation and optimistic updates within callbacks

**Implements**:
- `cpt-hai3-flow-request-lifecycle-use-api-mutation`
- `cpt-hai3-algo-request-lifecycle-optimistic-update`
- `cpt-hai3-algo-request-lifecycle-query-invalidation`

**Covers (PRD)**:
- `cpt-hai3-fr-react-query-hooks`

**Covers (DESIGN)**:
- `cpt-hai3-constraint-no-react-below-l3`
- `cpt-hai3-component-react`

---

## 6. Acceptance Criteria

- [ ] `RestProtocol.get('/url', { signal })` cancels the in-flight request when `controller.abort()` is called; Axios throws `CanceledError`
- [ ] Canceled requests do NOT enter the `onError` plugin chain and are NOT retried
- [ ] Existing callers without `signal` option continue to work unchanged (backward compatible)
- [ ] `HAI3Provider` renders `QueryClientProvider` with default configuration
- [ ] All MFEs share the host's `QueryClient` — overlapping query keys are deduplicated across MFE boundaries
- [ ] `useApiQuery` returns `{ data, isLoading, error }` and automatically cancels on unmount
- [ ] Two components with the same `queryKey` result in a single HTTP request (deduplication)
- [ ] Stale data is returned immediately on re-mount, with background refetch
- [ ] `useApiMutation` supports the full callback lifecycle: `onMutate` (optimistic), `onSuccess`, `onError` (rollback), `onSettled`
- [ ] Optimistic updates apply immediately via `queryClient.setQueryData` and rollback on error using the snapshot from `onMutate`
- [ ] `queryClient.invalidateQueries({ queryKey })` triggers background refetch for mounted observers
- [ ] Cross-feature mutations use the Flux pattern with `queryClient.invalidateQueries` to keep TanStack cache consistent
- [ ] Mock mode continues to work: `RestMockPlugin` short-circuits regardless of `signal` presence
- [ ] `@hai3/api` remains at zero `@hai3/*` dependencies (AbortSignal is a browser API)
- [ ] `@tanstack/react-query` is a peer dependency of `@hai3/react`, not bundled

---

## Additional Context

### TanStack Query Retry Disabled by Default

TanStack Query's built-in retry is set to 0 because HAI3 already provides retry via the `onError` plugin chain with `ApiPluginErrorContext.retry()`. Enabling both would cause double retries — the plugin retries the Axios call, and TanStack retries the entire `queryFn`. Consumers can re-enable TanStack retry per-query if they opt out of plugin-level retry.

### Event-Driven Pattern Coexistence

TanStack Query is the default mechanism for both **reads** (`useApiQuery`) and **writes** (`useApiMutation`) at the component level. This covers the vast majority of screen-set data operations: fetching lists, submitting forms, updating records, deleting items — all with automatic loading/error states, caching, and optimistic updates.

The existing event-driven Flux pattern (action → event → effect → reducer) is reserved as an **escape hatch for cross-feature orchestration** — cases where a mutation in one screen-set must trigger effects in another screen-set or update shared Redux state that multiple unrelated features observe. When using Flux for a mutation that affects data also tracked by TanStack queries, the effect must call `queryClient.invalidateQueries()` after completing to keep the query cache consistent.

**Decision rule**: If the mutation's effects are local to the component or screen-set, use `useApiMutation`. If the mutation must coordinate across feature boundaries via eventBus, use the Flux pattern.

### AbortSignal in Short-Circuit Path

When a mock plugin short-circuits a request, the `AbortSignal` is ignored because no HTTP call is made. This is correct behavior — there is nothing to abort. The short-circuit response is returned synchronously to the plugin chain.

### Shared QueryClient Across MFEs

All MFEs share the host's `QueryClient` from `HAI3Provider`. Cache is keyed by query key and is decoupled from which service instance fetches the data. When two MFEs use the same query key (e.g., `['accounts', 'current-user']`), only one HTTP request fires — the second MFE receives the cached result. Each MFE still uses its own `apiRegistry` and service instances in `queryFn`. This is safe because all MFEs share the same auth and base URL for overlapping endpoints. `MfeProvider` does not create its own `QueryClient`.
