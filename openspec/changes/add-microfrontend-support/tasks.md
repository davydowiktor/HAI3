# Implementation Tasks

## Status

All MFE implementation tasks through Phase 29 are COMPLETE (369 screensets + 16 react tests passing, 4 tests skipped identifying validation gaps).

Phase 27 (React component migration) is COMPLETE. @hai3/screensets has zero React dependencies.

Phase 28 (ScreensetsRegistryConfig cleanup and test-only API removal) is COMPLETE.

Phase 29 (Public API cleanup — remove internal symbols from barrels) is COMPLETE.

### Completed Work

| Area | Description | Status |
|------|-------------|--------|
| Phases 1-26 | Type system, registry, contracts, isolation, mediation, domains, loading, errors, framework plugin, React integration, bridges, shadow DOM, caching, constants, dynamic registration, abstract class layers, cross-runtime routing, lifecycle actions, callback injection, container providers, Flux compliance | COMPLETE |
| Phase 27 | Move React-dependent components (RefContainerProvider, ExtensionDomainSlot) to @hai3/react; zero React dependencies in @hai3/screensets | COMPLETE |
| Phase 28 | Clean up ScreensetsRegistryConfig (remove test-only APIs, internal collaborator injection); move error callback to per-domain `registerDomain` | COMPLETE |
| Phase 29 | Remove ~43 leaked internals from public barrels; simplify `executeActionsChain` to `Promise<void>`; slim interfaces; provide handlers via config only | COMPLETE |

### Current Construction Patterns

| Component | Pattern |
|-----------|---------|
| GtsPlugin | Singleton constant (`gtsPlugin`) |
| ScreensetsRegistry | Factory-with-cache (`screensetsRegistryFactory`) |
| MfeStateContainer | Internal construction by `DefaultMountManager` |

---

## Phase 29: Public API Cleanup — Remove Internal Symbols from Barrels

**Goal**: `src/index.ts` exports ~70 MFE symbols; only ~27 are needed by consumers. Remove ~43 leaked internals from the public barrels (`src/index.ts` and `src/mfe/index.ts`). Simplify `executeActionsChain` public signature. Slim abstract classes and interfaces to expose only what consumers and collaborators actually use.

### 29.1 Clean `src/mfe/index.ts` — Remove Leaked Internals

- [x] 29.1.1 Remove `RuntimeCoordinator` (abstract class) and `RuntimeConnection` (type) from `./coordination/types` re-export.
- [x] 29.1.2 Remove `ActionsChainsMediator` (abstract class), `ChainResult`, `ChainExecutionOptions` types, and `ActionHandler` from `./mediator`. `ActionHandler` is internal (used only by the mediator and child domain forwarding handler); it must NOT be re-exported from the `mfe/index.ts` barrel.
- [x] 29.1.3 Remove `validateContract`, `formatContractErrors` from `./validation/contract`.
- [x] 29.1.4 Remove `validateExtensionType` from `./validation/extension-type`.
- [x] 29.1.5 Remove `ContractError`, `ContractErrorType`, `ContractValidationResult` types from `./validation/contract`.
- [x] 29.1.6 Delete the `MfeErrorHandler` CLASS from `error-handler.ts` (dead code, never called) but keep the file since `RetryHandler` lives in the same file. Remove `MfeErrorHandler` and `ErrorHandlerConfig` exports from the `./errors` barrel. Keep `RetryHandler` in `error-handler.ts` marked `@internal` (used internally by `MfeHandlerMF`); `RetryHandler` must NOT be re-exported from the barrel.

Keep only what `src/index.ts` needs to re-export (the ~27 public symbols).

**Traceability**: Proposal -- public API surface must expose only consumer-facing symbols.

### 29.2 Clean `src/index.ts` — Remove Internal Exports

Remove from `src/index.ts`:

- [x] 29.2.1 Plugin sub-types: `CompatibilityChange`, `CompatibilityResult`, `AttributeResult`. Keep `ValidationResult`, `ValidationError`, and `JSONSchema` in the public barrel -- they are part of the public `TypeSystemPlugin` interface (`validateInstance()` returns `ValidationResult`/`ValidationError`; `registerSchema()` accepts `JSONSchema`).
- [x] 29.2.2 Module Federation internals: `MfManifest`, `SharedDependencyConfig`. Note: `MfeEntryMF` is a public GTS type interface (consumers need it to define Module Federation entries) and MUST remain in the public barrel. Only `MfManifest` and `SharedDependencyConfig` are internal implementation details to be removed.
- [x] 29.2.3 Internal abstract: `MfeBridgeFactory`.
- [x] 29.2.4 Constant collections: `HAI3_CORE_TYPE_IDS`, `HAI3_LIFECYCLE_STAGE_IDS`, `HAI3_MF_TYPE_IDS`.
- [x] 29.2.5 Type ID constants: `HAI3_MFE_ENTRY`, `HAI3_MFE_ENTRY_MF`, `HAI3_MF_MANIFEST`, `HAI3_EXT_DOMAIN`, `HAI3_EXT_EXTENSION`, `HAI3_EXT_ACTION`.
- [x] 29.2.6 GTS loaders: `loadSchemas`, `loadLifecycleStages`, `loadBaseActions`.
- [x] 29.2.7 Unused shadow DOM: `injectStylesheet`, `ShadowRootOptions`.
- [x] 29.2.8 Test-only: `MfeStateContainer`, `MfeStateContainerConfig`.
- [x] 29.2.9 All 13 error classes: `MfeError`, `MfeLoadError`, `ContractValidationError`, `ExtensionTypeError`, `ChainExecutionError`, `MfeVersionMismatchError`, `MfeTypeConformanceError`, `DomainValidationError`, `ExtensionValidationError`, `UnsupportedDomainActionError`, `UnsupportedLifecycleStageError`, `NoActionsChainHandlerError`, `BridgeDisposedError`.
**Traceability**: Proposal -- public API surface must expose only consumer-facing symbols.

