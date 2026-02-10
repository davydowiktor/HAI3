/**
 * Dynamic Registration Tests (Phase 19.5)
 *
 * Tests for dynamic registration of extensions and domains at runtime.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createScreensetsRegistry } from '../../../src/mfe/runtime/ScreensetsRegistry';
import { gtsPlugin } from '../../../src/mfe/plugins/gts';
import type { ExtensionDomain, Extension, MfeEntry } from '../../../src/mfe/types';
import type { MfeEntryLifecycle, ChildMfeBridge } from '../../../src/mfe/handler/types';

// Helper to access private members for testing (replaces 'as never' with proper typing)
interface ExtensionStateShape {
  extension: Extension;
  entry: MfeEntry;
  bridge: unknown;
  loadState: 'idle' | 'loading' | 'loaded' | 'error';
  mountState: 'unmounted' | 'mounting' | 'mounted' | 'error';
  container: Element | null;
  lifecycle: MfeEntryLifecycle<ChildMfeBridge> | null;
  error?: Error;
}

interface RegistryInternals {
  extensions: Map<string, ExtensionStateShape>;
}

function getRegistryInternals(registry: ReturnType<typeof createScreensetsRegistry>): RegistryInternals {
  return registry as unknown as RegistryInternals;
}

describe('Dynamic Registration', () => {
  let registry: ReturnType<typeof createScreensetsRegistry>;

  const testDomain: ExtensionDomain = {
    id: 'gts.hai3.mfes.ext.domain.v1~test.dynamic.reg.domain.v1',
    sharedProperties: [],
    actions: [],
    extensionsActions: [],
    defaultActionTimeout: 5000,
    lifecycleStages: [
      'gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.init.v1',
      'gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.destroyed.v1',
    ],
    extensionsLifecycleStages: [
      'gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.init.v1',
      'gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.activated.v1',
      'gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.deactivated.v1',
      'gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.destroyed.v1',
    ],
  };

  const testEntry: MfeEntry = {
    id: 'gts.hai3.mfes.mfe.entry.v1~test.dynamic.reg.entry.v1',
    requiredProperties: [],
    optionalProperties: [],
    actions: [],
    domainActions: [],
  };

  const testExtension: Extension = {
    id: 'gts.hai3.mfes.ext.extension.v1~test.dynamic.reg.extension.v1',
    domain: testDomain.id,
    entry: testEntry.id,
  };

  beforeEach(() => {
    registry = createScreensetsRegistry({
      typeSystem: gtsPlugin,
      debug: false,
    });

    // Register the entry instance with GTS plugin before using it
    gtsPlugin.register(testEntry);
  });

  describe('registerExtension', () => {
    it('should register extension after runtime initialization', async () => {
      // Register domain first
      registry.registerDomain(testDomain);

      // Mock resolveEntry
      const internals = getRegistryInternals(registry);
      internals.extensions.set(testExtension.id, {
        extension: testExtension,
        entry: testEntry,
        bridge: null,
        loadState: 'idle',
        mountState: 'unmounted',
        container: null,
        lifecycle: null,
      });

      // Register extension dynamically
      await registry.registerExtension(testExtension);

      // Verify registration
      const result = registry.getExtension(testExtension.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(testExtension.id);
    });

    it('should fail if domain not registered', async () => {
      // Try to register extension without domain
      await expect(registry.registerExtension(testExtension)).rejects.toThrow(
        /domain.*not registered/i
      );
    });
  });

  describe('unregisterExtension', () => {
    it('should unregister extension', async () => {
      // Register domain and extension
      registry.registerDomain(testDomain);

      // Mock resolveEntry
      const internals = getRegistryInternals(registry);
      internals.extensions.set(testExtension.id, {
        extension: testExtension,
        entry: testEntry,
        bridge: null,
        loadState: 'idle',
        mountState: 'unmounted',
        container: null,
        lifecycle: null,
      });

      await registry.registerExtension(testExtension);

      // Unregister
      await registry.unregisterExtension(testExtension.id);

      // Verify unregistered
      const result = registry.getExtension(testExtension.id);
      expect(result).toBeUndefined();
    });

    it('should be idempotent', async () => {
      // Unregister non-existent extension should not throw
      await expect(registry.unregisterExtension('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('registerDomain', () => {
    it('should register domain at any time', () => {
      // Register domain
      registry.registerDomain(testDomain);

      // Verify registration
      const result = registry.getDomain(testDomain.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(testDomain.id);
    });
  });

  describe('unregisterDomain', () => {
    it('should cascade unregister extensions in domain', async () => {
      // Register domain
      registry.registerDomain(testDomain);

      // Mock resolveEntry
      const internals = getRegistryInternals(registry);
      internals.extensions.set(testExtension.id, {
        extension: testExtension,
        entry: testEntry,
        bridge: null,
        loadState: 'idle',
        mountState: 'unmounted',
        container: null,
        lifecycle: null,
      });

      await registry.registerExtension(testExtension);

      // Unregister domain
      await registry.unregisterDomain(testDomain.id);

      // Verify domain and extension are unregistered
      expect(registry.getDomain(testDomain.id)).toBeUndefined();
      expect(registry.getExtension(testExtension.id)).toBeUndefined();
    });
  });

  describe('registration events', () => {
    it('should emit extensionRegistered event', async () => {
      const callback = vi.fn();
      registry.on('extensionRegistered', callback);

      // Register domain
      registry.registerDomain(testDomain);

      // Mock resolveEntry
      const internals = getRegistryInternals(registry);
      internals.extensions.set(testExtension.id, {
        extension: testExtension,
        entry: testEntry,
        bridge: null,
        loadState: 'idle',
        mountState: 'unmounted',
        container: null,
        lifecycle: null,
      });

      await registry.registerExtension(testExtension);

      expect(callback).toHaveBeenCalledWith({ extensionId: testExtension.id });
    });

    it('should emit domainRegistered event', () => {
      const callback = vi.fn();
      registry.on('domainRegistered', callback);

      registry.registerDomain(testDomain);

      expect(callback).toHaveBeenCalledWith({ domainId: testDomain.id });
    });
  });
});
