# Implementation Tasks

## Status

All MFE implementation tasks through Phase 32 are COMPLETE (444 tests passing: 367 screensets + 61 framework + 16 react, 4 tests skipped identifying validation gaps).

Phase 27 (React component migration) is COMPLETE. @hai3/screensets has zero React dependencies.

Phase 28 (ScreensetsRegistryConfig cleanup and test-only API removal) is COMPLETE.

Phase 29 (Public API cleanup — remove internal symbols from barrels) is COMPLETE.

Phase 30 (Framework MFE API cleanup) is COMPLETE.

### Upcoming Work

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 32 | MFE Infrastructure: base `ExtensionDomain` constants, `MfeBridgeFactoryDefault` extraction, entry type validation | COMPLETE |
| Phase 33 | Module Federation Build Configuration: Vite MF plugin, MFE remote package, `MfeEntryLifecycle` class, `MfeEntryMF` entries, shared deps | PENDING |
| Phase 34 | Wire MFEs into Host App: host MF config, handler registration, domain + extension registration, remove legacy screenset API | PENDING |

### Completed Work

| Area | Description | Status |
|------|-------------|--------|
| Phases 1-26 | Type system, registry, contracts, isolation, mediation, domains, loading, errors, framework plugin, React integration, bridges, shadow DOM, caching, constants, dynamic registration, abstract class layers, cross-runtime routing, lifecycle actions, callback injection, container providers, Flux compliance | COMPLETE |
| Phase 27 | Move React-dependent components (RefContainerProvider, ExtensionDomainSlot) to @hai3/react; zero React dependencies in @hai3/screensets | COMPLETE |
| Phase 28 | Clean up ScreensetsRegistryConfig (remove test-only APIs, internal collaborator injection); move error callback to per-domain `registerDomain` | COMPLETE |
| Phase 29 | Remove ~43 leaked internals from public barrels; simplify `executeActionsChain` to `Promise<void>`; slim `TypeSystemPlugin` to 7 methods; slim `ChildMfeBridge` (remove `entryTypeId`, `subscribeToAllProperties`); remove `preload()` from `MfeHandler`; provide handlers via config only; update specs and design docs | COMPLETE |
| Phase 30 | Framework MFE API cleanup: remove unused vanilla DOM components, domain factory functions, redundant domain registration actions, `preloadExtension` duplicate; add missing screensets re-exports to framework; update framework tests; spec/design doc alignment | COMPLETE |
| Phase 31 | React API completion: MFE re-exports, `useDomainExtensions` export chain fix, unused type removal, depcruiser + ESLint layer enforcement, `MfeBridgeFactory` barrel export | COMPLETE |

### Current Construction Patterns

| Component | Pattern |
|-----------|---------|
| GtsPlugin | Singleton constant (`gtsPlugin`) |
| ScreensetsRegistry | Factory-with-cache (`screensetsRegistryFactory`) |
| MfeStateContainer | Internal construction by `DefaultMountManager` |

---

## Phase 32: MFE Infrastructure (Framework-Level Domain Constants, Bridge Factory Extraction, Entry Type Validation)

**Goal**: Prepare infrastructure needed before Module Federation remotes can be wired. Define base `ExtensionDomain` constants for the 4 extension domains in `@hai3/framework`, extract `MfeBridgeFactoryDefault` to its own file, and add entry type validation to the handler registry so that registering an extension with an entry type that no concrete handler recognises is rejected early.

### 32.1 Base ExtensionDomain Constants in `@hai3/framework`

The 4 extension domains (screen, sidebar, popup, overlay) are well-known. They must be defined as `ExtensionDomain` constant objects in `@hai3/framework` so the host application can import and register them without hand-authoring JSON. Each constant is a plain object literal satisfying the `ExtensionDomain` interface.

**Relationship to existing string constants**: The existing `HAI3_SCREEN_DOMAIN`, `HAI3_SIDEBAR_DOMAIN`, `HAI3_POPUP_DOMAIN`, `HAI3_OVERLAY_DOMAIN` string constants (in `constants.ts`) remain unchanged -- they contain domain ID strings used as action targets in `executeActionsChain()` calls (e.g., `action.target = HAI3_SCREEN_DOMAIN`). The new `screenDomain`, `sidebarDomain`, `popupDomain`, `overlayDomain` are full `ExtensionDomain` objects whose `.id` fields reference the same domain ID strings as the existing constants. Consumers use `HAI3_SCREEN_DOMAIN` for action targets and `screenDomain` for `registerDomain()`.

