<!-- @standalone -->
# MFE Architecture (Canonical)

## AI WORKFLOW (REQUIRED)
1) Summarize 3-6 rules from this file before making changes.
2) STOP if you bypass `ScreensetsRegistry`, mutate runtime coordinators directly, or wire host<->MFE communication via events.
3) For per-MFE Flux (slices, events, effects, screens), follow `.ai/targets/SCREENSETS.md`. THIS file covers the cross-runtime layer.

## SCOPE
- `packages/screensets/src/mfe/**` — runtime contracts, registry, mediators, lifecycle, bridge, GTS plugin, Shadow DOM utilities.
- `src/mfe_packages/**` — bridge usage, lifecycle entries, manifest, GTS package selection, cross-runtime calls.

## CRITICAL RULES
- `ScreensetsRegistry` is the single entry point for MFE operations. Use the abstract class as the type; never depend on `DefaultScreensetsRegistry` directly.
- Cross-runtime coordination uses **actions chains + lifecycle stages**, NOT events. `eventBus` is intra-MFE (Flux) only.
- Type IDs are opaque GTS strings; call `gtsPlugin` (or the configured `TypeSystemPlugin`) for metadata. No runtime ID generation.
- Coordination is internal: `RuntimeCoordinator` and the mediators are not exposed to MFE code.
- Shadow DOM owns MFE styling isolation; theme propagation goes through `HAI3_SHARED_PROPERTY_THEME` and Shadow DOM CSS variable injection.

## REGISTRY API (PUBLIC SURFACE)

```typescript
import {
  ScreensetsRegistry,
  screensetsRegistryFactory,
  Extension,
  ExtensionDomain,
  HAI3_ACTION_LOAD_EXT,
  HAI3_ACTION_MOUNT_EXT,
  HAI3_ACTION_UNMOUNT_EXT,
} from '@cyberfabric/screensets';
import { gtsPlugin } from '@cyberfabric/screensets/plugins/gts';

const registry: ScreensetsRegistry = screensetsRegistryFactory.build({
  typeSystem: gtsPlugin,
});

// Register domain (with container provider) and extension
registry.registerDomain(screenDomain, containerProvider);
await registry.registerExtension(homeExtension);

// All lifecycle goes through executeActionsChain — never call internal mount/load methods.
await registry.executeActionsChain({
  action: { type: HAI3_ACTION_LOAD_EXT, target: screenDomainId, payload: { subject: 'ext-id' } },
});
await registry.executeActionsChain({
  action: { type: HAI3_ACTION_MOUNT_EXT, target: screenDomainId, payload: { subject: 'ext-id' } },
});
await registry.executeActionsChain({
  action: { type: HAI3_ACTION_UNMOUNT_EXT, target: screenDomainId, payload: { subject: 'ext-id' } },
});
```

- FORBIDDEN: calling `loadExtension()`, `mountExtension()`, or `unmountExtension()` directly. They are `MountManager`-internal and not part of the public registry contract.
- FORBIDDEN: registering an extension before its domain.

## TYPE SYSTEM PLUGIN

```typescript
import { gtsPlugin } from '@cyberfabric/screensets/plugins/gts';
// gtsPlugin: TypeSystemPlugin singleton (default impl)

// Discovery via plugin
plugin.parseTypeId(typeId);          // metadata
plugin.isTypeOf(typeId, candidate);  // hierarchy match
plugin.validateInstance(instance);   // post-register validation
```

- REQUIRED: Inject `TypeSystemPlugin` at registry construction (`screensetsRegistryFactory.build({ typeSystem })`).
- REQUIRED: Validate instances **after** `plugin.register(schema)`, never before.
- FORBIDDEN: Direct Ajv usage; gts-ts wraps it. No alternative validators in MFE code.
- FORBIDDEN: Synthetic IDs in `Action.type`; the field is a GTS entity ID.

## EXTENSION + DOMAIN REGISTRATION

