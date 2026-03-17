/**
 * useApiMutation - Declarative mutation hook
 *
 * Wraps @tanstack/react-query's useMutation for use with HAI3 API services.
 * Supports optimistic updates, rollback, and cache invalidation.
 *
 * Optimistic update pattern:
 *   onMutate  -> snapshot cache, apply optimistic data
 *   onError   -> restore snapshot via context
 *   onSettled -> invalidate to refetch authoritative state
 *
 * Re-exports useQueryClient so callers can access the client for
 * invalidation and cache reads without a separate import path.
 */
// @cpt-dod:cpt-hai3-dod-request-lifecycle-use-api-mutation:p2
// @cpt-flow:cpt-hai3-flow-request-lifecycle-use-api-mutation:p2
// @cpt-algo:cpt-hai3-algo-request-lifecycle-optimistic-update:p2
// @cpt-algo:cpt-hai3-algo-request-lifecycle-query-invalidation:p2

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

export { useQueryClient };

// @cpt-begin:cpt-hai3-dod-request-lifecycle-use-api-mutation:p2:inst-type-alias
export type UseApiMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext>;
// @cpt-end:cpt-hai3-dod-request-lifecycle-use-api-mutation:p2:inst-type-alias

// @cpt-begin:cpt-hai3-flow-request-lifecycle-use-api-mutation:p2:inst-delegate-use-mutation
export function useApiMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseApiMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation<TData, TError, TVariables, TContext>(options);
}
// @cpt-end:cpt-hai3-flow-request-lifecycle-use-api-mutation:p2:inst-delegate-use-mutation
