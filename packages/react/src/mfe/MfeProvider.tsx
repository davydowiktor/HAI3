/**
 * MFE Provider - Provides MFE context to child components
 *
 * Wraps MFE components with bridge and metadata.
 * Used by the MFE mounting system.
 *
 * MFEs inherit the host's QueryClient from HAI3Provider so that overlapping
 * queries (same query key) are deduplicated and cached once across MFE
 * boundaries. Each MFE still uses its own apiRegistry and service instances
 * in queryFn — the shared cache works because all MFEs share the same auth
 * and base URL for overlapping endpoints.
 *
 * React Layer: L3 (Depends on @hai3/framework)
 */
// @cpt-flow:cpt-hai3-flow-react-bindings-mfe-provider:p1
// @cpt-dod:cpt-hai3-dod-react-bindings-mfe-hooks:p1
// @cpt-flow:cpt-hai3-flow-request-lifecycle-query-client-lifecycle:p2

import React from 'react';
import { MfeContext, type MfeContextValue } from './MfeContext';

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
  // MFEs inherit the host's QueryClient from HAI3Provider — no per-MFE
  // QueryClient is created. Cache is shared across all MFEs by query key.
  return (
    <MfeContext.Provider value={value}>
      {children}
    </MfeContext.Provider>
  );
};
// @cpt-end:cpt-hai3-flow-react-bindings-mfe-provider:p1:inst-render-mfe-provider
// @cpt-end:cpt-hai3-flow-react-bindings-mfe-provider:p1:inst-set-mfe-context
// @cpt-end:cpt-hai3-dod-react-bindings-mfe-hooks:p1:inst-render-mfe-provider
// @cpt-end:cpt-hai3-flow-request-lifecycle-query-client-lifecycle:p2:inst-mfe-query-client
