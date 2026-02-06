/**
 * Extension Type Definitions
 *
 * Extension binds an MFE entry to an extension domain, creating a concrete MFE instance.
 *
 * @packageDocumentation
 */

import type { LifecycleHook } from './lifecycle';

/**
 * Binds an MFE entry to an extension domain
 * GTS Type: gts.hai3.mfe.extension.v1~
 *
 * Domain-specific fields are defined in derived Extension types.
 * If domain.extensionsTypeId is specified, extension must use a type deriving from it.
 */
export interface Extension {
  /** The GTS type ID for this extension */
  id: string;
  /** ExtensionDomain type ID to mount into */
  domain: string;
  /** MfeEntry type ID to mount */
  entry: string;
  /** Optional lifecycle hooks - explicitly declared actions for each stage */
  lifecycle?: LifecycleHook[];
  // Domain-specific fields are added via derived types, not defined here
}
