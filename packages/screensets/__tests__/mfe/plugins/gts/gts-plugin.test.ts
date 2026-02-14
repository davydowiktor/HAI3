/**
 * GTS Plugin Tests
 *
 * Tests for the GTS Type System Plugin implementation.
 * These tests verify the TypeSystemPlugin interface implementation.
 */

import { describe, it, expect } from 'vitest';
import { gtsPlugin, GtsPlugin } from '../../../../src/mfe/plugins/gts/index';
import { HAI3_CORE_TYPE_IDS } from '../../../../src/mfe/init';

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
});
