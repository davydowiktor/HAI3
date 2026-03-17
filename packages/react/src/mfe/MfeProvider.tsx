/**
 * MFE Provider - Provides MFE context to child components
 *
 * Wraps MFE components with bridge and metadata.
 * Used by the MFE mounting system.
 *
 * Each MFE gets its own QueryClient so cache key collisions between independently
 * developed micro-frontends are impossible. This mirrors the per-MFE Redux namespace
 * isolation pattern already in use.
 *
 * React Layer: L3 (Depends on @hai3/framework)
 */
// @cpt-flow:cpt-hai3-flow-react-bindings-mfe-provider:p1
// @cpt-dod:cpt-hai3-dod-react-bindings-mfe-hooks:p1
// @cpt-flow:cpt-hai3-flow-request-lifecycle-query-client-lifecycle:p2
// @cpt-algo:cpt-hai3-algo-request-lifecycle-query-client-defaults:p2

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MfeContext, type MfeContextValue } from './MfeContext';

// @cpt-begin:cpt-hai3-algo-request-lifecycle-query-client-defaults:p2:inst-mfe-build-defaults
/**
 * Creates a per-MFE QueryClient with the same HAI3 defaults as HAI3Provider.
 * Defined here to keep MfeProvider self-contained without coupling to HAI3Provider internals.
 */
function buildMfeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 300_000,
        retry: 0,
        refetchOnWindowFocus: true,
      },
    },
  });
}
// @cpt-end:cpt-hai3-algo-request-lifecycle-query-client-defaults:p2:inst-mfe-build-defaults

// ============================================================================
// Provider Props
// ============================================================================

/**
 * MFE Provider Props
 */
export interface MfeProviderProps {
  /** MFE context value */
  value: MfeContextValue;
  /** Child components */
  children: React.ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * MFE Provider Component
 *
 * Provides MFE bridge and metadata to child components.
 * Used by the MFE mounting system to wrap MFE components.
 *
 * @example
 * ```tsx
 * <MfeProvider value={{ bridge, extensionId, domainId }}>
 *   <MyMfeComponent />
 * </MfeProvider>
 * ```
 */
// @cpt-begin:cpt-hai3-flow-react-bindings-mfe-provider:p1:inst-render-mfe-provider
// @cpt-begin:cpt-hai3-flow-react-bindings-mfe-provider:p1:inst-set-mfe-context
// @cpt-begin:cpt-hai3-dod-react-bindings-mfe-hooks:p1:inst-render-mfe-provider
// @cpt-begin:cpt-hai3-flow-request-lifecycle-query-client-lifecycle:p2:inst-mfe-query-client
export const MfeProvider: React.FC<MfeProviderProps> = ({ value, children }) => {
  // One QueryClient per MFE mount — prevents cross-MFE cache key collisions.
  const [queryClient] = useState(buildMfeQueryClient);

  return (
    <MfeContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </MfeContext.Provider>
  );
};
// @cpt-end:cpt-hai3-flow-react-bindings-mfe-provider:p1:inst-render-mfe-provider
// @cpt-end:cpt-hai3-flow-react-bindings-mfe-provider:p1:inst-set-mfe-context
// @cpt-end:cpt-hai3-dod-react-bindings-mfe-hooks:p1:inst-render-mfe-provider
// @cpt-end:cpt-hai3-flow-request-lifecycle-query-client-lifecycle:p2:inst-mfe-query-client