Note: Phase 30.2 deleted the original `base-domains.ts` (factory functions with zero consumer usage). This task creates a new file at the same path with `ExtensionDomain` constant objects -- a fundamentally different pattern. Barrel exports removed in Phase 30.2 must be re-added.

Create file `packages/framework/src/plugins/microfrontends/base-domains.ts` containing:

- `screenDomain: ExtensionDomain` -- id `gts.hai3.mfes.ext.domain.v1~hai3.screensets.layout.screen.v1`, `actions: [HAI3_ACTION_LOAD_EXT, HAI3_ACTION_MOUNT_EXT]` (2 actions, NO `HAI3_ACTION_UNMOUNT_EXT`), `extensionsActions: []`, `sharedProperties: []`, `defaultActionTimeout: 30000`, `lifecycleStages` and `extensionsLifecycleStages` populated with the 4 default stage instance IDs (`init`, `activated`, `deactivated`, `destroyed`), `lifecycle: undefined`.
- `sidebarDomain: ExtensionDomain` -- id `gts.hai3.mfes.ext.domain.v1~hai3.screensets.layout.sidebar.v1`, `actions: [HAI3_ACTION_LOAD_EXT, HAI3_ACTION_MOUNT_EXT, HAI3_ACTION_UNMOUNT_EXT]` (3 actions), same shape.
- `popupDomain: ExtensionDomain` -- id `gts.hai3.mfes.ext.domain.v1~hai3.screensets.layout.popup.v1`, 3 actions, same shape.
- `overlayDomain: ExtensionDomain` -- id `gts.hai3.mfes.ext.domain.v1~hai3.screensets.layout.overlay.v1`, 3 actions, same shape.

Export all 4 from the barrel chain: `microfrontends/index.ts` -> `plugins/index.ts` -> `framework/src/index.ts`.

Re-export from `@hai3/react` barrel (`packages/react/src/index.ts`).

- [x] 32.1.1 Create `packages/framework/src/plugins/microfrontends/base-domains.ts` with the 4 `ExtensionDomain` constants. Import `ExtensionDomain` type from `@hai3/screensets`. Import `HAI3_ACTION_LOAD_EXT`, `HAI3_ACTION_MOUNT_EXT`, `HAI3_ACTION_UNMOUNT_EXT` from `@hai3/screensets`.
- [x] 32.1.2 Export the 4 domain constants from `packages/framework/src/plugins/microfrontends/index.ts`.
- [x] 32.1.3 Ensure domain constants are reachable from `packages/framework/src/plugins/index.ts` and `packages/framework/src/index.ts`.
- [x] 32.1.4 Re-export domain constants from `packages/react/src/index.ts`.
- [x] 32.1.5 Update `packages/framework/src/plugins/microfrontends/constants.ts` (or equivalent) if `HAI3_SCREEN_DOMAIN`, `HAI3_SIDEBAR_DOMAIN`, `HAI3_POPUP_DOMAIN`, `HAI3_OVERLAY_DOMAIN` string constants already exist -- ensure they use the same IDs as the new domain objects. If they reference old factory functions that were deleted in Phase 30, remove those references.

**Traceability**: Design doc `mfe-ext-lifecycle-actions.md` -- Domain Action Support Matrix (screen: 2 actions, sidebar/popup/overlay: 3 actions). Design doc `registry-runtime.md` -- Export Policy (framework re-exports all public screensets symbols).

### 32.2 Extract `MfeBridgeFactoryDefault` to Separate File

`MfeBridgeFactoryDefault` currently lives inside `packages/screensets/src/mfe/handler/mf-handler.ts` alongside `MfeHandlerMF`. It is a distinct class with a focused responsibility (bridge creation/disposal). Extract it to its own file for better cohesion and to match the "one class per file" pattern used by all other collaborators.

