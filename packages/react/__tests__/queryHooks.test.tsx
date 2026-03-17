/**
 * Integration tests for TanStack Query hooks in @hai3/react - Phase 2
 *
 * Covers:
 *   - useApiQuery: data, loading, and error states
 *   - useApiMutation: mutationFn invocation and onSuccess callback
 *   - QueryClientProvider availability inside HAI3Provider
 *   - Per-MFE QueryClient cache isolation via MfeProvider
 *
 * @packageDocumentation
 * @vitest-environment jsdom
 */

// @cpt-FEATURE:cpt-hai3-dod-request-lifecycle-use-api-query:p2
// @cpt-FEATURE:cpt-hai3-dod-request-lifecycle-use-api-mutation:p2
// @cpt-FEATURE:cpt-hai3-dod-request-lifecycle-query-provider:p2

import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiQuery } from '../src/hooks/useApiQuery';
import { useApiMutation } from '../src/hooks/useApiMutation';
import { MfeProvider } from '../src/mfe/MfeProvider';
import { HAI3Provider } from '../src/HAI3Provider';
import type { MfeContextValue } from '../src/mfe/MfeContext';
import type { ChildMfeBridge } from '@hai3/framework';

// ============================================================================
// Shared test helpers
// ============================================================================

/**
 * Build a fresh QueryClient with settings that prevent test interference:
 *   retry: 0  — avoids slow retry backoffs on intentional failures
 *   gcTime: 0 — drops cache entries immediately after a query becomes inactive
 */
function buildTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 0, gcTime: 0 },
      mutations: { retry: 0 },
    },
  });
}

/**
 * React wrapper that provides an isolated QueryClient for each test.
 * Re-created per test via the factory pattern to avoid shared state.
 */
