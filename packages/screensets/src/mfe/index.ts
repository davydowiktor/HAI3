/**
 * MFE (Microfrontend) support exports
 *
 * @packageDocumentation
 */

// Type System Plugin
export type {
  JSONSchema,
  ValidationError,
  ValidationResult,
  CompatibilityChange,
  CompatibilityResult,
  AttributeResult,
  TypeSystemPlugin,
} from './plugins';

// GTS Plugin (default implementation)
export { createGtsPlugin, gtsPlugin } from './plugins';

// HAI3 Type ID Constants
export { HAI3_CORE_TYPE_IDS, HAI3_LIFECYCLE_STAGE_IDS, HAI3_MF_TYPE_IDS } from './init';

// GTS Schemas (for reference/documentation)
export { mfeGtsSchemas } from './schemas/gts-schemas';