- [x] 32.2.1 Create `packages/screensets/src/mfe/handler/mfe-bridge-factory-default.ts` containing the `MfeBridgeFactoryDefault` class. Import `MfeBridgeFactory`, `ChildMfeBridge` from `./types`. Import `ChildMfeBridgeImpl` from `../bridge/ChildMfeBridge`.
- [x] 32.2.2 Remove `MfeBridgeFactoryDefault` class from `mf-handler.ts`. Update `mf-handler.ts` to import `MfeBridgeFactoryDefault` from `./mfe-bridge-factory-default`.
- [x] 32.2.3 Update `packages/screensets/src/mfe/handler/index.ts` barrel to re-export `MfeBridgeFactoryDefault` from `./mfe-bridge-factory-default` (the handler sub-barrel already exports it per the Export Policy).
- [x] 32.2.4 Verify no other files import `MfeBridgeFactoryDefault` from `./mf-handler` directly. If any do, update them.
- [x] 32.2.5 Update design docs and proposal to reflect the new file location: In `proposal.md` line 184, change `mf-handler.ts` description from "MfeHandlerMF (Module Federation handler) and MfeBridgeFactoryDefault (bridge factory for MfeHandlerMF)" to "MfeHandlerMF (Module Federation handler)". In `design/mfe-loading.md`, update any references to `MfeBridgeFactoryDefault` living in `mf-handler.ts` (e.g., the `ManifestCache` comment at Decision 12 and the code block header at line ~226).

**Traceability**: Design doc `registry-runtime.md` -- Export Policy (handler sub-barrel exports `MfeBridgeFactoryDefault`; concrete class, NOT in main barrel).

### 32.3 Entry Type Validation in Handler Registry

When `registerExtension()` validates an extension, the system currently checks contract matching, type hierarchy, and GTS instance validation. However, it does NOT verify that the extension's `entry` type ID is handleable by any registered handler. If no handler can handle the entry type, the error surfaces only at load time (lazy). This should be caught at registration time.

Add entry type validation: during `registerExtension()`, after GTS validation succeeds, iterate the registered `MfeHandler` instances and call `handler.canHandle(entryTypeId)`. If no handler matches, throw `MfeLoadError` (or a new `EntryTypeNotHandledError` extending `MfeError`) with a message indicating the entry type and the list of registered handler base type IDs.

This validation is in `DefaultScreensetsRegistry.registerExtension()` (or its delegate `DefaultExtensionManager`), NOT in the public abstract class.

- [x] 32.3.1 In `DefaultScreensetsRegistry` (or its delegate), add entry type validation after contract validation. The check iterates `this.handlers` (the registered `MfeHandler[]`) and calls `canHandle(extension.entry)`. If no handler matches and `this.handlers.length > 0`, throw an error. If `this.handlers.length === 0`, skip the check (no handlers registered means loading will fail later anyway -- this is valid during early registration before handlers are configured).
- [x] 32.3.2 Write unit test: register a handler for `MfeEntryMF`, then attempt to register an extension with an entry type ID that does NOT derive from `MfeEntryMF` -- expect the registration to throw.
- [x] 32.3.3 Write unit test: register a handler for `MfeEntryMF`, then register an extension with a valid `MfeEntryMF`-derived entry type ID -- expect success.
- [x] 32.3.4 Write unit test: register NO handlers, then register an extension -- expect success (validation skipped when no handlers).

**Traceability**: Proposal requirement -- "entry type validation: the screensets package should throw when an extension is registered with an entry type that doesn't match any registered concrete handler type".

### 32.4 Validation

- [x] 32.4.1 Run `npm run type-check` -- must pass.
- [x] 32.4.2 Run `npm run test` -- all tests pass.
- [x] 32.4.3 Run `npm run build` -- must pass.
- [x] 32.4.4 Run `npm run lint` -- must pass.

---

## Phase 33: Module Federation Build Configuration (MFE Remotes)

**Goal**: Convert the demo screenset into a real Module Federation 2.0 remote. Create a separate MFE package with its own Vite + Module Federation build config producing a `remoteEntry.js`. Create the `MfeEntryLifecycle` implementation (class-based). Create `mfe.json` with `MfeEntryMF` entries. Configure shared dependencies with `singleton: false` for React/react-dom.

### 33.0 Background

The repo uses Vite. The design docs mention `@originjs/vite-plugin-federation` as the Vite-compatible Module Federation plugin (see `mfe-loading.md` Decision 11: "Works with existing HAI3 Vite build (via `@originjs/vite-plugin-federation`)"). The demo screenset at `src/screensets/demo/` has 4 screens (HelloWorld, CurrentTheme, Profile, UIKitElements). For the initial MFE demo, convert ONE screen (HelloWorld) into an MFE remote to prove the pipeline end-to-end. Additional screens can be converted later.

Each MFE remote is a separate build artifact in `src/mfe_packages/<name>/`.

