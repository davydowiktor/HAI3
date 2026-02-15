/**
 * useNavigation Hook - Navigation utilities
 *
 * React Layer: L3
 */

import { useCallback } from 'react';
import { useHAI3 } from '../HAI3Context';
import { useAppSelector } from './useAppSelector';
import type { UseNavigationReturn } from '../types';

/**
 * Hook for navigation utilities.
 *
 * @returns Navigation utilities
 *
 * @example
 * ```tsx
 * const { navigateToScreen, navigateToScreenset, currentScreen } = useNavigation();
 *
 * // Navigate to a simple screen
 * return (
 *   <button onClick={() => navigateToScreen('demo', 'home')}>
 *     Go to Home
 *   </button>
 * );
 *
 * // Navigate to a parameterized screen
 * return (
 *   <button onClick={() => navigateToScreen('demo', 'user-detail', { id: '123' })}>
 *     View User 123
 *   </button>
 * );
 * ```
 */
export function useNavigation(): UseNavigationReturn {
  const app = useHAI3();
  // Access state directly via useAppSelector - no selectors needed
  // Layout slices use flat keys like 'layout/screen', not nested 'layout.screen'
  const currentScreen = useAppSelector(
    (state) => {
      // Try flat key first (current SDK architecture)
      const flatKey = state as Record<string, { activeScreen?: string | null }>;
      if (flatKey['layout/screen']) {
        return flatKey['layout/screen'].activeScreen ?? null;
      }
      // Fallback to nested structure (for backward compatibility)
      const nested = state as Record<string, unknown>;
      if (nested.layout && typeof nested.layout === 'object' && nested.layout !== null) {
        const layoutState = nested.layout as Record<string, unknown>;
        if (layoutState.screen && typeof layoutState.screen === 'object' && layoutState.screen !== null) {
          const screenState = layoutState.screen as { activeScreen?: string | null };
          return screenState.activeScreen ?? null;
        }
      }
      return null;
    }
  );

  // Navigate to a specific screen, optionally with route params
  const navigateToScreen = useCallback(
    (screensetId: string, screenId: string, params?: Record<string, string>) => {
      if (app.actions.navigateToScreen) {
        app.actions.navigateToScreen({ screensetId, screenId, params });
      }
    },
    [app.actions]
  );

  // Navigate to a screenset (uses default screen)
  const navigateToScreenset = useCallback(
    (screensetId: string) => {
      if (app.actions.navigateToScreenset) {
        app.actions.navigateToScreenset({ screensetId });
      }
    },
    [app.actions]
  );

  /**
   * Derived state: screenset looked up from currentScreen via routeRegistry.
   * Single source of truth (Redux), automatic reactivity.
   */
  const currentScreenset = currentScreen
    ? app.routeRegistry?.getScreensetForScreen(currentScreen) ?? null
    : null;

  return {
    navigateToScreen,
    navigateToScreenset,
    currentScreenset,
    currentScreen,
  };
}
