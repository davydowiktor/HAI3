# Implementation Tasks

## Status

All MFE implementation tasks through Phase 31.7 are COMPLETE (441 tests passing: 364 screensets + 61 framework + 16 react, 4 tests skipped identifying validation gaps).

Phase 27 (React component migration) is COMPLETE. @hai3/screensets has zero React dependencies.

Phase 28 (ScreensetsRegistryConfig cleanup and test-only API removal) is COMPLETE.

Phase 29 (Public API cleanup — remove internal symbols from barrels) is COMPLETE.

Phase 30 (Framework MFE API cleanup) is COMPLETE.

### Completed Work

| Area | Description | Status |
|------|-------------|--------|
| Phases 1-26 | Type system, registry, contracts, isolation, mediation, domains, loading, errors, framework plugin, React integration, bridges, shadow DOM, caching, constants, dynamic registration, abstract class layers, cross-runtime routing, lifecycle actions, callback injection, container providers, Flux compliance | COMPLETE |
| Phase 27 | Move React-dependent components (RefContainerProvider, ExtensionDomainSlot) to @hai3/react; zero React dependencies in @hai3/screensets | COMPLETE |
| Phase 28 | Clean up ScreensetsRegistryConfig (remove test-only APIs, internal collaborator injection); move error callback to per-domain `registerDomain` | COMPLETE |
| Phase 29 | Remove ~43 leaked internals from public barrels; simplify `executeActionsChain` to `Promise<void>`; slim `TypeSystemPlugin` to 7 methods; slim `ChildMfeBridge` (remove `entryTypeId`, `subscribeToAllProperties`); remove `preload()` from `MfeHandler`; provide handlers via config only; update specs and design docs | COMPLETE |
| Phase 31 | React API completion: MFE re-exports, `useDomainExtensions` export chain fix, unused type removal, depcruiser + ESLint layer enforcement, `MfeBridgeFactory` barrel export | COMPLETE |

### Current Construction Patterns

| Component | Pattern |
|-----------|---------|
| GtsPlugin | Singleton constant (`gtsPlugin`) |
| ScreensetsRegistry | Factory-with-cache (`screensetsRegistryFactory`) |
| MfeStateContainer | Internal construction by `DefaultMountManager` |

---

## Phase 30: Framework MFE API Cleanup

**Goal**: The `@hai3/framework` MFE public API exports ~30 symbols, most with zero consumer usage. Remove unused components, redundant actions, and trivial wrappers. Add missing `@hai3/screensets` re-exports so `@hai3/react` never imports from screensets directly (layering principle: L3 imports L2, not L1).

### 30.1 Remove Unused Vanilla DOM Components

Delete the following files entirely:
- `packages/framework/src/plugins/microfrontends/components/MfeErrorBoundary.ts`
- `packages/framework/src/plugins/microfrontends/components/MfeLoadingIndicator.ts`
- `packages/framework/src/plugins/microfrontends/components/ShadowDomContainer.ts`
- `packages/framework/src/plugins/microfrontends/components/index.ts` (entire `components/` directory)

Remove associated config types: `MfeErrorBoundaryConfig`, `MfeLoadingIndicatorConfig`, `ShadowDomContainerConfig`.

Remove all re-exports of these symbols from:
- `packages/framework/src/plugins/microfrontends/index.ts`
- `packages/framework/src/plugins/index.ts`
- `packages/framework/src/index.ts`

- [x] 30.1.1 Delete the `components/` directory and all 4 files.
- [x] 30.1.2 Remove component and config type exports from barrel files.

**Traceability**: Proposal -- these are unused placeholder components. `ShadowDomContainer` duplicates `createShadowRoot` + `injectCssVariables` from screensets. The component files themselves note "React-based equivalents should be in @hai3/react".

### 30.2 Remove Domain Factory Functions

Delete `packages/framework/src/plugins/microfrontends/base-domains.ts` entirely. The JSON domain definitions and factory functions (`createSidebarDomain()`, `createPopupDomain()`, `createScreenDomain()`, `createOverlayDomain()`) are trivial wrappers with zero consumer usage. Tests that need domain JSON constants can import from `gts/loader.ts` directly.

- [x] 30.2.1 Delete `base-domains.ts` entirely.
- [x] 30.2.2 Remove `base-domains` exports from barrel files (`packages/framework/src/plugins/microfrontends/index.ts`, `packages/framework/src/plugins/index.ts`, and the top-level `packages/framework/src/index.ts` barrel).