function makeQueryWrapper(client: QueryClient) {
  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

// ============================================================================
// useApiQuery
// ============================================================================

describe('useApiQuery', () => {
  // @cpt-begin:cpt-hai3-dod-request-lifecycle-use-api-query:p2:inst-test-data
  it('returns data from a successful queryFn', async () => {
    const client = buildTestQueryClient();
    const wrapper = makeQueryWrapper(client);

    const { result } = renderHook(
      () =>
        useApiQuery<{ id: number }>({
          queryKey: ['item', 1],
          queryFn: () => Promise.resolve({ id: 1 }),
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: 1 });
  });
  // @cpt-end:cpt-hai3-dod-request-lifecycle-use-api-query:p2:inst-test-data

  // @cpt-begin:cpt-hai3-dod-request-lifecycle-use-api-query:p2:inst-test-loading
  it('reports isLoading true before the queryFn resolves', () => {
    const client = buildTestQueryClient();
    const wrapper = makeQueryWrapper(client);

    // A promise that never settles keeps the hook in loading state.
    const { result } = renderHook(
      () =>
        useApiQuery<string>({
          queryKey: ['slow'],
          queryFn: () => new Promise(() => undefined),
        }),
      { wrapper }
    );

    // isLoading is true before any response arrives.
    expect(result.current.isLoading).toBe(true);
  });
  // @cpt-end:cpt-hai3-dod-request-lifecycle-use-api-query:p2:inst-test-loading

  // @cpt-begin:cpt-hai3-dod-request-lifecycle-use-api-query:p2:inst-test-error
  it('reports isError true and exposes error when queryFn rejects', async () => {
    const client = buildTestQueryClient();
    const wrapper = makeQueryWrapper(client);

    const boom = new Error('network failure');

    const { result } = renderHook(
      () =>
        useApiQuery<never, Error>({
          queryKey: ['bad'],
          queryFn: () => Promise.reject(boom),
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(boom);
  });
  // @cpt-end:cpt-hai3-dod-request-lifecycle-use-api-query:p2:inst-test-error
});

// ============================================================================
// useApiMutation
// ============================================================================

describe('useApiMutation', () => {
  // @cpt-begin:cpt-hai3-dod-request-lifecycle-use-api-mutation:p2:inst-test-calls-fn
  it('calls mutationFn with the variables passed to mutate()', async () => {
    const client = buildTestQueryClient();
    const wrapper = makeQueryWrapper(client);

    const mutationFn = vi.fn(async (vars: { name: string }) => vars.name);

    const { result } = renderHook(
      () => useApiMutation<string, Error, { name: string }>({ mutationFn }),
      { wrapper }
    );

    result.current.mutate({ name: 'test' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mutationFn).toHaveBeenCalledOnce();
    // TanStack Query v5 passes (variables, mutationContext) to mutationFn
    expect(mutationFn).toHaveBeenCalledWith({ name: 'test' }, expect.anything());
  });
  // @cpt-end:cpt-hai3-dod-request-lifecycle-use-api-mutation:p2:inst-test-calls-fn

  // @cpt-begin:cpt-hai3-dod-request-lifecycle-use-api-mutation:p2:inst-test-on-success
  it('calls onSuccess callback with the mutation result', async () => {
    const client = buildTestQueryClient();
    const wrapper = makeQueryWrapper(client);

    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useApiMutation<string, Error, string>({
          mutationFn: async (value) => value.toUpperCase(),
          onSuccess,
        }),
      { wrapper }
    );

    result.current.mutate('hello');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
    // TanStack Query v5 calls onSuccess(data, variables, context, mutationMeta)
    expect(onSuccess).toHaveBeenCalledWith('HELLO', 'hello', undefined, expect.anything());
  });
  // @cpt-end:cpt-hai3-dod-request-lifecycle-use-api-mutation:p2:inst-test-on-success
});

// ============================================================================
// QueryClientProvider inside HAI3Provider
// ============================================================================

describe('HAI3Provider provides QueryClient to descendants', () => {
  // Track app instances so we can call destroy() in afterEach.
  // HAI3Provider creates a HAI3App internally; we let it manage its lifecycle
  // but skip providing one so we exercise the default code path.
  afterEach(() => {
    // Nothing to clean up — each renderHook unmounts automatically.
  });

  // @cpt-begin:cpt-hai3-dod-request-lifecycle-query-provider:p2:inst-test-hai3-provider
  it('useApiQuery resolves inside HAI3Provider without a standalone QueryClientProvider', async () => {
    // HAI3Provider internally wraps children with QueryClientProvider.
    // If the query works, the provider wiring is correct.
    function Wrapper({ children }: { children: React.ReactNode }) {
      return <HAI3Provider>{children}</HAI3Provider>;
    }

    const { result } = renderHook(
      () =>
        useApiQuery<number>({
          queryKey: ['answer'],
          queryFn: () => Promise.resolve(42),
        }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(42);
  });
  // @cpt-end:cpt-hai3-dod-request-lifecycle-query-provider:p2:inst-test-hai3-provider
});

// ============================================================================
// Per-MFE QueryClient isolation
// ============================================================================

describe('MfeProvider provides isolated QueryClient per MFE', () => {
  // Minimal bridge stub — only the fields that MfeContext types require.
  function makeMockBridge(): ChildMfeBridge {
    return {
      domainId: 'gts.hai3.mfes.ext.domain.v1~test.isolation.v1',
      instanceId: 'isolation-test',
      executeActionsChain: vi.fn().mockResolvedValue(undefined),
      subscribeToProperty: vi.fn().mockReturnValue(() => undefined),
      getProperty: vi.fn().mockReturnValue(undefined),
    };
  }

  function makeContextValue(id: string): MfeContextValue {
    return {
      bridge: makeMockBridge(),
      extensionId: id,
      domainId: 'gts.hai3.mfes.ext.domain.v1~test.isolation.v1',
    };
  }

  // @cpt-begin:cpt-hai3-flow-request-lifecycle-query-client-lifecycle:p2:inst-test-mfe-isolation
  it('two MfeProviders with the same queryKey return independent cached values', async () => {
    // MfeProvider wraps children in its own QueryClientProvider, so each
    // MFE tree has a private cache. Both hooks use the same queryKey but
    // different queryFns — isolation means they never share a result.

    function makeMfeWrapper(contextValue: MfeContextValue) {
      return function MfeWrapper({ children }: { children: React.ReactNode }) {
        return <MfeProvider value={contextValue}>{children}</MfeProvider>;
      };
    }

    const mfe1Value = makeContextValue('mfe-alpha');
    const mfe2Value = makeContextValue('mfe-beta');

    const { result: result1 } = renderHook(
      () =>
        useApiQuery<string>({
          queryKey: ['shared-key'],
          queryFn: () => Promise.resolve('data-from-mfe-alpha'),
        }),
      { wrapper: makeMfeWrapper(mfe1Value) }
    );

    const { result: result2 } = renderHook(
      () =>
        useApiQuery<string>({
          queryKey: ['shared-key'],
          queryFn: () => Promise.resolve('data-from-mfe-beta'),
        }),
      { wrapper: makeMfeWrapper(mfe2Value) }
    );

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    // Each MFE got the result of its own queryFn — caches are not shared.
    expect(result1.current.data).toBe('data-from-mfe-alpha');
    expect(result2.current.data).toBe('data-from-mfe-beta');
  });
  // @cpt-end:cpt-hai3-flow-request-lifecycle-query-client-lifecycle:p2:inst-test-mfe-isolation
});