### 33.1 Install Module Federation Vite Plugin

- [ ] 33.1.1 Install `@originjs/vite-plugin-federation` as a dev dependency at the repo root: `npm install --save-dev @originjs/vite-plugin-federation`.
- [ ] 33.1.2 Verify the package installs without conflicts. If `@originjs/vite-plugin-federation` is incompatible with the current Vite version, use `@module-federation/vite` instead and adjust subsequent tasks accordingly.

**Traceability**: Design doc `mfe-loading.md` Decision 11 -- "Works with existing HAI3 Vite build (via `@originjs/vite-plugin-federation`)".

### 33.2 Create MFE Remote Package Structure

Create `src/mfe_packages/hello-world-mfe/` with the following structure:

```
src/mfe_packages/hello-world-mfe/
  vite.config.ts          # Vite config with Module Federation remote plugin
  src/
    lifecycle.tsx         # MfeEntryLifecycle implementation (class-based, .tsx because it renders JSX)
    HelloWorldScreen.tsx  # The actual React component (moved/adapted from demo screenset)
  mfe.json                # MfeEntryMF + MfManifest GTS instance definitions
  package.json            # Minimal package.json for the MFE build
  tsconfig.json           # TypeScript config extending root
```

- [ ] 33.2.1 Create `src/mfe_packages/hello-world-mfe/package.json` with: `name: "@hai3/hello-world-mfe"`, `private: true`, `type: "module"`, `scripts: { "dev": "vite --port 3001", "build": "vite build", "preview": "vite preview --port 3001" }`, `dependencies` including `react`, `react-dom` (same versions as root) and `@hai3/screensets` (the SDK package that defines MFE contracts -- `MfeEntryLifecycle`, `ChildMfeBridge`), `devDependencies` including `@vitejs/plugin-react`, `@originjs/vite-plugin-federation`, `vite`, `typescript`.
- [ ] 33.2.2 Create `src/mfe_packages/hello-world-mfe/tsconfig.json` extending `../../../tsconfig.json` with `compilerOptions.jsx: "react-jsx"` and appropriate `include`/`exclude`.

**Traceability**: Proposal -- "Each MFE must have a Module Federation build config producing a remoteEntry.js".

### 33.3 MFE Remote Vite Configuration

Create `src/mfe_packages/hello-world-mfe/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'helloWorldMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './lifecycle': './src/lifecycle.tsx',
      },
      shared: {
        react: { singleton: false, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: false, requiredVersion: '^19.0.0' },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
```

Key design decisions reflected:
- `singleton: false` for React and react-dom per design docs (instance isolation).
- `filename: 'remoteEntry.js'` -- standard Module Federation convention.
- `exposes` maps `'./lifecycle'` to the lifecycle module -- this is the `exposedModule` value referenced by `MfeEntryMF`.
- `name: 'helloWorldMfe'` -- this is the `remoteName` in the `MfManifest`.

- [ ] 33.3.1 Create `src/mfe_packages/hello-world-mfe/vite.config.ts` as described above.
- [ ] 33.3.2 Verify the config is valid by running `npm run build` inside the MFE package directory.

**Traceability**: Design doc `mfe-loading.md` Decision 11 -- `singleton: false` for React/react-dom. Design doc `mfe-manifest.md` -- `remoteName`, `remoteEntry`.

### 33.4 MFE Lifecycle Implementation (Class-Based)

Create `src/mfe_packages/hello-world-mfe/src/lifecycle.tsx`. This is the module exposed via Module Federation. It exports a class implementing `MfeEntryLifecycle`.

**CRITICAL**: The lifecycle MUST be a class, not a plain object or standalone functions. Per memory: "EVERY component MUST be a class."

```typescript
import { createRoot, type Root } from 'react-dom/client';
import type { MfeEntryLifecycle, ChildMfeBridge } from '@hai3/screensets';
import { HelloWorldScreen } from './HelloWorldScreen';

/**
 * Lifecycle implementation for the HelloWorld MFE remote.
 * Implements MfeEntryLifecycle with React rendering.
 */
class HelloWorldLifecycle implements MfeEntryLifecycle<ChildMfeBridge> {
  private root: Root | null = null;

  mount(container: Element, bridge: ChildMfeBridge): void {
    this.root = createRoot(container);
    this.root.render(
      // HelloWorldScreen receives bridge for communication
      <HelloWorldScreen bridge={bridge} />
    );
  }

  unmount(_container: Element): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

// Module Federation expects a default export or named export
// The handler calls moduleFactory() which returns the module,
// then validates it has mount/unmount.
// Export an instance of the lifecycle class.
export default new HelloWorldLifecycle();
```

