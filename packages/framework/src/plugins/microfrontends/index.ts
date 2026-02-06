/**
 * Microfrontends Plugin
 *
 * Enables MFE capabilities in HAI3 applications.
 * This plugin accepts NO configuration parameters.
 * All MFE registration happens dynamically at runtime.
 *
 * @packageDocumentation
 */

import type { HAI3Plugin, HAI3App } from '../../types';

/**
 * Microfrontends plugin factory.
 *
 * Enables MFE capabilities in HAI3 applications with NO static configuration.
 * All MFE registration (domains, extensions, entries) happens dynamically at
 * runtime via actions or direct API calls.
 *
 * **Key Principles:**
 * - NO configuration parameters - plugin accepts nothing
 * - NO static domain registration - domains are registered at runtime
 * - Obtains screensetsRegistry from framework after it's initialized
 *
 * @throws Error if any configuration is passed
 *
 * @example
 * ```typescript
 * import { createHAI3, microfrontends } from '@hai3/framework';
 *
 * const app = createHAI3()
 *   .use(microfrontends())  // No config - just enables MFE capabilities
 *   .build();
 *
 * // Register domains dynamically at runtime:
 * const sidebarDomain = createSidebarDomain();
 * app.actions.registerDomain(sidebarDomain);
 * ```
 */
export function microfrontends(): HAI3Plugin {
  // Validate no config was passed
  // Function signature accepts no parameters, but TypeScript can't prevent
  // runtime calls like microfrontends({ anything: true })
  if (arguments.length > 0) {
    throw new Error(
      'microfrontends() plugin accepts NO configuration parameters. ' +
      'All MFE registration happens dynamically at runtime. ' +
      'Remove any configuration and call microfrontends() with no arguments.'
    );
  }

  return {
    name: 'microfrontends',
    dependencies: ['screensets'], // Requires screensets to be initialized

    onInit(app: HAI3App): void {
      // Verify screensetsRegistry is available
      const registry = app.screensetRegistry as unknown as Record<string, unknown>;

      if (!registry) {
        throw new Error(
          'microfrontends plugin requires screensets plugin to be initialized. ' +
          'Ensure screensets() is registered before microfrontends().'
        );
      }

      if (typeof registry.registerDomain !== 'function') {
        throw new Error(
          'screensetsRegistry does not have registerDomain method. ' +
          'Ensure you are using a ScreensetsRegistry instance from @hai3/screensets with MFE support.'
        );
      }

      // Plugin is now ready
      // Base domains are NOT registered here - they are registered dynamically
      // at runtime via runtime.registerDomain() or actions
      if (app.config.devMode) {
        console.log('[microfrontends] Plugin initialized');
        console.log('[microfrontends] Base domains are NOT pre-registered');
        console.log('[microfrontends] Register domains at runtime via runtime.registerDomain()');
      }
    },
  };
}

// Re-export base domain factories for convenience
export {
  createSidebarDomain,
  createPopupDomain,
  createScreenDomain,
  createOverlayDomain,
} from './base-domains';
