/**
 * MFE Bootstrap
 *
 * Registers MFE domains, extensions, and handlers with the HAI3 app.
 * This file is imported in main.tsx to wire MFE capabilities into the host app.
 */

import type { HAI3App } from '@hai3/react';
import {
  screenDomain,
  sidebarDomain,
  popupDomain,
  overlayDomain,
  HAI3_ACTION_MOUNT_EXT,
  HAI3_SHARED_PROPERTY_THEME,
  HAI3_SHARED_PROPERTY_LANGUAGE,
  RefContainerProvider,
} from '@hai3/react';
import demoMfeConfig from '@/mfe_packages/demo-mfe/mfe.json';

/**
 * DetachedContainerProvider for domains without a visible host element.
 * Used for domains that don't require direct DOM attachment in the current demo.
 */
class DetachedContainerProvider extends RefContainerProvider {
  constructor() {
    // Create a detached DOM element
    const detachedElement = document.createElement('div');
    super({ current: detachedElement });
  }
}

/**
 * Bootstrap MFE system for the host application.
 * Registers domains, extensions, and mounts the default extension.
 *
 * @param app - HAI3 application instance
 * @param screenContainerRef - React ref for the screen domain container element
 */
export async function bootstrapMFE(
  app: HAI3App,
  screenContainerRef: React.RefObject<HTMLDivElement>
): Promise<void> {
  const { screensetsRegistry } = app;

  if (!screensetsRegistry) {
    throw new Error('[MFE Bootstrap] screensetsRegistry is not available on app instance');
  }

  // Step 1: Register all 4 extension domains with ContainerProviders
  // Screen domain uses the actual container ref from the host UI
  const screenContainerProvider = new RefContainerProvider(screenContainerRef);
  screensetsRegistry.registerDomain(screenDomain, screenContainerProvider);

  // Sidebar, popup, and overlay domains use detached container providers (no host element required)
  // These domains are not used in the initial demo but are registered to demonstrate the pattern
  const sidebarContainerProvider = new DetachedContainerProvider();
  screensetsRegistry.registerDomain(sidebarDomain, sidebarContainerProvider);

  const popupContainerProvider = new DetachedContainerProvider();
  screensetsRegistry.registerDomain(popupDomain, popupContainerProvider);

  const overlayContainerProvider = new DetachedContainerProvider();
  screensetsRegistry.registerDomain(overlayDomain, overlayContainerProvider);

  // Step 2: Initialize domain shared properties
  // Set initial theme and language values for all domains
  const domainIds = [screenDomain.id, sidebarDomain.id, popupDomain.id, overlayDomain.id];
  const currentThemeId = app.themeRegistry.getCurrent()?.id ?? 'default';

  for (const domainId of domainIds) {
    screensetsRegistry.updateDomainProperty(domainId, HAI3_SHARED_PROPERTY_THEME, currentThemeId);
    screensetsRegistry.updateDomainProperty(domainId, HAI3_SHARED_PROPERTY_LANGUAGE, 'en');
  }

  // Step 3: Register the MFE manifest
  // Register the single manifest with type system
  screensetsRegistry.typeSystem.register(demoMfeConfig.manifest);

  // Step 4: Register all 4 MFE entries
  // Each entry references the single manifest
  for (const entry of demoMfeConfig.entries) {
    const entryWithInlineManifest = {
      ...entry,
      manifest: demoMfeConfig.manifest,
    };
    screensetsRegistry.typeSystem.register(entryWithInlineManifest);
  }

  // Step 5: Register all 4 extensions
  // Each extension points to its corresponding entry
  for (const extension of demoMfeConfig.extensions) {
    await screensetsRegistry.registerExtension(extension);
  }

  // Step 6: Mount the default extension (helloworld)
  await screensetsRegistry.executeActionsChain({
    action: {
      type: HAI3_ACTION_MOUNT_EXT,
      target: screenDomain.id,
      payload: { extensionId: demoMfeConfig.extensions[0].id },
    },
  });
}