**Traceability**: Proposal -- unnecessary public API surface; consumers use domain JSON constants directly.

### 30.3 Remove Redundant Domain Registration Actions

Remove `registerDomain()` and `unregisterDomain()` action functions from `packages/framework/src/plugins/microfrontends/actions.ts`. Remove their payload types (`RegisterDomainPayload`, `UnregisterDomainPayload`). Remove from barrel exports and from the plugin's `provides.actions`. Remove the corresponding effects in `packages/framework/src/plugins/microfrontends/effects.ts` (domain registration/unregistration event handlers). Remove event augmentation entries for `mfe/registerDomainRequested` and `mfe/unregisterDomainRequested`. Remove `MfeEvents.RegisterDomainRequested` and `MfeEvents.UnregisterDomainRequested` from constants.

Reason: these actions do not update the store slice -- they proxy to `screensetsRegistry.registerDomain()` with error logging. Consumers should call `app.screensetsRegistry.registerDomain()` directly.

- [x] 30.3.1 Remove `registerDomain()` and `unregisterDomain()` from `actions.ts`.
- [x] 30.3.2 Remove `RegisterDomainPayload` and `UnregisterDomainPayload` types.
- [x] 30.3.3 Remove domain registration/unregistration effects from `effects.ts`. This includes the `RegisterDomainRequested` and `UnregisterDomainRequested` event subscriptions in `initMfeEffects` AND their corresponding cleanup entries in the returned cleanup function.
- [x] 30.3.4 Remove `MfeEvents.RegisterDomainRequested` and `MfeEvents.UnregisterDomainRequested` from constants.
- [x] 30.3.5 Remove event augmentation entries for domain registration events.
- [x] 30.3.6 Remove from barrel exports and plugin's `provides.actions`.

**Traceability**: Proposal -- domain registration is synchronous; Flux event/effect/slice round-trip adds no value. Direct `screensetsRegistry.registerDomain()` is sufficient.

### 30.4 Remove `preloadExtension` Action

Remove `preloadExtension()` from `packages/framework/src/plugins/microfrontends/actions.ts`. Remove from barrel exports and plugin's `provides.actions`.

Reason: `preloadExtension()` is identical to `loadExtension()` (both call `HAI3_ACTION_LOAD_EXT`); the only difference is `console.error` vs `console.warn` on failure.

- [x] 30.4.1 Remove `preloadExtension()` from `actions.ts`.
- [x] 30.4.2 Remove from barrel exports and plugin's `provides.actions`.
- [x] 30.4.3 Update the `onInit` debug log in `packages/framework/src/plugins/microfrontends/index.ts` (line ~124) that prints "MFE actions available: loadExtension, preloadExtension, mountExtension, unmountExtension" -- remove `preloadExtension` from the list.

**Traceability**: Proposal -- duplicate of `loadExtension()`. Consumers call `loadExtension()` for both explicit load and preload.

### 30.5 Add Missing Screensets Re-Exports to Framework

**Layering principle**: Framework (L2) must fully cover screensets (L1) so consumers never need a direct `@hai3/screensets` import. Currently `@hai3/react` imports these from screensets directly:
- `ChildMfeBridge` (type)
- `ParentMfeBridge` (type)
- `ScreensetsRegistry` (abstract class)
- `ContainerProvider` (class)
- `Extension` (type)

Additionally, ALL public screensets exports must be re-exported from framework. Verify and add re-exports for: `ExtensionDomain`, `MfeHandler`, `ActionsChain`, `Action`, `SharedProperty`, `LifecycleStage`, `LifecycleHook`, `MfeEntryLifecycle`, `MfeEntry`, `MfeEntryMF`, `JSONSchema`, `ValidationError`, `ValidationResult`, `TypeSystemPlugin`, `ScreensetsRegistryConfig`, `screensetsRegistryFactory`, `ScreensetsRegistryFactory`, `LoadExtPayload`, `MountExtPayload`, `UnmountExtPayload`, `createShadowRoot`, `injectCssVariables`, `HAI3_ACTION_LOAD_EXT`, `HAI3_ACTION_MOUNT_EXT`, `HAI3_ACTION_UNMOUNT_EXT`.

Then update `packages/react/src/` imports to use `@hai3/framework` instead of `@hai3/screensets`.

Note: This task covers MFE-related screensets exports only. Non-MFE screensets exports are already re-exported by framework.

