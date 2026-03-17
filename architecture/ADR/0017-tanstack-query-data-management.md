---
status: proposed
date: 2026-03-17
---

# Adopt TanStack Query for Declarative Data Management at L3


<!-- toc -->

- [Context and Problem Statement](#context-and-problem-statement)
- [Decision Drivers](#decision-drivers)
- [Considered Options](#considered-options)
- [Decision Outcome](#decision-outcome)
  - [Consequences](#consequences)
  - [Confirmation](#confirmation)
- [Pros and Cons of the Options](#pros-and-cons-of-the-options)
  - [Adopt @tanstack/react-query at L3](#adopt-tanstackreact-query-at-l3)
  - [Build a custom query/cache layer inside @hai3/react](#build-a-custom-querycache-layer-inside-hai3react)
  - [Keep Flux-only pattern with CLI boilerplate generators](#keep-flux-only-pattern-with-cli-boilerplate-generators)
- [More Information](#more-information)
- [Traceability](#traceability)

<!-- /toc -->

**ID**: `cpt-hai3-adr-tanstack-query-data-management`

## Context and Problem Statement

Screen-set authors must write five files (action, event declaration, effect, Redux slice, component selector) for every API endpoint they consume. Each slice manually tracks `loading`, `error`, and `data` state. There is no request deduplication — if five components need the same user profile, five identical HTTP requests fire. There is no caching — navigating away and back triggers a full refetch. There is no built-in mechanism for optimistic updates or cache invalidation after mutations.

These are solved problems in the React ecosystem. The question is whether to build a custom solution inside HAI3 or adopt an established library at the React layer (L3).

## Decision Drivers

* Eliminate per-endpoint boilerplate (action → event → effect → slice) for both reads and writes
* Provide request deduplication, caching, and stale-while-revalidate out of the box
* Support optimistic updates with rollback for mutations
* Preserve the existing plugin chain, mock mode, and service registry at L1
* Respect the layer hierarchy: no new dependencies below L3
* Minimize bundle size impact for MFE isolation (each MFE bundles its own dependencies)
* Maintain the event-driven Flux pattern as an escape hatch for cross-feature orchestration

## Considered Options

* Adopt `@tanstack/react-query` at L3 as the default for reads and writes
* Build a custom query/cache layer inside `@hai3/react`
* Keep the current Flux-only pattern and add per-feature boilerplate generators via CLI

## Decision Outcome

Chosen option: **Adopt `@tanstack/react-query` at L3**, because it provides caching, deduplication, optimistic updates, and cache invalidation with zero runtime dependencies in its core package, sits cleanly at the React layer without violating the L1/L2 boundary, and avoids rebuilding ~500 lines of battle-tested, race-condition-sensitive code (cache GC, structural sharing, stale tracking, subscriber lifecycle).

The existing Flux pattern (action → event → effect → reducer) is retained as an escape hatch for cross-feature orchestration — mutations that must trigger effects across multiple screen-sets or update shared Redux state. For all other reads and writes, TanStack Query hooks are the default.

### Consequences

* Good, because per-endpoint boilerplate drops from 5 files to a single `useApiQuery` or `useApiMutation` call with automatic loading/error/data states
* Good, because request deduplication and stale-while-revalidate caching are automatic with no custom code
* Good, because optimistic updates and rollback are supported via the `onMutate`/`onError` callback pattern
* Good, because `@tanstack/query-core` has zero runtime dependencies and ~12kB gzipped bundle size
* Bad, because two data-fetching patterns coexist (TanStack hooks for component-level operations, Flux for cross-feature orchestration), requiring a clear decision rule for authors
* Bad, because each MFE needs its own `QueryClient` instance for isolation, adding ~12kB per MFE bundle
* Bad, because TanStack Query's built-in retry must be disabled (set to 0) to avoid double-retry with the existing `onError` plugin chain

### Confirmation

Confirmed when:

* `@tanstack/react-query` is declared as a peer dependency of `@hai3/react` (not bundled)
* `HAI3Provider` renders `QueryClientProvider` with `retry: 0` and configurable `staleTime`/`gcTime`
* `MfeProvider` creates an isolated `QueryClient` per MFE
* `useApiQuery` and `useApiMutation` hooks are exported from `@hai3/react`
* The demo MFE (`src/mfe_packages/demo-mfe`) is migrated from the Flux pattern to TanStack Query hooks, demonstrating both reads and mutations with cache invalidation

## Pros and Cons of the Options

### Adopt @tanstack/react-query at L3

`@tanstack/react-query` (v5) wraps `@tanstack/query-core` (zero dependencies, framework-agnostic) with React hooks. It manages server state: fetching, caching, deduplication, background refetch, optimistic updates, and cache invalidation. Existing `BaseApiService` methods are passed as `queryFn` / `mutationFn` with no changes to the service layer.

* Good, because battle-tested for 5+ years across thousands of production React applications
* Good, because zero runtime dependencies in `@tanstack/query-core`; ~13kB gzipped total for `@tanstack/react-query`
* Good, because `queryFn` accepts any `() => Promise<T>`, wrapping existing service methods with no adapter code
* Good, because `AbortSignal` is automatically created per query and passed to `queryFn` for cancellation on unmount
* Good, because structural sharing preserves referential equality for unchanged data, reducing unnecessary React re-renders
* Bad, because it introduces a new peer dependency that all MFE consumers must install
* Bad, because developers must learn TanStack Query's mental model (query keys, stale time, invalidation)

### Build a custom query/cache layer inside @hai3/react

Build custom `useApiQuery` and `useApiMutation` hooks with an in-memory cache, stale tracking, GC timer, deduplication map, and optimistic update/rollback mechanism.

* Good, because no external dependency; full control over implementation
* Good, because API can be tailored exactly to HAI3's patterns
* Bad, because caching + deduplication + GC + stale tracking + optimistic rollback is ~500-600 lines of race-condition-sensitive code
* Bad, because the resulting code would be functionally equivalent to TanStack Query but without 5 years of battle-testing
* Bad, because ongoing maintenance burden for edge cases (stale closures, concurrent mutations, GC timing, structural sharing)

### Keep Flux-only pattern with CLI boilerplate generators

Enhance the `@hai3/cli` to generate action, event, effect, and slice files for each new API endpoint, reducing manual effort while keeping the Flux architecture.

* Good, because no new dependencies; existing architecture preserved
* Good, because CLI generation reduces typing effort
* Bad, because generated boilerplate still exists in the codebase and must be maintained per endpoint
* Bad, because no caching, deduplication, or optimistic updates — each navigation refetches all data
* Bad, because loading/error state management remains manual in every slice

## More Information

* TanStack Query documentation: https://tanstack.com/query/latest
* `@tanstack/query-core` is framework-agnostic with zero dependencies; `@tanstack/react-query` adds React hooks on top
* TanStack Query's retry is disabled (`retry: 0`) because HAI3's `onError` plugin chain already provides retry with `ApiPluginErrorContext.retry()` — enabling both would cause double retries

## Traceability

- **PRD**: [PRD.md](../PRD.md)
- **DESIGN**: [DESIGN.md](../DESIGN.md)

This decision directly addresses:

* `cpt-hai3-fr-sdk-api-package` — API service layer remains unchanged; TanStack wraps existing services
* `cpt-hai3-fr-sdk-react-layer` — New hooks added to React layer public API surface
* `cpt-hai3-nfr-compat-react` — TanStack Query v5 requires React 18+; HAI3 uses React 19
* `cpt-hai3-constraint-no-react-below-l3` — TanStack Query is confined to L3 (`@hai3/react`); L1 and L2 are unaffected
* `cpt-hai3-constraint-zero-cross-deps-at-l1` — `@hai3/api` gains no new dependencies (AbortSignal is a browser API)
* `cpt-hai3-component-react` — `@hai3/react` package scope for new hooks and provider integration
* `cpt-hai3-component-api` — `@hai3/api` package scope for AbortSignal threading (prerequisite, not part of this ADR)