### 29.3 Simplify `executeActionsChain` Public Signature

- [x] 29.3.1 On abstract `ScreensetsRegistry`: change `executeActionsChain(chain: ActionsChain, options?: ChainExecutionOptions): Promise<ChainResult>` to `executeActionsChain(chain: ActionsChain): Promise<void>`.
- [x] 29.3.2 On `DefaultScreensetsRegistry`: update override to match `Promise<void>` return type. The concrete implementation may still use `ChainResult` internally.
- [x] 29.3.3 Update any call sites that use the return value or pass options.

**Traceability**: Proposal -- `ChainExecutionOptions` and `ChainResult` are internal; actions chains are semantically void.

### 29.4 Update Tests

- [x] 29.4.1 Update any tests that import removed symbols from `@hai3/screensets` barrel to import from internal paths instead.

**Traceability**: Tests must compile after barrel cleanup.

### 29.5 Update Framework/React Imports

- [x] 29.5.1 Verify `@hai3/framework` and `@hai3/react` do not import any removed symbols. Fix if they do.

**Traceability**: Downstream packages must not depend on removed internals.

### 29.6 Update Spec and Design Docs to Reflect Slimmed Interfaces

- [x] 29.6.1 Update `specs/screensets/spec.md`: remove requirements for `entryTypeId` on ChildMfeBridge, remove `subscribeToAllProperties` on ChildMfeBridge, remove `preload` from MfeHandler requirements, remove `registerHandler` from ScreensetsRegistry requirements, update TypeSystemPlugin requirements to match the 7-method interface (`name`, `version`, `registerSchema`, `getSchema`, `register`, `validateInstance`, `isTypeOf`), update `ScreensetsRegistryConfig` from `mfeHandler?` to `mfeHandlers?`, remove error class export requirements (error classes are internal), remove `RuntimeCoordinator` export requirement. Note: the "Type identifier" scenario already says "not by parsing" (no `parseTypeId` reference to remove), and the "Isolation requirement enforcement" scenario already describes isolation via separate plugin instances (no `plugin.query()` reference to remove).
- [x] 29.6.2 Update `specs/microfrontends/spec.md` if any references to removed members exist.
- [x] 29.6.3 Update `design/type-system.md`: slim `TypeSystemPlugin` interface to 7 methods, remove `isValidTypeId`, `parseTypeId`, `query`, `getAttribute`, `checkCompatibility` and associated types (`AttributeResult`, `CompatibilityChange`, `CompatibilityResult`), update `ScreensetsRegistryConfig` from `mfeHandler?` to `mfeHandlers?`.
- [x] 29.6.4 Update `design/registry-runtime.md`: remove action handler methods (`registerExtensionActionHandler`, `unregisterExtensionActionHandler`, `registerDomainActionHandler`, `unregisterDomainActionHandler`, `registerHandler`) from abstract `ScreensetsRegistry`, update export policy to remove `MfeStateContainer`, `MfeStateContainerConfig`, `MfeBridgeFactory`, `RuntimeCoordinator`, `RuntimeConnection`, `ActionsChainsMediator`, and error classes from public exports.
- [x] 29.6.5 Update `design/mfe-api.md`: remove `entryTypeId` and `subscribeToAllProperties` from `ChildMfeBridge` interface, simplify `executeActionsChain` to `Promise<void>` on both `ScreensetsRegistry` and `ChildMfeBridge`.
- [x] 29.6.6 Update `design/mfe-loading.md`: remove `preload()` from `MfeHandler` abstract class.
- [x] 29.6.7 Update `proposal.md`: remove `preload?(entry)` from MfeHandler description.
- [x] 29.6.8 Update `design/glossary.md`: remove "type ID validation" from the `TypeSystemPlugin` entry (after `isValidTypeId`/`parseTypeId` removal, the plugin no longer provides type ID validation -- it provides schema registration, instance validation, and type hierarchy checking).

**Traceability**: Proposal -- public API surface must expose only consumer-facing symbols. Design docs and spec files must reflect current truth only.

### 29.7 Remove Internal Action Handler Methods from Abstract ScreensetsRegistry