- [x] 30.5.1 Add re-exports of all public `@hai3/screensets` MFE symbols from `packages/framework/src/index.ts`.
- [x] 30.5.2 Update all `packages/react/src/` imports to use `@hai3/framework` instead of `@hai3/screensets`.

**Traceability**: Proposal -- layering principle: L3 (@hai3/react) imports from L2 (@hai3/framework), never from L1 (@hai3/screensets).

### 30.6 Update Framework Tests

Update tests that reference removed symbols. Delete or update tests for:
- Removed components (`MfeErrorBoundary`, `MfeLoadingIndicator`, `ShadowDomContainer`)
- Removed domain factory functions (`createSidebarDomain`, etc.)
- Removed domain registration actions (`registerDomain`, `unregisterDomain`)
- Removed `preloadExtension` action

- [x] 30.6.1 Delete or update tests referencing removed components.
- [x] 30.6.2 Delete or update tests referencing removed domain factories.
- [x] 30.6.3 Delete or update tests referencing removed domain registration actions/effects.
- [x] 30.6.4 Delete or update tests referencing `preloadExtension`.

**Traceability**: Tests must compile and pass after symbol removal.

### 30.7 Validation

- [x] 30.7.1 Run `npm run type-check` -- must pass.
- [x] 30.7.2 Run `npm run test` -- all tests pass.
- [x] 30.7.3 Run `npm run build` -- must pass.
- [x] 30.7.4 Run `npm run lint` -- must pass.

### 30.8 Spec and Design Doc Alignment

- [x] 30.8.1 Remove references to deleted symbols (`MfeErrorBoundary`, `ShadowDomContainer`, `registerDomain()` action event bus section) from spec and design docs.

**Traceability**: Proposal -- design docs represent target state only; stale references to removed symbols must be cleaned up.

---

## Phase 31: React API Completion & Tooling Enforcement

**Goal**: Close layering gaps in `@hai3/react`, fix unreachable exports, remove unused type bloat, and enforce layer boundaries via dependency-cruiser.

### 31.1 React MFE Re-Exports (Layering Compliance)

`@hai3/react` (L3) re-exports all non-MFE framework symbols but zero MFE symbols. Consumers using `@hai3/react` must fall through to `@hai3/framework` for MFE functionality, violating the principle that each layer fully covers the layer below.

Add re-exports from `@hai3/framework` to `packages/react/src/index.ts` for:

**Plugin factories:**
- `microfrontends`
- `mock`

**Action functions:**
- `loadExtension`, `mountExtension`, `unmountExtension`, `registerExtension`, `unregisterExtension`

**Selectors:**
- `selectExtensionState`, `selectRegisteredExtensions`, `selectExtensionError`

**Domain constants:**
- `HAI3_POPUP_DOMAIN`, `HAI3_SIDEBAR_DOMAIN`, `HAI3_SCREEN_DOMAIN`, `HAI3_OVERLAY_DOMAIN`

**Action constants:**
- `HAI3_ACTION_LOAD_EXT`, `HAI3_ACTION_MOUNT_EXT`, `HAI3_ACTION_UNMOUNT_EXT`

**Types (re-exported as types):**
- `ChildMfeBridge`, `ParentMfeBridge`, `Extension`, `ExtensionDomain`, `ActionsChain`, `Action`, `SharedProperty`, `LifecycleStage`, `LifecycleHook`, `MfeEntryLifecycle`, `MfeEntry`, `MfeEntryMF`, `JSONSchema`, `ValidationError`, `ValidationResult`, `LoadExtPayload`, `MountExtPayload`, `UnmountExtPayload`, `ScreensetsRegistryConfig`, `TypeSystemPlugin`

**Abstract classes:**
- `MfeHandler`, `ScreensetsRegistry`, `ScreensetsRegistryFactory`, `ContainerProvider`

**Factory instance:**
- `screensetsRegistryFactory`

**Utilities:**
- `createShadowRoot`, `injectCssVariables`

**MFE plugin types (re-exported as types):**
- `MfeState`, `ExtensionRegistrationState`, `RegisterExtensionPayload`, `UnregisterExtensionPayload`

