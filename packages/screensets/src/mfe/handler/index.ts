/**
 * MFE Handler Exports
 *
 * @packageDocumentation
 */

// Abstract types and interfaces (public API)
export type {
  ParentMfeBridge,
  ChildMfeBridge,
  MfeEntryLifecycle,
} from './types';
export { MfeBridgeFactory, MfeHandler } from './types';

// Concrete implementations (public API)
export { MfeHandlerMF, MfeBridgeFactoryDefault, ChildMfeBridgeImpl } from './mf-handler';