- [x] 29.7.1 Remove `registerExtensionActionHandler()` from the abstract `ScreensetsRegistry` class. Keep the implementation as a private method on `DefaultScreensetsRegistry`.
- [x] 29.7.2 Remove `unregisterExtensionActionHandler()` from the abstract `ScreensetsRegistry` class. Keep the implementation as a private method on `DefaultScreensetsRegistry`.
- [x] 29.7.3 Remove `registerDomainActionHandler()` from the abstract `ScreensetsRegistry` class. Keep the implementation as a private method on `DefaultScreensetsRegistry`.
- [x] 29.7.4 Remove `unregisterDomainActionHandler()` from the abstract `ScreensetsRegistry` class. Keep the implementation as a private method on `DefaultScreensetsRegistry`.
- [x] 29.7.5 Update any tests that call these methods through the abstract type to use `DefaultScreensetsRegistry` directly or test through public API (registerDomain/mount).

**Traceability**: Proposal -- these are internal mediator wiring called by the registry on itself during registration/mount; not consumer-facing.

### 29.8 Slim TypeSystemPlugin Interface

- [x] 29.8.1 Remove `isValidTypeId()` from `TypeSystemPlugin` interface and `GtsPlugin` implementation.
- [x] 29.8.2 Remove `parseTypeId()` from `TypeSystemPlugin` interface and `GtsPlugin` implementation.
- [x] 29.8.3 Remove `query()` from `TypeSystemPlugin` interface and `GtsPlugin` implementation.
- [x] 29.8.4 Remove `getAttribute()` from `TypeSystemPlugin` interface and `GtsPlugin` implementation. Remove the `AttributeResult` type.
- [x] 29.8.5 Remove `checkCompatibility()` from `TypeSystemPlugin` interface and `GtsPlugin` implementation. Remove `CompatibilityChange` and `CompatibilityResult` types.
- [x] 29.8.6 Update any tests that reference removed methods or types to remove those assertions.

Keep: `name`, `version`, `registerSchema()`, `getSchema()`, `register()`, `validateInstance()`, `isTypeOf()`.

**Traceability**: Proposal -- these methods are never called by the registry or collaborators. ISP: remove unused interface surface.

### 29.9 Slim ChildMfeBridge Interface

- [x] 29.9.1 Remove `entryTypeId` property from `ChildMfeBridge` interface. Update `ChildMfeBridgeImpl` and `ParentMfeBridgeImpl` to remove the field.
- [x] 29.9.2 Remove `subscribeToAllProperties()` from `ChildMfeBridge` interface. Update implementations to remove the method.
- [x] 29.9.3 Simplify `executeActionsChain` on `ChildMfeBridge` interface to `executeActionsChain(chain: ActionsChain): Promise<void>`. Remove `ChainExecutionOptions` parameter and `ChainResult` return type from the bridge interface. Update `ChildMfeBridgeImpl` and `ParentMfeBridgeImpl`. Also remove the `import { ChainResult, ChainExecutionOptions }` from `handler/types.ts` (where `ChildMfeBridge` is defined) since those types are no longer referenced.
- [x] 29.9.4 Update React hooks (`useHostAction`, `useMfeBridge`) if they reference removed members.
- [x] 29.9.5 Update tests that reference `entryTypeId`, `subscribeToAllProperties()`, or the old `executeActionsChain` signature on bridges.

**Traceability**: Proposal -- `entryTypeId` is binding-only metadata not needed by MFE code; `subscribeToAllProperties` is unused; `executeActionsChain` aligns with 29.3 simplification.

### 29.10 Remove preload() from MfeHandler

- [x] 29.10.1 Remove the abstract `preload()` method from `MfeHandler`.
- [x] 29.10.2 Remove the `preload()` implementation from `MfeHandlerMF`.
- [x] 29.10.3 Update tests that reference `preload()`.

**Traceability**: Proposal -- speculative method, never implemented. `load` already fetches without mounting.

### 29.11 Provide Handlers via Config Only

- [x] 29.11.1 Change `ScreensetsRegistryConfig` from `mfeHandler?: MfeHandler` to `mfeHandlers?: MfeHandler[]`.
- [x] 29.11.2 Remove `registerHandler()` from the abstract `ScreensetsRegistry` class.
- [x] 29.11.3 Update `DefaultScreensetsRegistry` constructor to iterate `config.mfeHandlers` and register them directly into the internal handler storage (e.g., a private `Map` or array). No abstract method is needed -- the concrete class owns the handler storage, so the constructor populates it directly during construction.
- [x] 29.11.4 Update all call sites and tests that use `registerHandler()` to provide handlers via config instead.

**Traceability**: Proposal -- handlers should be provided during system initialization via config, not registered ad-hoc at runtime.

### 29.12 Validation

- [x] 29.12.1 Run `npm run type-check` -- must pass.
- [x] 29.12.2 Run `npm run test` -- all tests pass (369 screensets + 16 react tests, 4 tests skipped identifying validation gaps).
- [x] 29.12.3 Run `npm run build` -- must pass.
- [x] 29.12.4 Run `npm run lint` -- must pass.
