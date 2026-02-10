/**
 * useSharedProperty Hook - Shared property subscription
 *
 * Subscribes to shared property updates from the host.
 *
 * React Layer: L3
 */

import { useSyncExternalStore, useCallback } from 'react';
import { useMfeContext } from '../MfeContext';

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for subscribing to a shared property.
 *
 * Subscribes to property updates from the host and returns the current value.
 * Must be used within a MfeProvider (i.e., inside an MFE component).
 *
 * NOTE: This hook provides the interface and uses useSyncExternalStore with a stub subscription.
 * Full bridge subscription should be implemented when bridge methods are available.
 *
 * @param _propertyTypeId - Type ID of the shared property to subscribe to (currently unused)
 * @returns Current property value
 *
 * @example
 * ```tsx
 * function MyMfeComponent() {
 *   const userData = useSharedProperty('gts.hai3.mfes.comm.shared_property.v1~myapp.user_data.v1');
 *
 *   return <div>User: {userData?.name}</div>;
 * }
 * ```
 */
export function useSharedProperty<T = unknown>(propertyTypeId: string): T | undefined {
  // Enforce MfeProvider context requirement
  const { bridge } = useMfeContext(); // Throws if not in MfeProvider

  // Subscribe to property updates via bridge
  const subscribe = useCallback((callback: () => void) => {
    return bridge.subscribeToProperty(propertyTypeId, () => {
      // When property changes, trigger React re-render
      callback();
    });
  }, [bridge, propertyTypeId]);

  const getSnapshot = useCallback(() => {
    const property = bridge.getProperty(propertyTypeId);
    // Type narrowing: caller specifies expected type T (standard React hook pattern)
    // Similar to useState<T>, useContext<T> - type safety is caller's responsibility
    return property?.value as T | undefined;
  }, [bridge, propertyTypeId]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return value;
}