- [x] 31.1.1 Add all MFE symbol re-exports from `@hai3/framework` to `packages/react/src/index.ts`. Note: `registerExtension` and `unregisterExtension` are currently missing from `packages/framework/src/plugins/index.ts` and `packages/framework/src/index.ts` (despite being exported from `microfrontends/index.ts`). Add them to both framework barrels first, then re-export from react.
- [x] 31.1.2 Re-export the `EventBus` type from `@hai3/framework` (add `export type { EventBus } from '@hai3/state';` to the framework barrel). Then update `packages/react/src/index.ts` to import `EventBus` from `@hai3/framework` instead of `@hai3/state`, eliminating the direct L1 import that would violate the `react-no-sdk` depcruiser rule added in 31.4.

**Traceability**: Proposal -- layering principle: L3 (`@hai3/react`) must fully cover L2 (`@hai3/framework`). Sub-task 31.1.2 prevents a `react-no-sdk` violation for the `EventBus` type import.

### 31.2 Fix `useDomainExtensions` Export Gap

`useDomainExtensions` hook is defined in `packages/react/src/mfe/hooks/index.ts` but is NOT re-exported from `packages/react/src/mfe/index.ts`. The hook is unreachable from the main barrel.

- [x] 31.2.1 Add `useDomainExtensions` export to `packages/react/src/mfe/index.ts`.
- [x] 31.2.2 Verify the hook is reachable from `packages/react/src/index.ts` via the `mfe/index.ts` barrel.

**Traceability**: Proposal -- `useDomainExtensions` scenario requires the hook to be importable from `@hai3/react`.

### 31.3 Remove Unused React Type Exports

Remove 8 unused type exports from `packages/react/src/types.ts` and their re-exports from `packages/react/src/index.ts`. Before deletion, grep the entire repo (excluding `node_modules`) for each type name to confirm zero usage outside its own declaration and re-export. If any type has non-trivial consumers, do NOT remove it -- flag it for review instead.

- `UseLanguageReturn` -- no `useLanguage` hook exists
- `UseMenuReturn` -- no `useMenu` hook exists
- `UseScreenReturn` -- no `useScreen` hook exists
- `UseScreensetReturn` -- no `useScreenset` hook exists
- `UsePopupReturn` -- no `usePopup` hook exists
- `UseOverlayReturn` -- no `useOverlay` hook exists
- `HAI3ProviderComponent` -- trivial alias `React.FC<HAI3ProviderProps>`, unused
- `AppRouterComponent` -- trivial alias `React.FC<AppRouterProps>`, unused

- [x] 31.3.1 Remove the 8 type definitions from `packages/react/src/types.ts`.
- [x] 31.3.2 Remove the 8 type re-exports from `packages/react/src/index.ts`.

**Traceability**: Proposal -- public API surface must not contain phantom types for hooks that do not exist.

### 31.4 Fix Depcruiser Layer Enforcement

**Prerequisite**: 31.1 must be complete before 31.4. The `react-no-sdk` rule (31.4.4) forbids `@hai3/react` from importing SDK packages, but `packages/react/src/index.ts` currently imports `EventBus` from `@hai3/state`. Task 31.1.2 eliminates this direct L1 import by routing it through `@hai3/framework`.

**Bug fix 1 -- Stale `layout` reference**: The `screensets` package was renamed from `layout`. Two depcruiser config files still reference the old name.

- [x] 31.4.1 In `internal/depcruise-config/react.cjs` line 26: change `state|layout|api|i18n` to `state|screensets|api|i18n`.
- [x] 31.4.2 In `internal/depcruise-config/sdk.cjs` line 20: change `state|layout|api|i18n` to `state|screensets|api|i18n`.

**Bug fix 2 -- Missing root layer rules**: The root `.dependency-cruiser.cjs` is missing two layer enforcement rules.

- [x] 31.4.3 Add `framework-no-react` rule: error severity, from `^packages/framework/` to `^packages/react/`. Comment: "LAYER VIOLATION: Framework (L2) cannot import React (L3)."
- [x] 31.4.4 Add `react-no-sdk` rule: error severity, from `^packages/react/` to `^packages/(state|screensets|api|i18n)/`. Comment: "LAYER VIOLATION: React (L3) cannot import SDK (L1) directly. Use @hai3/framework re-exports."

**Traceability**: Proposal -- layer enforcement must match the actual package names and enforce all layer boundaries.

### 31.5 Validation

- [x] 31.5.1 Run `npm run type-check` -- must pass.
- [x] 31.5.2 Run `npm run test` -- all tests pass.
- [x] 31.5.3 Run `npm run build` -- must pass.
- [x] 31.5.4 Run `npm run lint` -- must pass.
- [x] 31.5.5 Run dependency-cruiser validation -- must pass with new rules.

