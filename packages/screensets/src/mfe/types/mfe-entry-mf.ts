/**
 * MFE Entry Module Federation Type Definitions
 *
 * MfeEntryMF extends MfeEntry with Module Federation 2.0 loading configuration.
 *
 * @packageDocumentation
 */

import type { MfeEntry } from './mfe-entry';

/**
 * Module Federation 2.0 implementation of MfeEntry
 * GTS Type: gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~
 */
export interface MfeEntryMF extends MfeEntry {
  /** Reference to MfManifest type ID containing Module Federation config */
  manifest: string;
  /** Module Federation exposed module name (e.g., './ChartWidget') */
  exposedModule: string;
}