Note: The file uses JSX, so it should be `lifecycle.tsx`. Update the `exposes` mapping in `vite.config.ts` accordingly.

- [ ] 33.4.1 Create `src/mfe_packages/hello-world-mfe/src/lifecycle.tsx` with a `HelloWorldLifecycle` class implementing `MfeEntryLifecycle<ChildMfeBridge>`. The class manages a React root internally. Export a singleton instance as default export. Note: MFE remotes are independent build artifacts outside the monorepo layer hierarchy. They import types directly from `@hai3/screensets` (the SDK package that defines the MFE contracts).
- [ ] 33.4.2 Create `src/mfe_packages/hello-world-mfe/src/HelloWorldScreen.tsx` -- adapt from `src/screensets/demo/screens/helloworld/HelloWorldScreen.tsx`. Simplify: remove screenset-specific imports (i18n, layout state). The component receives `bridge: ChildMfeBridge` as a prop and renders a minimal "Hello World from MFE" UI. It should demonstrate bridge usage (e.g., `bridge.domainId`, `bridge.instanceId`).
- [ ] 33.4.3 Update `vite.config.ts` exposes to `'./lifecycle': './src/lifecycle.tsx'` (note `.tsx` extension).

**Traceability**: Design doc `mfe-api.md` -- `MfeEntryLifecycle` interface (`mount(container, bridge)`, `unmount(container)`). Memory -- "EVERY component MUST be a class."

### 33.5 MFE Entry and Manifest JSON Definitions

Create `src/mfe_packages/hello-world-mfe/mfe.json` containing the GTS instance definitions for the `MfeEntryMF` and `MfManifest`.

```json
{
  "manifest": {
    "id": "gts.hai3.mfes.mfe.mf_manifest.v1~hai3.app.mfe.hello_world.manifest.v1",
    "remoteEntry": "http://localhost:3001/assets/remoteEntry.js",
    "remoteName": "helloWorldMfe",
    "sharedDependencies": [
      { "name": "react", "requiredVersion": "^19.0.0", "singleton": false },
      { "name": "react-dom", "requiredVersion": "^19.0.0", "singleton": false }
    ]
  },
  "entry": {
    "id": "gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~hai3.app.mfe.hello_world.v1",
    "requiredProperties": [],
    "actions": [],
    "domainActions": [],
    "manifest": "gts.hai3.mfes.mfe.mf_manifest.v1~hai3.app.mfe.hello_world.manifest.v1",
    "exposedModule": "./lifecycle"
  },
  "extension": {
    "id": "gts.hai3.mfes.ext.extension.v1~hai3.app.ext.hello_world_screen.v1",
    "domain": "gts.hai3.mfes.ext.domain.v1~hai3.screensets.layout.screen.v1",
    "entry": "gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~hai3.app.mfe.hello_world.v1"
  }
}
```

Key points:
- Entry ID uses `MfeEntryMF` schema: `gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~<instance>` (instance ID does NOT end with `~`).
- Manifest `remoteEntry` points to `http://localhost:3001/assets/remoteEntry.js` for development. The port matches the MFE dev server.
- `exposedModule: "./lifecycle"` matches the `exposes` key in `vite.config.ts`.
- Extension targets the screen domain.
- The `manifest` field on the entry is the manifest instance ID (a string reference). The manifest object itself will be registered separately or provided inline.

- [ ] 33.5.1 Create `src/mfe_packages/hello-world-mfe/mfe.json` as described above.
- [ ] 33.5.2 Verify the entry type ID conforms to the `MfeEntryMF` schema pattern: `gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~<vendor>.<package>.<namespace>.<type>.v<N>`.

**Traceability**: Design doc `mfe-entry-mf.md` -- MfeEntryMF type hierarchy, example instance. Design doc `type-system.md` -- Instance ID Convention (instance IDs do NOT end with `~`). Design doc `mfe-loading.md` Decision 11 -- `singleton: false` for React/react-dom.

### 33.6 Build and Verify Remote