| Concept | Source |
|---|---|
| `ExtensionDomain` | A layout domain with lifecycle stages and a container provider. |
| `Extension` (and `ScreenExtension`) | A targetable unit owned by an MFE; resolves to a mountable lifecycle. |
| `LayoutDomain` enum | header, footer, menu, sidebar, screen, popup, overlay. |
| `MfeHandler` (abstract) | `canHandle(entry)` (uses `plugin.isTypeOf`), `load`, `mount`, `unmount`. |
| `MfeHandlerMF` | Module Federation concrete handler — internal manifest resolution; do not expose `MfManifest` registration publicly. |
| `MfeBridgeFactory` (abstract) | Produces `ChildMfeBridge` instances for the registry. |

- REQUIRED: Domains define `lifecycleStages` and `extensionsLifecycleStages` (per-stage actions chains).
- REQUIRED: A `LifecycleHook` binds a stage to an `actions_chain`; failure (or timeout) flips to the fallback chain.
- REQUIRED: Action timeout resolution: `action.timeout ?? domain.defaultActionTimeout`.
- REQUIRED: `ChainExecutionOptions` accepts only `chainTimeout` (chain-level).
- FORBIDDEN: Action-level execution options inside `executeActionsChain()`.

## CHILD MFE BRIDGE

The bridge is the ONLY communication surface for MFEs. It is passed to the lifecycle's `mount(container, bridge)`.

```typescript
class MyLifecycle extends ThemeAwareReactLifecycle {
  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    return <Screen bridge={bridge} />;
  }
}
```

Public ChildMfeBridge surface:
```typescript
readonly domainId: string;
readonly instanceId: string;

executeActionsChain(chain: ActionsChain): Promise<void>;
subscribeToProperty(propertyTypeId: string, callback): () => void;
getProperty(propertyTypeId: string): SharedProperty | undefined;
```

- REQUIRED: Subscribe to language with `bridge.subscribeToProperty(HAI3_SHARED_PROPERTY_LANGUAGE, …)` for MFE-local i18n.
- REQUIRED: Subscribe to theme with `bridge.subscribeToProperty(HAI3_SHARED_PROPERTY_THEME, …)` if MFE renders theme-aware UI outside Shadow DOM injection.
- REQUIRED: To trigger another extension, dispatch `HAI3_ACTION_MOUNT_EXT` via `bridge.executeActionsChain()`.
- FORBIDDEN: Reaching into the registry, mediator, or coordinator from MFE code.
- FORBIDDEN: Adding new public methods to `ChildMfeBridge` "for testing." If a test needs a hook, redesign the boundary.

## ACTIONS CHAIN EXECUTION

```typescript
// success/fallback branching is built in; do NOT add config-level onError callbacks
await registry.executeActionsChain({
  action: { type: HAI3_ACTION_MOUNT_EXT, target: 'screen', payload: { subject: 'home' } },
  onSuccess: { action: { type: HAI3_ACTION_..., target: ..., payload: ... } },
  onFallback: { action: { type: HAI3_ACTION_..., target: ..., payload: ... } },
});
```

- REQUIRED: `ActionsChain` carries `Action` instances; nested chains are nested objects, not handler references.
- REQUIRED: Use the chain's `onFallback` branch for failure handling. Timeouts trigger the fallback chain identically to other failures.
- REQUIRED: `ActionsChainsMediator` (internal) handles execution; chain authors only construct chains.
- FORBIDDEN: Capability duplication — config-level `onError`, retry knobs, or success callbacks that overlap chain branches.

## LIFECYCLE COORDINATION

- `RuntimeCoordinator` is an abstract DI seam; `WeakMapRuntimeCoordinator` is the concrete impl (not exported).
- Lifecycle stages run via `LifecycleHook.actions_chain` resolution; the registry advances the stage only when the chain settles.
- MFE entries are `MfeEntryLifecycle` (mount/unmount). React MFEs extend `ThemeAwareReactLifecycle`, which:
  - consumes the host server-state runtime handoff,
  - mounts `<HAI3Provider app={mfeApp}>` for the child app,
  - injects theme CSS variables into the Shadow root.
