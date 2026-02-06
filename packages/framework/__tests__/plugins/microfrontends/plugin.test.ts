/**
 * Tests for microfrontends plugin
 *
 * @packageDocumentation
 */

import { describe, it, expect } from 'vitest';
import { createHAI3 } from '../../../src/createHAI3';
import { screensets } from '../../../src/plugins/screensets';
import {
  microfrontends,
  createSidebarDomain,
  createPopupDomain,
  createScreenDomain,
  createOverlayDomain,
} from '../../../src/plugins/microfrontends';

describe('microfrontends plugin', () => {
  describe('plugin factory', () => {
    it('should accept no parameters', () => {
      expect(() => {
        microfrontends();
      }).not.toThrow();
    });

    it('should throw error if any configuration is passed', () => {
      expect(() => {
        // Testing runtime error when config is passed
        // We need to bypass TypeScript checking to test runtime behavior
        const pluginFactory = microfrontends as unknown as (config: Record<string, unknown>) => unknown;
        pluginFactory({ anything: true });
      }).toThrow(/accepts NO configuration parameters/);
    });

    it('should return a valid plugin object', () => {
      const plugin = microfrontends();

      expect(plugin).toHaveProperty('name', 'microfrontends');
      expect(plugin).toHaveProperty('dependencies');
      expect(plugin.dependencies).toContain('screensets');
      expect(plugin).toHaveProperty('onInit');
    });
  });

  describe('plugin initialization', () => {
    it('should throw error when MFE-enabled ScreensetsRegistry is not available', () => {
      // Phase 7: The microfrontends plugin expects a MFE-enabled ScreensetsRegistry
      // The current screensets plugin uses the old SDK registry without MFE methods
      // This test verifies the plugin correctly detects the missing MFE capabilities
      expect(() => {
        createHAI3()
          .use(screensets())
          .use(microfrontends())
          .build();
      }).toThrow(/does not have registerDomain method/);
    });

    it('should throw error if screensetsRegistry is missing', () => {
      // Create app without screensets plugin
      expect(() => {
        const app = createHAI3().build();
        const plugin = microfrontends();

        // Try to initialize plugin manually
        plugin.onInit?.(app);
      }).toThrow(/requires screensets plugin/);
    });
  });

  describe('base domain factories', () => {
    it('should create sidebar domain with correct structure', () => {
      const domain = createSidebarDomain();

      expect(domain).toMatchObject({
        id: 'gts.hai3.mfe.domain.v1~hai3.screensets.layout.sidebar.v1',
        sharedProperties: [],
        actions: [
          'gts.hai3.mfe.action.v1~hai3.mfe.actions.load_ext.v1',
          'gts.hai3.mfe.action.v1~hai3.mfe.actions.unload_ext.v1',
        ],
        extensionsActions: [],
        defaultActionTimeout: 5000,
      });
      expect(domain.lifecycleStages).toHaveLength(4);
      expect(domain.extensionsLifecycleStages).toHaveLength(4);
    });

    it('should create popup domain with correct structure', () => {
      const domain = createPopupDomain();

      expect(domain).toMatchObject({
        id: 'gts.hai3.mfe.domain.v1~hai3.screensets.layout.popup.v1',
        sharedProperties: [],
        actions: [
          'gts.hai3.mfe.action.v1~hai3.mfe.actions.load_ext.v1',
          'gts.hai3.mfe.action.v1~hai3.mfe.actions.unload_ext.v1',
        ],
        extensionsActions: [],
        defaultActionTimeout: 5000,
      });
      expect(domain.lifecycleStages).toHaveLength(4);
      expect(domain.extensionsLifecycleStages).toHaveLength(4);
    });

    it('should create screen domain with only load_ext action', () => {
      const domain = createScreenDomain();

      expect(domain).toMatchObject({
        id: 'gts.hai3.mfe.domain.v1~hai3.screensets.layout.screen.v1',
        sharedProperties: [],
        actions: [
          'gts.hai3.mfe.action.v1~hai3.mfe.actions.load_ext.v1',
          // Note: No unload_ext - screen domain cannot be empty
        ],
        extensionsActions: [],
        defaultActionTimeout: 5000,
      });
      expect(domain.actions).toHaveLength(1); // Only load_ext
      expect(domain.lifecycleStages).toHaveLength(4);
      expect(domain.extensionsLifecycleStages).toHaveLength(4);
    });

    it('should create overlay domain with correct structure', () => {
      const domain = createOverlayDomain();

      expect(domain).toMatchObject({
        id: 'gts.hai3.mfe.domain.v1~hai3.screensets.layout.overlay.v1',
        sharedProperties: [],
        actions: [
          'gts.hai3.mfe.action.v1~hai3.mfe.actions.load_ext.v1',
          'gts.hai3.mfe.action.v1~hai3.mfe.actions.unload_ext.v1',
        ],
        extensionsActions: [],
        defaultActionTimeout: 5000,
      });
      expect(domain.lifecycleStages).toHaveLength(4);
      expect(domain.extensionsLifecycleStages).toHaveLength(4);
    });
  });

  describe('domain registration', () => {
    it('should verify base domain factories return valid ExtensionDomain instances', () => {
      // Phase 7: Verify that base domain factories create valid domain instances
      // These domains will be registered at runtime via runtime.registerDomain()
      const domains = [
        createSidebarDomain(),
        createPopupDomain(),
        createScreenDomain(),
        createOverlayDomain(),
      ];

      domains.forEach(domain => {
        // Verify required ExtensionDomain fields
        expect(domain.id).toBeDefined();
        expect(typeof domain.id).toBe('string');
        expect(Array.isArray(domain.sharedProperties)).toBe(true);
        expect(Array.isArray(domain.actions)).toBe(true);
        expect(Array.isArray(domain.extensionsActions)).toBe(true);
        expect(typeof domain.defaultActionTimeout).toBe('number');
        expect(domain.defaultActionTimeout).toBeGreaterThan(0);
        expect(Array.isArray(domain.lifecycleStages)).toBe(true);
        expect(Array.isArray(domain.extensionsLifecycleStages)).toBe(true);
      });
    });
  });
});
