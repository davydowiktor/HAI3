/**
 * GTS JSON Loaders
 *
 * Utilities for loading GTS entities from JSON files.
 * These functions load schemas and instances from the hai3.mfe and hai3.screensets packages.
 *
 * @packageDocumentation
 */

import type { JSONSchema } from '../plugins/types';

// Import all schema JSON files
import entrySchema from './hai3.mfe/schemas/entry.v1.json';
import domainSchema from './hai3.mfe/schemas/domain.v1.json';
import extensionSchema from './hai3.mfe/schemas/extension.v1.json';
import actionSchema from './hai3.mfe/schemas/action.v1.json';
import actionsChainSchema from './hai3.mfe/schemas/actions_chain.v1.json';
import sharedPropertySchema from './hai3.mfe/schemas/shared_property.v1.json';
import lifecycleStageSchema from './hai3.mfe/schemas/lifecycle_stage.v1.json';
import lifecycleHookSchema from './hai3.mfe/schemas/lifecycle_hook.v1.json';
import manifestSchema from './hai3.mfe/schemas/manifest.v1.json';
import entryMfSchema from './hai3.mfe/schemas/entry_mf.v1.json';

// Import lifecycle stage instances
import lifecycleInitInstance from './hai3.mfe/instances/lifecycle-stages/init.v1.json';
import lifecycleActivatedInstance from './hai3.mfe/instances/lifecycle-stages/activated.v1.json';
import lifecycleDeactivatedInstance from './hai3.mfe/instances/lifecycle-stages/deactivated.v1.json';
import lifecycleDestroyedInstance from './hai3.mfe/instances/lifecycle-stages/destroyed.v1.json';

// Import action instances
import loadExtActionInstance from './hai3.mfe/instances/actions/load_ext.v1.json';
import unloadExtActionInstance from './hai3.mfe/instances/actions/unload_ext.v1.json';

// Import layout domain instances
import sidebarDomainInstance from './hai3.screensets/instances/domains/sidebar.v1.json';
import popupDomainInstance from './hai3.screensets/instances/domains/popup.v1.json';
import screenDomainInstance from './hai3.screensets/instances/domains/screen.v1.json';
import overlayDomainInstance from './hai3.screensets/instances/domains/overlay.v1.json';

/**
 * Load all core MFE schema JSON files.
 * These are the 10 first-class citizen schemas (8 core + 2 MF-specific).
 *
 * @returns Array of JSON schemas for core MFE types
 */
export function loadSchemas(): JSONSchema[] {
  return [
    // Core types (8)
    entrySchema as JSONSchema,
    domainSchema as JSONSchema,
    extensionSchema as JSONSchema,
    actionSchema as JSONSchema,
    actionsChainSchema as JSONSchema,
    sharedPropertySchema as JSONSchema,
    lifecycleStageSchema as JSONSchema,
    lifecycleHookSchema as JSONSchema,
    // MF-specific types (2)
    manifestSchema as JSONSchema,
    entryMfSchema as JSONSchema,
  ];
}

/**
 * Load default lifecycle stage instances.
 * These are the 4 default lifecycle stages: init, activated, deactivated, destroyed.
 *
 * @returns Array of lifecycle stage instances
 */
export function loadLifecycleStages(): unknown[] {
  return [
    lifecycleInitInstance,
    lifecycleActivatedInstance,
    lifecycleDeactivatedInstance,
    lifecycleDestroyedInstance,
  ];
}

/**
 * Load base action instances.
 * These are the generic load_ext and unload_ext actions used by all domains.
 *
 * @returns Array of action instances
 */
export function loadBaseActions(): unknown[] {
  return [loadExtActionInstance, unloadExtActionInstance];
}

/**
 * Load layout domain instances from hai3.screensets package.
 * These are the 4 base layout domains: sidebar, popup, screen, overlay.
 *
 * @returns Array of layout domain instances
 */
export function loadLayoutDomains(): unknown[] {
  return [sidebarDomainInstance, popupDomainInstance, screenDomainInstance, overlayDomainInstance];
}