### 31.6 ESLint Layer Enforcement in Root Config

**Problem**: The root `eslint.config.js` blanket-disables `@typescript-eslint/no-restricted-imports` for SDK, framework, and react packages (lines 34-90). This removes the app-layer rules (which would incorrectly block packages from importing lower layers), but it also means `npm run lint` (root) does NOT enforce any layer boundaries for packages. Only per-package lint scripts (`lint:react`, `lint:framework`) enforce them via `internal/eslint-config/*.ts`.

Additionally, the root config defines monorepo boundary patterns via the base `no-restricted-imports` rule for `packages/**/*` (lines 117-139). The base rule does NOT catch `import type { X } from 'y'` statements. This block must be converted to `@typescript-eslint/no-restricted-imports` (which catches all import forms) and moved before the layer-specific blocks so it serves as a catch-all for packages without layer-specific rules (CLI, studio, uicore).

**Fix**: In each SDK, framework, and react config block, REPLACE `'@typescript-eslint/no-restricted-imports': 'off'` with `'@typescript-eslint/no-restricted-imports': ['error', { patterns: [...] }]` containing BOTH layer-specific patterns AND monorepo boundary patterns. Then convert the `packages/**/*` block from base `no-restricted-imports` to `@typescript-eslint/no-restricted-imports` and move it BEFORE the layer-specific blocks. In ESLint flat config, for the same rule key the LAST matching config wins, so layer blocks override the catch-all for SDK/framework/react files while CLI, studio, and uicore files inherit monorepo boundary enforcement from the catch-all. Also remove `@typescript-eslint/no-restricted-imports: 'off'` from the CLI block so it inherits the catch-all patterns.

- [x] 31.6.1 **SDK packages block** (lines 34-46): Replace `'@typescript-eslint/no-restricted-imports': 'off'` with `'@typescript-eslint/no-restricted-imports': ['error', { patterns }]`:
  - `@hai3/*` -- "SDK VIOLATION: SDK packages cannot import other @hai3 packages."
  - `react`, `react-dom`, `react/*` -- "SDK VIOLATION: SDK packages cannot import React."
  - `@hai3/*/src/**` -- "MONOREPO VIOLATION: Import from package root, not internal paths."
  - `@/*` -- "PACKAGE VIOLATION: Use relative imports within packages."

- [x] 31.6.2 **Framework block** (lines 51-59, non-effects files): Replace `'@typescript-eslint/no-restricted-imports': 'off'` with `'@typescript-eslint/no-restricted-imports': ['error', { patterns }]`:
  - `@hai3/react` -- "FRAMEWORK VIOLATION: Framework cannot import @hai3/react (circular dependency)."
  - `@hai3/uikit`, `@hai3/uikit/*` -- "FRAMEWORK VIOLATION: Framework cannot import @hai3/uikit."
  - `react`, `react-dom`, `react/*` -- "FRAMEWORK VIOLATION: Framework cannot import React."
  - `@hai3/*/src/**` -- "MONOREPO VIOLATION: Import from package root, not internal paths."
  - `@/*` -- "PACKAGE VIOLATION: Use relative imports within packages."

- [x] 31.6.3 **Framework effects block** (lines 62-69): Replace `'@typescript-eslint/no-restricted-imports': 'off'` with the same `@typescript-eslint/no-restricted-imports` patterns as 31.6.2 (effects files keep `no-restricted-syntax` Flux rules but need layer enforcement too).

- [x] 31.6.4 **Framework action files in effects block** (lines 72-79): Replace `'@typescript-eslint/no-restricted-imports': 'off'` with the same `@typescript-eslint/no-restricted-imports` patterns as 31.6.2.

- [x] 31.6.5 **React block** (lines 81-90): Replace `'@typescript-eslint/no-restricted-imports': 'off'` with `'@typescript-eslint/no-restricted-imports': ['error', { patterns }]`:
  - `@hai3/state`, `@hai3/state/*` -- "REACT VIOLATION: Import from @hai3/framework instead."
  - `@hai3/screensets`, `@hai3/screensets/*` -- "REACT VIOLATION: Import from @hai3/framework instead."
  - `@hai3/api`, `@hai3/api/*` -- "REACT VIOLATION: Import from @hai3/framework instead."
  - `@hai3/i18n`, `@hai3/i18n/*` -- "REACT VIOLATION: Import from @hai3/framework instead."
  - `@hai3/*/src/**` -- "MONOREPO VIOLATION: Import from package root, not internal paths."
  - `@/*` -- "PACKAGE VIOLATION: Use relative imports within packages."
  Note: `@hai3/i18n` IS restricted. The react package no longer imports directly from `@hai3/i18n` -- the `Language` enum is re-exported from `@hai3/framework` (Phase 31.1), and react already imports it from there.

