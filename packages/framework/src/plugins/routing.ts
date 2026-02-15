/**
 * Routing Plugin - Provides route registry auto-synced from screensets
 *
 * Framework Layer: L2
 */

import type { HAI3Plugin, RouteRegistry } from '../types';
import { createRouteRegistry } from '../registries/routeRegistry';

// Legacy types (inline definitions - must match routeRegistry.ts types)
type ScreenLoader = () => Promise<{ default: React.ComponentType }>;

interface MenuScreenItem {
  menuItem: {
    id: string;
    label: string;
    icon?: string;
    path?: string;
  };
  screen: ScreenLoader;
}

interface ScreensetDefinition {
  id: string;
  menu: MenuScreenItem[];
}

interface ScreensetRegistry {
  get(id: string): ScreensetDefinition | undefined;
  getAll(): ScreensetDefinition[];
}

/**
 * Routing plugin factory.
 *
 * @returns Routing plugin
 *
 * @example
 * ```typescript
 * const app = createHAI3()
 *   .use(screensets())
 *   .use(routing())
 *   .build();
 *
 * // Check if a screen exists
 * const exists = app.routeRegistry.hasScreen('demo', 'home');
 * ```
 */
export function routing(): HAI3Plugin {
  return {
    name: 'routing',
    dependencies: ['screensets'],

    onRegister(_app) {
      // Route registry is created lazily during build
      // because it needs access to the screenset registry
    },

    onInit(app) {
      // Check if screensetRegistry exists (legacy mode)
      const screensetRegistry = 'screensetRegistry' in app
        ? (app as { screensetRegistry: ScreensetRegistry }).screensetRegistry
        : undefined;

      if (!screensetRegistry) {
        // MFE mode - no route registry in MFE mode (routing handled by actions chains)
        return;
      }

      // Create route registry from screenset registry
      const routeRegistry = createRouteRegistry(screensetRegistry);

      // Attach to app (overwriting the placeholder)
      (app as { routeRegistry: RouteRegistry }).routeRegistry = routeRegistry;
    },
  };
}