- [ ] 33.6.1 Run the MFE build: `cd src/mfe_packages/hello-world-mfe && npm install && npm run build`. Verify `dist/assets/remoteEntry.js` is produced.
- [ ] 33.6.2 Start the MFE dev server: `npm run dev` (port 3001). Verify `http://localhost:3001/assets/remoteEntry.js` is accessible. (Manual verification step.)
- [ ] 33.6.3 Verify the `remoteEntry.js` file sets a global `helloWorldMfe` on the window object when loaded (this is how `MfeHandlerMF.getContainerFromWindow()` retrieves it).

**Traceability**: Design doc `mfe-loading.md` -- `loadRemoteContainer()` / `getContainerFromWindow()` expects `window[remoteName]`.

---

## Phase 34: Wire MFEs into Host App + Remove Legacy Screenset API

**Goal**: Configure the host application as a Module Federation host. Register `MfeHandlerMF` as the handler. Register base domains with `ContainerProvider`s. Register MFE extensions using the `MfeEntryMF` entries from `mfe.json`. Remove the legacy screenset registry and auto-discovery pattern. The host app loads MFE remotes via `MfeHandlerMF` at runtime.

### 34.1 Host App Module Federation Configuration

Update the root `vite.config.ts` to add Module Federation host configuration. The host does NOT expose any modules -- it only consumes remotes.

```typescript
import federation from '@originjs/vite-plugin-federation';

// Add to plugins array:
federation({
  name: 'host',
  remotes: {
    helloWorldMfe: 'http://localhost:3001/assets/remoteEntry.js',
  },
  shared: {
    react: { singleton: false, requiredVersion: '^19.0.0' },
    'react-dom': { singleton: false, requiredVersion: '^19.0.0' },
  },
}),
```

Note: The `remotes` configuration here is a build-time hint for the Module Federation plugin. At runtime, `MfeHandlerMF` loads remotes dynamically via script injection (not via the `remotes` config). The `remotes` config is needed primarily to tell the bundler about shared dependency resolution. If the Vite federation plugin supports runtime-only loading without build-time `remotes`, omit the `remotes` field and rely solely on `MfeHandlerMF`'s script injection.

- [ ] 34.1.1 Install `@originjs/vite-plugin-federation` as a dev dependency at the repo root (if not already done in 33.1.1).
- [ ] 34.1.2 Update `vite.config.ts` at the repo root to add the Module Federation host plugin. Add `shared` configuration for react and react-dom with `singleton: false`. Add `build.target: 'esnext'` if not already set.
- [ ] 34.1.3 Verify the host app still builds: `npm run build` at repo root.

**Traceability**: Design doc `mfe-loading.md` Decision 11 -- Module Federation for bundle loading. `singleton: false` per isolation model.

### 34.2 Register MfeHandlerMF in Host App

Update `src/app/main.tsx` to:
1. Import `microfrontends` plugin from `@hai3/react` and add `.use(microfrontends({ mfeHandlers: [...] }))` to the `createHAI3App` chain.
2. Import `MfeHandlerMF` from the handler sub-barrel. Note: `@hai3/screensets` does NOT expose a `./mfe/handler` subpath in `package.json` exports. The host app must import `MfeHandlerMF` via a direct deep path (`@hai3/screensets/dist/mfe/handler/mf-handler`) or the `microfrontends()` plugin must re-export or accept a factory. The definitive approach is to pass handlers via the `microfrontends()` plugin config, which internally passes them to `screensetsRegistryFactory.build()`.
3. Import `gtsPlugin` from `@hai3/screensets/plugins/gts` (this subpath IS in the package.json exports map).

The `microfrontends()` plugin accepts an optional config: `microfrontends({ mfeHandlers: [new MfeHandlerMF(gtsPlugin)] })`. Internally, the plugin passes `mfeHandlers` to `screensetsRegistryFactory.build({ typeSystem: gtsPlugin, mfeHandlers })`.

- [ ] 34.2.1 Update `packages/framework/src/plugins/microfrontends/index.ts` to accept an optional config object with `mfeHandlers?: MfeHandler[]`. Pass `mfeHandlers` through to `screensetsRegistryFactory.build()`.
- [ ] 34.2.2 Add an `./mfe/handler` subpath export to `packages/screensets/package.json` so host apps can import `MfeHandlerMF` without deep-path hacks: `"./mfe/handler": { "types": "./dist/mfe/handler/index.d.ts", "import": "./dist/mfe/handler/index.js", "require": "./dist/mfe/handler/index.cjs" }`. Update `tsup.config.ts` entry points accordingly.
- [ ] 34.2.3 Update `src/app/main.tsx`: import `MfeHandlerMF` from `@hai3/screensets/mfe/handler`, import `gtsPlugin` from `@hai3/screensets/plugins/gts`, and add `.use(microfrontends({ mfeHandlers: [new MfeHandlerMF(gtsPlugin)] }))` to the `createHAI3App` chain.
- [ ] 34.2.4 Verify the registry is created with `MfeHandlerMF` registered. The registry's internal handler registry should contain exactly one handler with `handledBaseTypeId === 'gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~'`.