- REQUIRED: `lifecycle.tsx` exports `default new MyLifecycle()` (singleton instance).

## SHADOW DOM AND ISOLATION

```typescript
import { createShadowRoot, injectCssVariables } from '@cyberfabric/screensets';
const shadowRoot = createShadowRoot(container, { mode: 'open' });
injectCssVariables(shadowRoot, { '--primary-color': '#007bff' });
```

- REQUIRED: MFE rendering targets a Shadow root supplied by the host's container provider.
- REQUIRED: Theme tokens flow as CSS variables via `injectCssVariables`; MFEs consume `var(--…)` only.
- FORBIDDEN: Reading or mutating host DOM outside the assigned container.
- FORBIDDEN: Importing host stylesheets globally; styles enter the Shadow root only via the federation chunk's CSS metadata.

## GTS PACKAGE SELECTION

For host UI that lists or filters MFE-provided extensions:

```typescript
import { useRegisteredPackages, useActivePackage } from '@cyberfabric/react';
import { extractGtsPackage } from '@cyberfabric/screensets';

const packages = useRegisteredPackages();      // ['hai3.demo', 'hai3.other', …]
const active = useActivePackage();             // 'hai3.demo' | undefined
const pkg = extractGtsPackage(extensionId);    // package id from a GTS entity ID
```

- REQUIRED: Discover packages via the React hooks; never iterate the registry directly from React code.
- REQUIRED: Track active package via `useActivePackage`; persistence is host-owned.
- NOTE: Package registration is implicit — when an extension registers, its package is tracked; when the last extension unregisters, the package is removed.

## MFE BUILD CONFIGURATION
- REQUIRED: `build.modulePreload: false` in every MFE `vite.config.ts` (Vite's preload helper resolves chunk URLs against the page origin, breaking cross-origin MFE loads).
- REQUIRED: `build.target: 'esnext'` (federation runtime uses top-level await).
- REQUIRED: Pair `federation()` with `hai3MfeExternalize({ shared })` using the **same** `shared` array (federation rewrites expose entries; the externalize plugin rewrites code-split chunks).
- NOTE: `cssCodeSplit` may stay on; `MfeHandlerMF` injects emitted styles into the mount target before the lifecycle mount stage.
- REFERENCE: `src/mfe_packages/_blank-mfe/vite.config.ts`.

## STOP CONDITIONS
- Adding cross-runtime "events" instead of actions chains.
- Importing `DefaultScreensetsRegistry`, `WeakMapRuntimeCoordinator`, `ActionsChainsMediator`, or other concrete internals from app/MFE code.
- Adding test-only getters or public APIs on the bridge / registry / coordinator.
- Adding config-level error/retry callbacks that duplicate chain branches.
- Generating type IDs at runtime; pulling Ajv directly.

## PRE-DIFF CHECKLIST
- [ ] Public consumers depend on abstract classes (`ScreensetsRegistry`, `MfeHandler`, `MfeBridgeFactory`, `RuntimeCoordinator`).
- [ ] All lifecycle transitions go through `executeActionsChain()` with `HAI3_ACTION_*` types.
- [ ] Cross-runtime coordination uses lifecycle stages + chains; in-MFE Flux uses eventBus.
- [ ] Type IDs are constants; validation goes through `gtsPlugin` (or injected `TypeSystemPlugin`).
- [ ] Bridge usage limited to `executeActionsChain`, `subscribeToProperty`, `getProperty`.
- [ ] Theme/language consumed via `HAI3_SHARED_PROPERTY_*` and Shadow DOM injection.
- [ ] No new test-only public APIs; no capability duplication.
- [ ] MFE vite config matches canonical setup (modulePreload: false, target: esnext, federation + hai3MfeExternalize with identical `shared`).