- [x] 31.6.6 **Convert and move `packages/**/*` block** (lines 117-139): Convert the base `no-restricted-imports` rule to `@typescript-eslint/no-restricted-imports` (same patterns: `@hai3/*/src/**` and `@/*`). Move the block to appear BEFORE the SDK/framework/react layer blocks (right after the monorepo ignores block). In ESLint flat config, for the same rule key the LAST matching config wins, so the layer-specific blocks (31.6.1-31.6.5) override this catch-all for their files. CLI, studio, and uicore files -- which have no layer-specific `@typescript-eslint/no-restricted-imports` -- inherit the monorepo boundary enforcement from this catch-all.

- [x] 31.6.7 **Remove `@typescript-eslint/no-restricted-imports: 'off'` from the CLI block** (lines 92-100): Delete the `'@typescript-eslint/no-restricted-imports': 'off'` line from the CLI config block. The CLI block appears AFTER the `packages/**/*` catch-all and would override it with `'off'`, nullifying monorepo boundary enforcement for CLI files. The CLI block must keep `'no-restricted-syntax': 'off'` but drop the restricted-imports override so CLI files inherit the catch-all patterns.

- [x] 31.6.8 Run `npm run lint` -- must pass with the new layer enforcement rules.

**Traceability**: Proposal -- "ESLint rules enforce that effects files cannot call `executeActionsChain()`" (Flux Architecture Compliance section). Layer enforcement is the broader principle: the per-package configs define layer rules, but the root config must enforce them too so `npm run lint` catches violations.

### 31.7 Fix Missing `MfeBridgeFactory` Barrel Export

**Problem**: `MfeBridgeFactory` is documented as a public abstract class in `registry-runtime.md` (Export Policy, line 451) and is confirmed as a main barrel re-export (line 468). The class IS exported from the handler sub-barrel (`handler/index.ts` line 13), but is NOT propagated to `mfe/index.ts` -- only `MfeHandler` is re-exported from `./handler/types` (line 51). This makes `MfeBridgeFactory` unreachable from `@hai3/screensets`, `@hai3/framework`, and `@hai3/react`.

Consumers who extend `MfeHandler` must also extend `MfeBridgeFactory` (the `bridgeFactory` property on `MfeHandler` is typed as `MfeBridgeFactory`). Without the barrel export, consumers cannot import the abstract class from the public API.

**Fix**: Add `MfeBridgeFactory` to each barrel in the export chain.

- [x] 31.7.1 Add `MfeBridgeFactory` to the `mfe/index.ts` barrel export alongside `MfeHandler`:
  - In `packages/screensets/src/mfe/index.ts` line 51, change `export { MfeHandler } from './handler/types';` to `export { MfeHandler, MfeBridgeFactory } from './handler/types';`.

- [x] 31.7.2 Add `MfeBridgeFactory` to the top-level `@hai3/screensets` barrel:
  - In `packages/screensets/src/index.ts` line 100, change `export { MfeHandler } from './mfe';` to `export { MfeHandler, MfeBridgeFactory } from './mfe';`.

- [x] 31.7.3 Add `MfeBridgeFactory` to the `@hai3/framework` barrel re-export:
  - In `packages/framework/src/index.ts` line 86, add `MfeBridgeFactory` to the `MfeHandler` abstract class re-export block from `@hai3/screensets`.

- [x] 31.7.4 Add `MfeBridgeFactory` to the `@hai3/react` barrel re-export:
  - In `packages/react/src/index.ts` line 430, add `MfeBridgeFactory` to the MFE abstract classes re-export block from `@hai3/framework`.

- [x] 31.7.5 Run `npm run type-check` -- must pass.
- [x] 31.7.6 Run `npm run build` -- must pass.

**Traceability**: Design doc `registry-runtime.md` Export Policy -- `MfeBridgeFactory` is listed as a public abstract class that must be re-exported from the main `@hai3/screensets` barrel and propagated through the layer chain.