**Traceability**: Design doc `mfe-loading.md` Decision 10 -- handlers provided via `ScreensetsRegistryConfig.mfeHandlers`. Design doc `registry-runtime.md` Decision 18 -- factory-with-cache pattern.

### 34.3 Register Base Domains with ContainerProviders

After the registry is created, register the 4 extension domains with `ContainerProvider` instances. Each domain needs a `ContainerProvider` that supplies a DOM element for mounting MFE content.

For the demo, create a `RefContainerProvider` (from `@hai3/react`) for the screen domain, connected to a React ref in the App component. Sidebar, popup, and overlay domains can use placeholder providers or be registered lazily.

- [ ] 34.3.1 In `src/app/App.tsx` (or a new `src/app/MfeBootstrap.tsx` component), create a `RefContainerProvider` for the screen domain. The ref targets a `<div>` element where the MFE screen content renders.
- [ ] 34.3.2 Register `screenDomain` (imported from `@hai3/react`) with the screen `ContainerProvider`: `registry.registerDomain(screenDomain, screenContainerProvider)`.
- [ ] 34.3.3 Optionally register `sidebarDomain`, `popupDomain`, `overlayDomain` with placeholder `ContainerProvider` instances (can be no-op providers that return a detached DOM element). These domains are not used in the initial demo but should be registered to demonstrate the pattern.
- [ ] 34.3.4 The domain registration must happen AFTER `screensetsRegistryFactory.build()` returns and BEFORE any `registerExtension` calls.

**Traceability**: Design doc `mfe-ext-lifecycle-actions.md` -- ContainerProvider Abstraction. Design doc `registry-runtime.md` -- `registerDomain(domain, containerProvider)`.

### 34.4 Register MFE Extensions from `mfe.json`

Load the MFE definitions from `src/mfe_packages/hello-world-mfe/mfe.json` and register them with the screensets registry. This demonstrates the "dynamic registration after fetching" pattern from the design docs.

- [ ] 34.4.1 In `src/app/main.tsx` (or `MfeBootstrap.tsx`), import the MFE JSON definitions. For the demo app, a static import of `mfe.json` is acceptable: `import mfeConfig from '@/mfe_packages/hello-world-mfe/mfe.json'`.
- [ ] 34.4.2 Register the manifest with the type system: `gtsPlugin.register(mfeConfig.manifest)`. GTS entities must be registered with the type system before `registerExtension()` can validate them via `validateInstance()`.
- [ ] 34.4.3 Register the entry with the type system: `gtsPlugin.register(mfeConfig.entry)`. GTS entities must be registered with the type system before `registerExtension()` can validate them via `validateInstance()`.
- [ ] 34.4.4 Register the extension: `await registry.registerExtension(mfeConfig.extension)`. This triggers GTS validation, contract matching, and the new entry type validation (Phase 32.3).
- [ ] 34.4.5 Mount the extension via actions chain:
```typescript
await registry.executeActionsChain({
  action: {
    type: HAI3_ACTION_MOUNT_EXT,
    target: screenDomain.id,
    payload: { extensionId: mfeConfig.extension.id },
  },
});
```
- [ ] 34.4.6 Verify the HelloWorld MFE renders inside the screen domain's container element.

**Traceability**: Design doc `registry-runtime.md` Decision 17 -- Dynamic Registration Model. Design doc `mfe-ext-lifecycle-actions.md` -- mount_ext action usage. Design doc `type-system.md` Decision 1 -- `register()` for GTS entities.

### 34.5 Provide Inline Manifest in MfeEntryMF

`MfeHandlerMF.resolveManifest()` supports both manifest ID references (string) and inline `MfManifest` objects. For the initial demo, use the **inline manifest** approach to simplify wiring (avoids the need to pre-cache manifests).

Update the MFE extension registration to provide the manifest inline in the entry:

