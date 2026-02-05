/**
 * Type System Plugin exports
 *
 * @packageDocumentation
 */

export type {
  JSONSchema,
  ValidationError,
  ValidationResult,
  CompatibilityChange,
  CompatibilityResult,
  AttributeResult,
  TypeSystemPlugin,
} from './types';

// GTS plugin (default implementation)
export { createGtsPlugin, gtsPlugin } from './gts';
