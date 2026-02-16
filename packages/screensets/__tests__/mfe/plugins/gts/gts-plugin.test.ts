/**
 * GTS Plugin Tests
 *
 * Tests for the GTS Type System Plugin implementation.
 * These tests verify the TypeSystemPlugin interface implementation.
 */

import { describe, it, expect } from 'vitest';
import { gtsPlugin, GtsPlugin } from '../../../../src/mfe/plugins/gts/index';
import { HAI3_CORE_TYPE_IDS } from '../../../../src/mfe/init';
import { HAI3_SHARED_PROPERTY_THEME, HAI3_SHARED_PROPERTY_LANGUAGE } from '../../../../src/mfe/constants';

describe('GTS Plugin', () => {
  describe('schema registration and validation', () => {
    const plugin = new GtsPlugin();

    it('has all core schemas registered', () => {
      const schema = plugin.getSchema(HAI3_CORE_TYPE_IDS.mfeEntry);
      expect(schema).toBeDefined();
      expect(schema?.$id).toBe('gts://gts.hai3.mfes.mfe.entry.v1~');
    });

    it('validates instance with required fields', () => {
      // GTS-native validation approach:
      // 1. Register the instance
      // 2. Validate by instance ID only
      const instance = {
        id: 'gts.hai3.mfes.mfe.entry.v1~test.app.mfe.test_entry.v1',
        requiredProperties: [],
        actions: [],
        domainActions: [],
      };
      // Step 1: Register the instance
      plugin.register(instance);
      // Step 2: Validate by instance ID (gts-ts extracts schema ID automatically)
      const result = plugin.validateInstance(instance.id);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('fails validation for missing required field', () => {
      // GTS-native validation approach:
      // 1. Register the instance
      // 2. Validate by instance ID only
      const instance = {
        id: 'gts.hai3.mfes.mfe.entry.v1~test.app.mfe.invalid_entry.v1',
        requiredProperties: [],
        // Missing: actions, domainActions
      };
      // Step 1: Register the instance
      plugin.register(instance);
      // Step 2: Validate by instance ID (gts-ts extracts schema ID automatically)
      const result = plugin.validateInstance(instance.id);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('registers vendor schema', () => {
      const vendorSchema = {
        $id: 'gts://gts.acme.analytics.ext.action.v1~',
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: {
          type: { type: 'string' },
          target: { type: 'string' },
          payload: { type: 'object' },
        },
        required: ['type', 'target'],
      };

      plugin.registerSchema(vendorSchema);
      const retrieved = plugin.getSchema('gts.acme.analytics.ext.action.v1~');
      expect(retrieved).toBeDefined();
      expect(retrieved?.$id).toBe('gts://gts.acme.analytics.ext.action.v1~');
    });
  });

  describe('gtsPlugin singleton', () => {
    it('exports singleton instance', () => {
      expect(gtsPlugin).toBeDefined();
      expect(gtsPlugin.name).toBe('gts');
      expect(gtsPlugin.version).toBe('1.0.0');
    });

    it('singleton has all schemas registered', () => {
      const schema = gtsPlugin.getSchema(HAI3_CORE_TYPE_IDS.mfeEntry);
      expect(schema).toBeDefined();
    });
  });

  describe('isTypeOf - type hierarchy checking', () => {
    const plugin = new GtsPlugin();

    it('same type returns true', () => {
      const result = plugin.isTypeOf(
        'gts.hai3.mfes.mfe.entry.v1~',
        'gts.hai3.mfes.mfe.entry.v1~'
      );
      expect(result).toBe(true);
    });

    it('derived type returns true for base type', () => {
      const result = plugin.isTypeOf(
        'gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~',
        'gts.hai3.mfes.mfe.entry.v1~'
      );
      expect(result).toBe(true);
    });

    it('base type returns false for derived type', () => {
      const result = plugin.isTypeOf(
        'gts.hai3.mfes.mfe.entry.v1~',
        'gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~'
      );
      expect(result).toBe(false);
    });

    it('different types return false', () => {
      const result = plugin.isTypeOf(
        'gts.hai3.mfes.ext.domain.v1~',
        'gts.hai3.mfes.mfe.entry.v1~'
      );
      expect(result).toBe(false);
    });
  });

  describe('shared property instances', () => {
    it('validates theme shared property instance', () => {
      const result = gtsPlugin.validateInstance(HAI3_SHARED_PROPERTY_THEME);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('validates language shared property instance', () => {
      const result = gtsPlugin.validateInstance(HAI3_SHARED_PROPERTY_LANGUAGE);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('theme instance has supportedValues with 5 theme IDs', () => {
      // Access instance via getSchema (GtsStore returns both schemas and instances)
      const instance = gtsPlugin.getSchema(HAI3_SHARED_PROPERTY_THEME);
      expect(instance).toBeDefined();
      expect((instance as { supportedValues?: string[] })?.supportedValues).toBeDefined();
      expect((instance as { supportedValues?: string[] })?.supportedValues).toHaveLength(5);
      expect((instance as { supportedValues?: string[] })?.supportedValues).toEqual(['default', 'light', 'dark', 'dracula', 'dracula-large']);
    });

    it('language instance has supportedValues with 36 language codes', () => {
      // Access instance via getSchema (GtsStore returns both schemas and instances)
      const instance = gtsPlugin.getSchema(HAI3_SHARED_PROPERTY_LANGUAGE);
      expect(instance).toBeDefined();
      expect((instance as { supportedValues?: string[] })?.supportedValues).toBeDefined();
      expect((instance as { supportedValues?: string[] })?.supportedValues).toHaveLength(36);
    });

    it('theme instance does not have value field', () => {
      // Access instance via getSchema (GtsStore returns both schemas and instances)
      const instance = gtsPlugin.getSchema(HAI3_SHARED_PROPERTY_THEME);
      expect(instance).toBeDefined();
      expect(instance).not.toHaveProperty('value');
    });

    it('language instance does not have value field', () => {
      // Access instance via getSchema (GtsStore returns both schemas and instances)
      const instance = gtsPlugin.getSchema(HAI3_SHARED_PROPERTY_LANGUAGE);
      expect(instance).toBeDefined();
      expect(instance).not.toHaveProperty('value');
    });
  });

  describe('extension presentation metadata', () => {
    it('base extension schema does NOT include presentation field', () => {
      const schema = gtsPlugin.getSchema('gts.hai3.mfes.ext.extension.v1~');
      expect(schema).toBeDefined();
      expect(schema?.properties).not.toHaveProperty('presentation');
    });

    it('screen extension derived schema includes presentation field (required)', () => {
      const schema = gtsPlugin.getSchema('gts.hai3.mfes.ext.extension.v1~hai3.screensets.layout.screen.v1~');
      expect(schema).toBeDefined();
      expect(schema?.properties).toHaveProperty('presentation');
      expect((schema?.properties as Record<string, unknown>).presentation).toMatchObject({
        type: 'object',
        properties: {
          label: { type: 'string' },
          icon: { type: 'string' },
          route: { type: 'string' },
          order: { type: 'number' },
        },
        required: ['label', 'route'],
      });
      expect(schema?.required).toContain('presentation');
    });
  });

  describe('shared property schema design', () => {
    it('shared property schema requires supportedValues', () => {
      const schema = gtsPlugin.getSchema('gts.hai3.mfes.comm.shared_property.v1~');
      expect(schema).toBeDefined();
      expect(schema?.required).toContain('supportedValues');
    });

    it('shared property schema does NOT require value', () => {
      const schema = gtsPlugin.getSchema('gts.hai3.mfes.comm.shared_property.v1~');
      expect(schema).toBeDefined();
      expect(schema?.required).not.toContain('value');
    });

    it('shared property schema supportedValues is array of strings', () => {
      const schema = gtsPlugin.getSchema('gts.hai3.mfes.comm.shared_property.v1~');
      expect(schema).toBeDefined();
      const properties = schema?.properties as Record<string, unknown>;
      expect(properties.supportedValues).toMatchObject({
        type: 'array',
        items: {
          type: 'string',
        },
      });
    });
  });
});