```typescript
const entry: MfeEntryMF = {
  ...mfeConfig.entry,
  manifest: mfeConfig.manifest, // Inline MfManifest object instead of string ID reference
};
```

Then register the entry with the inline manifest. `MfeHandlerMF` will detect the object type and cache it internally.

- [ ] 34.5.1 Update the extension registration code to use the inline manifest approach: set `entry.manifest` to the full `MfManifest` object (from `mfe.json`). Register the extension with the entry that has the inline manifest.
- [ ] 34.5.2 Alternatively, if the string-reference approach is preferred, register the manifest with the type system first (`gtsPlugin.register(manifest)`) and use the manifest ID string. The `MfeHandlerMF` will look it up from the cache. Choose whichever approach is simpler for the demo.

**Traceability**: Design doc `mfe-loading.md` Decision 12 -- Manifest as Internal Implementation Detail. `MfeHandlerMF.resolveManifest()` supports both string and inline object.

### 34.6 Remove Legacy Screenset API Usage

The host app currently uses the legacy screenset registry (`screensetRegistry`, auto-discovery via `import.meta.glob`). After MFE wiring is in place, remove the legacy screenset infrastructure:

- [ ] 34.6.1 Remove `import '@/screensets/screensetRegistry'` from `src/app/main.tsx`.
- [ ] 34.6.2 Remove `src/screensets/screensetRegistry.tsx` (the auto-discovery file).
- [ ] 34.6.3 Remove `src/screensets/demo/demoScreenset.tsx` and the entire `src/screensets/demo/` directory (the demo screenset is now an MFE remote in `src/mfe_packages/hello-world-mfe/`).
- [ ] 34.6.4 Keep `src/screensets/_blank/` as a template reference (do NOT delete). Note: `_blank` remains as a legacy template reference for `hai3 create` and will be updated to MFE patterns in a separate future task.
- [ ] 34.6.5 Update the host app's `App.tsx` to remove any references to `screensetRegistry`, `ScreensetConfig`, `ScreensetCategory`, or legacy menu items. The screen domain is now managed by the MFE system.
- [ ] 34.6.6 If the host app's Layout component relies on `screensetRegistry` for navigation (menu items, screen routing), replace it with MFE-based navigation. The screen domain's MFE extensions will handle rendering. Menu items can be derived from registered extensions or hardcoded in the demo.
- [ ] 34.6.7 Update CLI templates: Check `packages/cli/templates/src/app/main.tsx` for stale `MfeHandlerLocal` reference (which no longer exists). Update to use `MfeHandlerMF` pattern or remove MFE handler reference if the template doesn't include MFE setup.

**Traceability**: Proposal -- MFE system replaces legacy screenset registry. The screenset registry was a pre-MFE pattern for static screen registration.

### 34.7 Dev Workflow: Running Host + Remote

Document the development workflow for running both the host app and MFE remotes:

- [ ] 34.7.1 Add a `dev:mfe` script to the root `package.json` that starts the MFE dev server: `"dev:mfe:hello-world": "cd src/mfe_packages/hello-world-mfe && npm run dev"`.
- [ ] 34.7.2 Add a convenience `dev:all` script that starts both host and MFE dev servers using `concurrently`. Note: The MFE remote dev server must be running before the host app loads MFE content at runtime. Use `concurrently --kill-others` to ensure both servers are stopped together. Example: `"dev:all": "concurrently --kill-others \"npm run dev:mfe:hello-world\" \"npm run dev\""`. The host app will fail gracefully (load error with fallback) if the remote is not yet available, but for development convenience the remote should start first or both should start simultaneously.
- [ ] 34.7.3 Verify the full workflow:
  - Start MFE remote: `npm run dev:mfe:hello-world` (port 3001)
  - Start host: `npm run dev` (default port, typically 5173)
  - Open host in browser -- the HelloWorld MFE loads from the remote and renders in the screen domain

**Traceability**: End-to-end verification that the MFE system works with real Module Federation remotes.

### 34.8 Validation

- [ ] 34.8.1 Run `npm run type-check` -- must pass.
- [ ] 34.8.2 Run `npm run test` -- all existing tests pass. New MFE integration tests are NOT required in this phase (they require a running MFE dev server).
- [ ] 34.8.3 Run `npm run build` -- must pass (both host and MFE remote).
- [ ] 34.8.4 Run `npm run lint` -- must pass.
- [ ] 34.8.5 Manual E2E verification: start both dev servers, open host in browser, verify MFE renders.
