/**
 * Extension Type Definitions
 *
 * Extension binds an MFE entry to an extension domain, creating a concrete MFE instance.
 *
 * @packageDocumentation
 */

import type { LifecycleHook } from './lifecycle';

/**
 * Presentation metadata for extensions.
 * Used by the host to build navigation menus and other UI elements.
 */
export interface ExtensionPresentation {
  /** Human-readable label for the extension */
  label: string;
  /** Optional icon identifier (e.g., "user", "settings") */
  icon?: string;
  /** Route path for navigation (e.g., "/profile", "/settings") */
  route: string;
  /** Optional sort order for menu items (lower numbers first) */
  order?: number;
}

/**
 * Binds an MFE entry to an extension domain
 * GTS Type: gts.hai3.mfes.ext.extension.v1~
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
  /** Optional presentation metadata for UI rendering (menus, navigation, etc.) */
  presentation?: ExtensionPresentation;
  // Domain-specific fields are added via derived types, not defined here
}
