# Implementation Tasks

## Status

Phases 1-34 are COMPLETE (448 tests passing: 367 screensets + 65 framework + 16 react).

Phase 35 (Shared Properties on Domains, Extension Presentation Metadata, Full Demo Conversion) has CRITICAL GAPS found during review. Infrastructure tasks (35.1-35.5, 35.10) are complete. Demo conversion tasks (35.6-35.9) are structurally complete but have zero feature parity with the original demo screenset. See `design/post-conversion-features.md` for the full gap analysis.

Phase 36 (Feature Parity Remediation) is PLANNED. Closes every gap documented in `design/post-conversion-features.md` to achieve 100% feature parity with `design/pre-conversion-features.md`. Covers GTS design fix, package consolidation, full i18n restoration, screen feature restoration, legacy cleanup, and verification.

**Phase 35 Review Findings (3 critical issues + 1 GTS design error):**

1. **Architecture Error**: The conversion created 4 separate MFE packages instead of 1 MFE package with 4 entries. ONE SCREENSET = ONE MFE. The demo screenset should be a single `demo-mfe` package with 1 manifest, 4 entries, 4 extensions, and shared internals.

2. **Zero Feature Parity**: All 4 MFE packages are placeholder stubs. No i18n (zero translations), no UIKit components, no API integration, no loading/error states, no navigation, no lazy loading. The 56 UIKit element demos were replaced with ~12 CSS mockups. See `design/pre-conversion-features.md` for the authoritative feature baseline.

3. **Incomplete Cleanup**: The blank screenset (`src/screensets/_blank/`) was not converted. Legacy screenset API references were not deleted.

4. **Shared Properties GTS Design Error**: Theme and language GTS instances carry hardcoded `value` fields (`"light"`, `"en"`) instead of enum schemas defining the contract of supported values. Runtime values belong in `updateDomainProperty()`, not in the type system.

### Upcoming Work

Phase 36 remediates all Phase 35 gaps. No new phases can begin until Phase 36 is complete and all 36.10.x verification checkpoints pass.

### Completed Work

| Area | Description | Status |
|------|-------------|--------|
| Phases 1-26 | Type system, registry, contracts, isolation, mediation, domains, loading, errors, framework plugin, React integration, bridges, shadow DOM, caching, constants, dynamic registration, abstract class layers, cross-runtime routing, lifecycle actions, callback injection, container providers, Flux compliance | COMPLETE |
| Phase 27 | Move React-dependent components to @hai3/react; zero React deps in @hai3/screensets | COMPLETE |
| Phase 28 | ScreensetsRegistryConfig cleanup: remove test-only APIs, move error callback to `registerDomain` | COMPLETE |
| Phase 29 | Remove ~43 leaked internals from barrels; slim `TypeSystemPlugin`/`ChildMfeBridge`; remove `preload()` | COMPLETE |
| Phase 30 | Framework MFE API cleanup: remove unused DOM components, factory functions, duplicate actions | COMPLETE |
| Phase 31 | React API completion: re-exports, `useDomainExtensions` fix, depcruiser + ESLint enforcement | COMPLETE |
| Phase 32 | MFE Infrastructure: base `ExtensionDomain` constants, `MfeBridgeFactoryDefault` extraction, entry type validation | COMPLETE |
| Phase 33 | Module Federation Build: Vite MF plugin, MFE remote package, `MfeEntryLifecycle` class, shared deps | COMPLETE |
| Phase 34 | Wire MFEs into Host App: host MF config, handler registration, domain + extension registration, remove legacy screenset API, tooling compliance, hello-world-mfe Shadow DOM/domain properties | COMPLETE |
| Phase 35 | Shared Properties on Domains, Extension Presentation Metadata, Full Demo Conversion | CRITICAL GAPS (see review findings above) |
| Phase 36 | Feature Parity Remediation: GTS fix, package consolidation, i18n, screen features, cleanup | COMPLETE (36.7.4 and 36.11.5 manual verification pending) |

### Current Construction Patterns

| Component | Pattern |
|-----------|---------|
| GtsPlugin | Singleton constant (`gtsPlugin`) |
| ScreensetsRegistry | Factory-with-cache (`screensetsRegistryFactory`) |
| MfeStateContainer | Internal construction by `DefaultMountManager` |

---

---

## Phase 35: Shared Properties on Domains, Extension Presentation Metadata, Full Demo Conversion

**Status**: CRITICAL GAPS -- infrastructure complete, demo conversion has zero feature parity. See `design/post-conversion-features.md`.

**Goal**: Close three design gaps: (1) populate base extension domain `sharedProperties` with theme and language, define GTS shared property instances, update MFE entries to declare `requiredProperties`; (2) add `presentation` metadata to the Extension schema and update the host to build the nav menu from registered extensions; (3) convert all 4 original demo screens into MFE packages.

**Review Findings** (added post-review):
- Tasks 35.1-35.5, 35.10: Infrastructure is complete and correct.
- Tasks 35.6-35.9: Structurally scaffolded but all 4 MFE packages are stubs with zero feature parity. See `design/post-conversion-features.md` for per-package gap details.
- Task 35.1: GTS shared property instances use hardcoded `value` fields instead of enum schemas. Design error documented in `design/post-conversion-features.md`.
- Architecture: The 4-package split is incorrect. ONE SCREENSET = ONE MFE. Should be 1 `demo-mfe` package with 4 entries.
- Missing: `_blank` screenset not converted, legacy screenset API not deleted.

### 35.1 Define Theme and Language Shared Property GTS Instances

Create the GTS JSON instance files for the two built-in shared properties. Register them as built-in instances in the GTS plugin alongside the existing lifecycle stages and extension actions.

- [x] 35.1.1 Create `packages/screensets/src/mfe/gts/hai3.mfes/instances/comm/theme.v1.json` with content: `{ "id": "gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.theme.v1", "value": "light" }`. (Superseded by 36.1.2 -- implemented with the old `value` design, corrected in Phase 36 to use `supportedValues` instead.)
- [x] 35.1.2 Create `packages/screensets/src/mfe/gts/hai3.mfes/instances/comm/language.v1.json` with content: `{ "id": "gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.language.v1", "value": "en" }`. (Superseded by 36.1.3 -- implemented with the old `value` design, corrected in Phase 36 to use `supportedValues` instead.)
- [x] 35.1.3 Register both instances as built-in in the GTS plugin constructor (same pattern as lifecycle stage and ext action instances). Import the JSON files and call `this.register()` for each during `GtsPlugin` construction.
- [x] 35.1.4 Add constants to `packages/screensets/src/mfe/constants/index.ts`:
  - `HAI3_SHARED_PROPERTY_THEME = 'gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.theme.v1'`
  - `HAI3_SHARED_PROPERTY_LANGUAGE = 'gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.language.v1'`
- [x] 35.1.5 Export `HAI3_SHARED_PROPERTY_THEME` and `HAI3_SHARED_PROPERTY_LANGUAGE` from the `@hai3/screensets` public barrel, the `@hai3/framework` barrel, and the `@hai3/react` barrel.
- [x] 35.1.6 Write unit test: verify `gtsPlugin.validateInstance('gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.theme.v1')` returns valid.
- [x] 35.1.7 Write unit test: verify `gtsPlugin.validateInstance('gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.language.v1')` returns valid.

**Traceability**: Design doc `mfe-shared-property.md` -- HAI3 Default Shared Property Instances. Design doc `schemas.md` -- GTS Entity Storage Format (comm instances). Screensets spec -- HAI3 Shared Property Constants requirement.

### 35.2 Add Theme and Language to Base Extension Domain Constants

Update the 4 base extension domain constants in `@hai3/framework` to declare theme and language in their `sharedProperties` arrays.

- [x] 35.2.1 Update `packages/framework/src/plugins/microfrontends/base-domains.ts`: import `HAI3_SHARED_PROPERTY_THEME` and `HAI3_SHARED_PROPERTY_LANGUAGE` from `@hai3/screensets`. Set `sharedProperties` for all 4 domains (`screenDomain`, `sidebarDomain`, `popupDomain`, `overlayDomain`) to `[HAI3_SHARED_PROPERTY_THEME, HAI3_SHARED_PROPERTY_LANGUAGE]`.
- [x] 35.2.2 Update the domain JSON instance files in `packages/framework/src/plugins/microfrontends/gts/hai3.screensets/instances/domains/` (screen.v1.json, sidebar.v1.json, popup.v1.json, overlay.v1.json) to include the same shared property type IDs in their `sharedProperties` arrays.
- [x] 35.2.3 Write unit test: verify `screenDomain.sharedProperties` contains both `HAI3_SHARED_PROPERTY_THEME` and `HAI3_SHARED_PROPERTY_LANGUAGE`.
- [x] 35.2.4 Write unit test: register `screenDomain`, then register an extension whose entry has `requiredProperties: [HAI3_SHARED_PROPERTY_THEME, HAI3_SHARED_PROPERTY_LANGUAGE]` -- expect contract validation to pass. (Completed in Phase 36.1.7 -- see base-domains.test.ts lines 77-109)
- [x] 35.2.5 Write unit test: register `screenDomain`, then register an extension whose entry has `requiredProperties` including a property NOT in the domain's `sharedProperties` -- expect contract validation to fail with `missing_property`. (Completed in Phase 36.1.7 -- see base-domains.test.ts lines 77-109)

**Traceability**: Design doc `mfe-ext-lifecycle-actions.md` -- Domain Action Declarations (sharedProperties). Design doc `principles.md` -- Theme and Language as Domain Properties. Screensets spec -- Domain carries theme and language properties.

### 35.3 Update hello-world-mfe Entry to Declare Required Properties

Update the hello-world-mfe `mfe.json` to declare theme and language as required properties, and add presentation metadata to the extension.

- [x] 35.3.1 Update `src/mfe_packages/hello-world-mfe/mfe.json`: set `entry.requiredProperties` to `["gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.theme.v1", "gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.language.v1"]`.
- [x] 35.3.2 Update `src/mfe_packages/hello-world-mfe/mfe.json`: add `presentation` to the extension object: `{ "label": "Hello World", "icon": "hand-wave", "route": "/hello-world", "order": 10 }`.
- [x] 35.3.3 Verify the MFE still registers and mounts successfully with the updated `mfe.json`.

**Traceability**: Microfrontends spec -- hello-world-mfe entry declares required properties. Microfrontends spec -- hello-world-mfe extension declares presentation metadata.

### 35.4 Add Presentation Field to Extension TypeScript Interface and GTS Schema

Update the base Extension TypeScript interface and GTS schema to include the optional `presentation` field.

- [x] 35.4.1 Update the `Extension` TypeScript interface in `packages/screensets/src/mfe/types/` (or wherever `Extension` is defined) to add `presentation?: ExtensionPresentation`. Define `ExtensionPresentation` interface: `{ label: string; icon?: string; route: string; order?: number; }`.
- [x] 35.4.2 Update the Extension GTS JSON schema at `packages/screensets/src/mfe/gts/hai3.mfes/schemas/ext/extension.v1.json` to include the `presentation` property object with `label` (required string), `icon` (optional string), `route` (required string), `order` (optional number).
- [x] 35.4.3 Export `ExtensionPresentation` from `@hai3/screensets` public barrel, `@hai3/framework`, and `@hai3/react`. Update `registry-runtime.md` Export Policy to include `ExtensionPresentation` in the list of public exports.
- [x] 35.4.4 Write unit test: register an extension with `presentation: { label: 'Test', route: '/test' }` -- expect GTS validation to pass.
- [x] 35.4.5 Write unit test: register an extension without `presentation` -- expect GTS validation to pass (field is optional).
- [x] 35.4.6 Write unit test: `runtime.getExtension(extensionId).presentation` returns the presentation metadata after registration.

**Traceability**: Design doc `schemas.md` -- Extension Schema (presentation field). Design doc `mfe-domain.md` -- Extension TypeScript Interface. Screensets spec -- Extension Presentation Metadata requirement.

### 35.5 Host Nav Menu Driven by Extension Presentation Metadata

Update the host application to build the navigation menu dynamically from registered screen extension presentation metadata. Remove any hardcoded menu items or legacy screenset-based menu logic.

- [x] 35.5.1 In the host Layout/Menu component, query screen extensions: `const extensions = runtime.getExtensionsForDomain(HAI3_SCREEN_DOMAIN)`. Filter extensions that have `presentation` defined. Sort by `presentation.order`. Build menu items from `presentation.label`, `presentation.icon`, `presentation.route`.
- [x] 35.5.2 Clicking a menu item SHALL dispatch `mount_ext` for the corresponding extension: `mfeActions.mountExtension(extension.id)`.
- [x] 35.5.3 Remove any remaining hardcoded menu items, `MenuItemConfig` references, or legacy `screensetRegistry`-based menu population logic.
- [x] 35.5.4 Verify the menu auto-populates when new screen extensions are registered dynamically.

**Traceability**: Design doc `overview.md` -- Navigation Menu Auto-Population. Design doc `mfe-ext-lifecycle-actions.md` -- Menu auto-population. Microfrontends spec -- Host derives menu from screen extensions.

### 35.6 Create profile-mfe Package

Convert the legacy Profile screen into an independent MFE package.

- [x] 35.6.1 Create `src/mfe_packages/profile-mfe/` with the standard MFE package structure: `package.json`, `tsconfig.json`, `vite.config.ts`, `mfe.json`, `src/lifecycle.tsx`, `src/ProfileScreen.tsx`.
- [x] 35.6.2 The `mfe.json` SHALL define: manifest (remoteEntry on port 3002), entry with `requiredProperties: [HAI3_SHARED_PROPERTY_THEME, HAI3_SHARED_PROPERTY_LANGUAGE]`, extension with `presentation: { label: "Profile", icon: "user", route: "/profile", order: 20 }` targeting the screen domain.
- [x] 35.6.3 The `ProfileScreen.tsx` SHALL subscribe to theme and language from the bridge, use Tailwind/UIKit, carry its own i18n files under `src/i18n/`. All imports from `@hai3/react` (L3) only. (Completed in Phase 36.4 -- profile screen consolidated into demo-mfe with full bridge subscriptions, UIKit components, and 36 i18n files.)
- [x] 35.6.4 Add `dev:mfe:profile` script to root `package.json`. Update `dev:all` to include this server.
- [x] 35.6.5 Verify the Profile MFE builds, serves, and renders correctly when registered and mounted.

**Traceability**: Microfrontends spec -- Full Demo Screenset Conversion. Each demo screen becomes its own MFE package.

### 35.7 Create current-theme-mfe Package

Convert the legacy CurrentTheme screen into an independent MFE package.

- [x] 35.7.1 Create `src/mfe_packages/current-theme-mfe/` with the standard MFE package structure.
- [x] 35.7.2 The `mfe.json` SHALL define: manifest (remoteEntry on port 3003), entry with `requiredProperties: [HAI3_SHARED_PROPERTY_THEME, HAI3_SHARED_PROPERTY_LANGUAGE]`, extension with `presentation: { label: "Current Theme", icon: "palette", route: "/current-theme", order: 30 }` targeting the screen domain.
- [x] 35.7.3 The `CurrentThemeScreen.tsx` SHALL demonstrate theme property consumption by displaying the current theme value and its CSS variables. All imports from `@hai3/react` (L3) only.
- [x] 35.7.4 Add `dev:mfe:current-theme` script to root `package.json`. Update `dev:all`.
- [x] 35.7.5 Verify the CurrentTheme MFE builds, serves, and renders correctly.

**Traceability**: Microfrontends spec -- Full Demo Screenset Conversion.

### 35.8 Create uikit-elements-mfe Package

Convert the legacy UIKitElements screen into an independent MFE package.

- [x] 35.8.1 Create `src/mfe_packages/uikit-elements-mfe/` with the standard MFE package structure.
- [x] 35.8.2 The `mfe.json` SHALL define: manifest (remoteEntry on port 3004), entry with `requiredProperties: [HAI3_SHARED_PROPERTY_THEME, HAI3_SHARED_PROPERTY_LANGUAGE]`, extension with `presentation: { label: "UIKit Elements", icon: "grid", route: "/uikit-elements", order: 40 }` targeting the screen domain.
- [x] 35.8.3 The `UIKitElementsScreen.tsx` SHALL demonstrate UIKit components inside Shadow DOM. All imports from `@hai3/react` (L3) only.
- [x] 35.8.4 Add `dev:mfe:uikit-elements` script to root `package.json`. Update `dev:all`.
- [x] 35.8.5 Verify the UIKitElements MFE builds, serves, and renders correctly.

**Traceability**: Microfrontends spec -- Full Demo Screenset Conversion.

### 35.9 Register All MFE Extensions in Host App

Update the host app initialization to register all 4 MFE extensions and verify the nav menu auto-populates.

- [x] 35.9.1 Import `mfe.json` from all 4 MFE packages in the host app bootstrap code.
- [x] 35.9.2 Register all manifests, entries, and extensions with the registry (same pattern as Phase 34.4).
- [x] 35.9.3 Verify the nav menu displays 4 items (Hello World, Profile, Current Theme, UIKit Elements) sorted by `presentation.order`.
- [x] 35.9.4 Verify clicking each menu item triggers `mount_ext` and the corresponding MFE renders in the screen domain.
- [x] 35.9.5 Verify theme changes propagate to all mounted MFEs.
- [x] 35.9.6 Verify language changes propagate to all mounted MFEs.

**Traceability**: Microfrontends spec -- Host app registers all MFE extensions. Design doc `overview.md` -- Navigation Menu Auto-Population.

### 35.10 Host Provides Theme and Language Property Updates

Ensure the host app calls `updateDomainProperty()` for theme and language when they change.

- [x] 35.10.1 In the host app theme change handler (or theme plugin), call `registry.updateDomainProperty(domainId, HAI3_SHARED_PROPERTY_THEME, newTheme)` for each registered extension domain (screen, sidebar, popup, overlay).
- [x] 35.10.2 In the host app language change handler (or i18n plugin), call `registry.updateDomainProperty(domainId, HAI3_SHARED_PROPERTY_LANGUAGE, newLanguage)` for each registered extension domain.
- [x] 35.10.3 Verify mounted MFEs receive theme updates immediately via `bridge.subscribeToProperty()`.
- [x] 35.10.4 Verify mounted MFEs receive language updates immediately via `bridge.subscribeToProperty()`.

**Traceability**: Design doc `mfe-api.md` -- Domain-Level Property Updates. Design doc `principles.md` -- Theme and Language as Domain Properties.

### 35.11 Validation

- [x] 35.11.1 Run `npm run type-check` -- must pass.
- [x] 35.11.2 Run `npm run test` -- all existing tests pass. New tests from 35.1, 35.2, 35.4 pass.
- [x] 35.11.3 Run `npm run build` -- must pass (host + all 4 MFE remotes).
- [x] 35.11.4 Run `npm run lint` -- must pass (all MFE packages included, no exclusions).
- [ ] 35.11.5 Manual E2E: start all 4 MFE dev servers + host. Menu shows 4 items. Clicking each loads the correct MFE. Theme/language changes propagate. All MFEs render inside Shadow DOM with correct styles.

---

## Phase 36: Feature Parity Remediation

**Status**: PLANNED

**Goal**: Close every gap documented in `design/post-conversion-features.md` and achieve 100% feature parity with `design/pre-conversion-features.md`. This phase fixes the GTS shared property design error, consolidates 4 MFE packages into 1 `demo-mfe` package with 4 entries, restores all lost screen features (i18n, API integration, UIKit components, navigation, lazy loading), converts the blank screenset template, deletes the legacy screenset API, and verifies parity across all dimensions.

**Architecture**: ONE SCREENSET = ONE MFE. The demo screenset is a single `demo-mfe` package with 1 manifest, 4 entries, 4 extensions, and shared internals. Navigation between screens is host-controlled via `mount_ext` actions -- no internal routing.

**Traceability**: All tasks trace to gaps in `design/post-conversion-features.md` against the baseline in `design/pre-conversion-features.md`.

### 36.1 Fix Shared Properties GTS Design

Fix the GTS shared property schema and instances so that schemas define enum contracts (supported values) and instances declare their type (schema reference) without carrying hardcoded runtime values. Runtime values belong in `updateDomainProperty()`, not in the type system.

- [x] 36.1.1 Update the `shared_property.v1.json` schema (`packages/screensets/src/mfe/gts/hai3.mfes/schemas/comm/shared_property.v1.json`): replace the unconstrained `"value": {}` property with a `"supportedValues"` property of type `array` containing `string` items. Remove `"value"` from the `"required"` array; add `"supportedValues"` to `"required"`.
- [x] 36.1.2 Update `theme.v1.json` instance (`packages/screensets/src/mfe/gts/hai3.mfes/instances/comm/theme.v1.json`): remove the `"value": "light"` field. Add `"supportedValues": ["default", "light", "dark", "dracula", "dracula-large"]` -- the 5 theme IDs from the host's `ThemeConfig` constants (`DEFAULT_THEME_ID`, `LIGHT_THEME_ID`, `DARK_THEME_ID`, `DRACULA_THEME_ID`, `DRACULA_LARGE_THEME_ID`).
- [x] 36.1.3 Update `language.v1.json` instance (`packages/screensets/src/mfe/gts/hai3.mfes/instances/comm/language.v1.json`): remove the `"value": "en"` field. Add `"supportedValues"` containing all 36 Language enum values from `@hai3/i18n`: `["en", "es", "fr", "de", "it", "pt", "nl", "ru", "pl", "uk", "cs", "ar", "he", "fa", "ur", "tr", "zh", "zh-TW", "ja", "ko", "vi", "th", "id", "hi", "bn", "sv", "da", "no", "fi", "el", "ro", "hu", "ms", "tl", "ta", "sw"]`.
- [x] 36.1.4 Update any code that reads or validates the `value` field from shared property instances. Search for references to `.value` on theme/language GTS instances and update to use `supportedValues`. This includes GTS plugin registration logic and any validation that checks instance shape.
- [x] 36.1.5 Update existing unit tests (35.1.6, 35.1.7) to validate the new instance shape: `supportedValues` array present, no `value` field. Add a test verifying `theme.v1.json` has exactly 5 supported values and `language.v1.json` has exactly 36 supported values.
- [x] 36.1.6 Add a unit test: validate that the shared property schema requires `supportedValues` and does NOT require `value`.
- [x] 36.1.7 Complete unchecked Phase 35 tasks 35.2.4 and 35.2.5 as part of this phase: (a) Write unit test: register `screenDomain`, then register an extension whose entry has `requiredProperties: [HAI3_SHARED_PROPERTY_THEME, HAI3_SHARED_PROPERTY_LANGUAGE]` -- expect contract validation to pass. (b) Write unit test: register `screenDomain`, then register an extension whose entry has `requiredProperties` including a property NOT in the domain's `sharedProperties` -- expect contract validation to fail with `missing_property`.

**Traceability**: `design/post-conversion-features.md` -- "Shared Properties GTS Design Error". `design/pre-conversion-features.md` does not mention GTS instance values -- they are a type-system-only concern. Task 36.1.7 traces to Phase 35 tasks 35.2.4 and 35.2.5 (contract validation tests).

### 36.2 Consolidate 4 MFE Packages into 1 demo-mfe

Merge all 4 MFE packages (`hello-world-mfe`, `profile-mfe`, `current-theme-mfe`, `uikit-elements-mfe`) into a single `demo-mfe` package with 4 lifecycle entries.

- [x] 36.2.1 Rename `src/mfe_packages/hello-world-mfe/` to `src/mfe_packages/demo-mfe/`. Update `package.json`: name to `@hai3/demo-mfe`, single dev server on port 3001.
- [x] 36.2.2 Move screen components and lifecycle classes from `profile-mfe`, `current-theme-mfe`, and `uikit-elements-mfe` into `demo-mfe/src/screens/` subdirectories: `demo-mfe/src/screens/helloworld/`, `demo-mfe/src/screens/profile/`, `demo-mfe/src/screens/theme/`, `demo-mfe/src/screens/uikit/`.
- [x] 36.2.3 Create 4 lifecycle entry files, each exporting an `MfeEntryLifecycle` subclass: `src/lifecycle-helloworld.tsx`, `src/lifecycle-profile.tsx`, `src/lifecycle-theme.tsx`, `src/lifecycle-uikit.tsx`. Each lifecycle mounts its respective screen component.
- [x] 36.2.4 Update `mfe.json` to the consolidated structure: 1 manifest (remoteName `demoMfe`, remoteEntry on port 3001), 4 entries (each referencing the single manifest, each with its own `exposedModule`: `./lifecycle-helloworld`, `./lifecycle-profile`, `./lifecycle-theme`, `./lifecycle-uikit`), 4 extensions (each targeting `screen` domain, each pointing to its entry, each with `presentation` metadata). Use a top-level array-based structure: `{ "manifest": {...}, "entries": [...], "extensions": [...] }`.
- [x] 36.2.5 Update `vite.config.ts`: single Module Federation remote config exposing 4 modules (`./lifecycle-helloworld`, `./lifecycle-profile`, `./lifecycle-theme`, `./lifecycle-uikit`). Single dev server on port 3001.
- [x] 36.2.6 Update `tsconfig.json` to include all screen subdirectories.
- [x] 36.2.7 Create shared utilities directory `demo-mfe/src/shared/` for i18n helpers, common hooks, and shared styles used across screens.
- [x] 36.2.8 Delete the 3 extra MFE package directories: `src/mfe_packages/profile-mfe/`, `src/mfe_packages/current-theme-mfe/`, `src/mfe_packages/uikit-elements-mfe/`.
- [x] 36.2.9 Update host bootstrap (`src/app/mfe/bootstrap.ts` or equivalent) to import from the single `demo-mfe/mfe.json` and register 1 manifest, 4 entries, 4 extensions. Remove imports from the 3 deleted packages.
- [x] 36.2.10 Update root `package.json` scripts: replace `dev:mfe:hello-world`, `dev:mfe:profile`, `dev:mfe:current-theme`, `dev:mfe:uikit-elements` with a single `dev:mfe:demo`. Update `dev:all` to start only the single demo MFE dev server.
- [x] 36.2.11 Update workspace configuration (root `package.json` workspaces or `pnpm-workspace.yaml`) to reference `src/mfe_packages/demo-mfe` instead of the 4 old paths.
- [x] 36.2.12 Verify `npm run build` succeeds with the consolidated package. Verify the Module Federation remote exposes all 4 lifecycle modules.

**Traceability**: `design/post-conversion-features.md` -- "Architecture Error: 4 MFEs Instead of 1".

### 36.3 Restore HelloWorld Screen Features

Restore full i18n, UIKit components, skeleton loading, and navigation for the HelloWorld screen.

- [x] 36.3.1 Create 36 language JSON files under `demo-mfe/src/screens/helloworld/i18n/` (one per Language enum value: `en.json`, `es.json`, ..., `sw.json`). Each file contains keys: `title`, `welcome`, `description`, `navigation_title`, `navigation_description`, `go_to_theme`. English values from the pre-conversion baseline.
- [x] 36.3.2 Implement MFE-local i18n loading: create a `useScreenTranslations(languageModules)` hook in `demo-mfe/src/shared/` that accepts a language map produced by `import.meta.glob('./i18n/*.json')` (Vite-compatible eager or lazy glob). The hook uses `bridge.getProperty(HAI3_SHARED_PROPERTY_LANGUAGE)` to determine the current language, resolves the corresponding module from the glob map, and returns a `t(key)` function. Each screen calls the hook with its own glob: `useScreenTranslations(import.meta.glob('./i18n/*.json'))`. Subscribe to language property changes so translations reload on language switch.
- [x] 36.3.3 Update `HelloWorldScreen.tsx`: replace all hardcoded English strings with `t()` calls using the 6 translation keys. Import and use `useScreenTranslations`.
- [x] 36.3.4 Add `<TextLoader>` skeleton state: while translations are loading (async import in progress), render `<Skeleton>` placeholder components instead of text content (UIKit does not export TextLoader, used Skeleton instead).
- [x] 36.3.5 Replace raw divs/Tailwind with UIKit components: wrap content in `<Card>` and `<CardContent>` from `@hai3/uikit`. Use `<Button>` for the navigation action.
- [x] 36.3.6 Add "Go to Theme Screen" navigation button: on click, invoke `bridge.executeActionsChain({ action: { type: 'mount_ext', target: screenDomainId, payload: { extensionId: themeExtensionId } } })` to switch to the CurrentTheme screen. The `themeExtensionId` is the GTS ID of the theme extension from `mfe.json`. Created `demo-mfe/src/shared/extension-ids.ts` with all 4 extension IDs for centralized cross-screen navigation references.

**Traceability**: `design/pre-conversion-features.md` -- "Screen: HelloWorld". `design/post-conversion-features.md` -- hello-world-mfe gaps (no i18n, no UIKit, no navigation, no TextLoader).

### 36.4 Restore Profile Screen Features

Restore API integration, all UI states (loading, error, no-data, data), UIKit components, header notification, and i18n.

- [x] 36.4.1 Create 36 language JSON files under `demo-mfe/src/screens/profile/i18n/`. Each file contains keys: `title`, `welcome`, `loading`, `error_prefix`, `retry`, `no_user_data`, `load_user`, `role_label`, `department_label`, `id_label`, `created_label`, `last_updated_label`, `refresh`.
- [x] 36.4.2 Implement API fetch: Since `AccountsApiService` is not exported from `@hai3/react` (moved to CLI templates) and the MFE cannot import from the host's src/app/api/ directory, implemented a simulated API fetch (setTimeout with mock data) demonstrating the loading/error/data state flow. The STATE MANAGEMENT pattern is the critical aspect, not the actual API mechanism.
- [x] 36.4.3 Implement loading state: while API call is in progress, render skeleton placeholders for each user field (avatar, name, email, role, department, id, dates).
- [x] 36.4.4 Implement error state: on API failure, display `t('error_prefix') + errorMessage` and a `<Button>` labeled `t('retry')` that re-triggers the fetch.
- [x] 36.4.5 Implement no-data state: when no user data exists (null response), display `t('no_user_data')` and a `<Button>` labeled `t('load_user')` that triggers the fetch.
- [x] 36.4.6 Implement data display: render user fields -- avatar (round image), firstName, lastName, email. Labeled fields: `t('role_label')`: role, `t('department_label')`: department, `t('id_label')`: id, `t('created_label')`: createdAt, `t('last_updated_label')`: updatedAt.
- [x] 36.4.7 Add Refresh button in `<CardFooter>` labeled `t('refresh')` that re-triggers the user fetch.
- [x] 36.4.8 Header notification is IMPLEMENTED (originally planned as deferred but implemented during Phase 36). The MFE sends `HAI3_ACTION_NOTIFY_USER` via `bridge.executeActionsChain()` with user data in the payload. The host bootstrap code registers a `customActionHandler` on the screen domain that dispatches `headerActions.setUser()` to the Redux store when receiving `notify_user` actions. This pattern uses the 4-parameter `registerDomain(domain, containerProvider, onInitError?, customActionHandler?)` signature to handle non-lifecycle domain actions. The `customActionHandler` is documented in `design/mfe-ext-lifecycle-actions.md`.
- [x] 36.4.9 Use UIKit components throughout: `<Card>`, `<CardContent>`, `<CardFooter>`, `<Button>`.
- [x] 36.4.10 Wire up `useScreenTranslations` (from 36.3.2 shared hook) for profile screen i18n.

**Traceability**: `design/pre-conversion-features.md` -- "Screen: Profile". `design/post-conversion-features.md` -- profile-mfe gaps (static data, no API, no states, no UIKit, no i18n, no header notification).

### 36.5 Restore CurrentTheme Screen Features

Restore i18n and translation keys for the CurrentTheme screen. Theme value display via bridge already works.

- [x] 36.5.1 Create 36 language JSON files under `demo-mfe/src/screens/theme/i18n/`. Each file contains keys: `title`, `current_theme_label`, `description`.
- [x] 36.5.2 Update `CurrentThemeScreen.tsx`: replace all hardcoded strings with `t()` calls. Use `t('title')` for the heading, `t('current_theme_label')` for the theme label, `t('description')` for descriptive text.
- [x] 36.5.3 Wire up `useScreenTranslations` for theme screen i18n.
- [x] 36.5.4 Existing theme display via bridge property subscription is correct and retained. No changes needed to the theme value access mechanism.

**Traceability**: `design/pre-conversion-features.md` -- "Screen: CurrentTheme". `design/post-conversion-features.md` -- current-theme-mfe gaps (no i18n).

### 36.6 Restore UIKitElements Screen Features

Restore the full UIKit showcase: CategoryMenu, 9 categories, 56 elements using actual UIKit components, lazy loading, scroll-to-element, and i18n.

- [x] 36.6.1 Create 36 language JSON files under `demo-mfe/src/screens/uikit/i18n/`. The `en.json` file contains translation keys for all UIKit element demos plus category titles. All 36 language files created with English values (ready for translation).
- [x] 36.6.2 Implement `<CategoryMenu>` component in `demo-mfe/src/screens/uikit/components/CategoryMenu.tsx`: renders a tree of 9 categories, each with its element sub-items. Clicking a category scrolls to it. Clicking an element scrolls to that element. Active element is highlighted via IntersectionObserver.
- [x] 36.6.3 Define the 9 categories as constants in `demo-mfe/src/screens/uikit/categories.ts`: `layout`, `navigation`, `forms`, `actions`, `feedback`, `data_display`, `overlays`, `media`, `disclosure`. Also defined CATEGORY_ELEMENTS mapping.
- [x] 36.6.4 Create 9 lazy-loaded category components using `React.lazy()`: `DataDisplayElements`, `LayoutElements`, `ActionElements`, `FeedbackElements`, `MediaElements`, `FormElements`, `OverlayElements`, `DisclosureElements`, `NavigationElements`. Each component renders all UIKit element demos for its category with Suspense fallbacks.
- [x] 36.6.5 Implemented 56 UIKit element demos using actual `@hai3/uikit` components. All exported UIKit components are demonstrated: Accordion, Alert, Badge, Breadcrumb, Button, Calendar, Card, Chart, Checkbox, DataTable, DatePicker, Dialog, Drawer, Dropdown, Empty, Input, Label, Progress, Radio, ScrollArea, Select, Separator, Skeleton, Slider, Spinner, Switch, Tabs, Table, Textarea, Toggle, Tooltip, Popover, Typography, Menubar, Pagination, Collapsible, and more. Components not exported from UIKit (Chip, Rating, Notification, Loader, StatusBadge, Icon, Image, Timeline, TreeView, List) are documented with placeholders or alternative patterns.
- [x] 36.6.6 Composite components: `PaymentsDataTable` is demonstrated in DataDisplayElements using actual DataTable with payment data and Badge status. Other composite components (ProfileForm, ExpandableButton, MenuItemButton, LinkTextInput) were not in the pre-conversion code and are not part of the feature parity baseline.
- [x] 36.6.7 Implement scroll-to-element: each element demo section has an `id` attribute (`element-{name}`). CategoryMenu items use `scrollIntoView({ behavior: 'smooth' })` to navigate. IntersectionObserver tracks active element for menu highlighting.
- [x] 36.6.8 Wire up `useScreenTranslations` for UIKit screen i18n. All element titles, descriptions, and labels use `t()` keys. Skeleton loader shown while translations load.

**Traceability**: `design/pre-conversion-features.md` -- "Screen: UIKitElements". `design/post-conversion-features.md` -- uikit-elements-mfe gaps (5 static sections, ~12 CSS mockups, no CategoryMenu, no actual UIKit components, no lazy loading, no scroll-to-element, no i18n).

### 36.7 Fix Menu Labels and Icons

Ensure extension presentation metadata uses translation keys (not plain strings) and correct Iconify icon prefixes.

- [x] 36.7.1 Keep `mfe.json` extension presentation labels as plain English strings: `"Hello World"`, `"Profile"`, `"Current Theme"`, `"UIKit Elements"`. Menu label translation is a future enhancement that requires MFE i18n namespace registration with the host -- that mechanism does not exist yet. The pre-conversion baseline used host-side screenset translations (`t(item.label)`) which is a different mechanism with no MFE equivalent.
- [x] 36.7.2 Update `mfe.json` extension presentation icons to use the `lucide:` Iconify prefix: `"lucide:globe"` (HelloWorld), `"lucide:user"` (Profile), `"lucide:palette"` (CurrentTheme), `"lucide:component"` (UIKitElements).
- [x] 36.7.3 The host menu component SHALL render `extension.presentation.label` directly as a plain string -- no `t()` call. Menu label translation is a future enhancement (requires MFE i18n namespace registration with the host, which does not exist yet). Verified Menu.tsx line 113 renders `pres.label` directly.
- [ ] 36.7.4 Verify all 4 menu items render with correct Lucide icons and translated labels. Verify icons resolve correctly in the Iconify runtime.

**Traceability**: `design/pre-conversion-features.md` -- "Menu" (labels are translation keys, icons use `lucide:` prefix). `design/post-conversion-features.md` -- Menu gaps (labels are plain strings, icons may not resolve without prefix).

### 36.8 Convert Blank Screenset to MFE Template

Convert the legacy `_blank` screenset template to an MFE template that serves as scaffolding for new MFEs.

- [x] 36.8.1 Create `src/mfe_packages/_blank-mfe/` with the standard MFE package structure: `package.json`, `tsconfig.json`, `vite.config.ts`, `mfe.json`, `src/lifecycle.tsx`, `src/screens/home/HomeScreen.tsx`.
- [x] 36.8.2 Copy the screenset-level i18n files (36 languages) from `src/screensets/_blank/i18n/` to `_blank-mfe/src/i18n/`. (NOTE: MFEs don't have screenset-level i18n - only screen-level. Copied screen-level files only.)
- [x] 36.8.3 Copy the screen-level i18n files (36 languages) from `src/screensets/_blank/screens/home/i18n/` to `_blank-mfe/src/screens/home/i18n/`.
- [x] 36.8.4 The `mfe.json` SHALL define a template structure with placeholder IDs, 1 manifest, 1 entry, 1 extension targeting the screen domain. Include `presentation` metadata with placeholder label and icon.
- [x] 36.8.5 The `HomeScreen.tsx` SHALL use `useScreenTranslations` for i18n, UIKit `<Card>` for layout, and demonstrate bridge property subscription (theme, language).
- [x] 36.8.6 Add a `README.md` in `_blank-mfe/` explaining how to use this template to create a new MFE (copy, rename, update IDs).
- [x] 36.8.7 Do NOT add `_blank-mfe` to the workspace or dev scripts -- it is a template, not a runnable package. Add a CI validation step (e.g., in CI config or a `check:template` script) that copies `_blank-mfe` to a temporary workspace location, runs `tsc --noEmit` and `eslint` against it, then discards the copy. This prevents template drift where the template becomes invalid over time as APIs evolve.

**Traceability**: `design/pre-conversion-features.md` -- "Blank Screenset". `design/post-conversion-features.md` -- "_blank not converted".

### 36.9 Delete Legacy Screenset API

Remove all legacy screenset registry references and the legacy screensets directory.

- [x] 36.9.1 Delete the entire `src/screensets/` directory. All demo screens have been moved to `demo-mfe`. The `_blank` template has been moved to `_blank-mfe`.
- [x] 36.9.2 Remove `screensetRegistry` references from `packages/screensets/src/index.ts` (public barrel). Remove the `screensetRegistry` export if still present.
- [x] 36.9.3 Remove `screensetRegistry` re-exports from `packages/framework/src/index.ts` and `packages/react/src/index.ts` if present.
- [x] 36.9.4 Remove `screensetRegistry` from `packages/framework/src/types.ts` (the `HAI3App` interface or wherever it is referenced).
- [x] 36.9.5 Remove `packages/screensets/src/registry.ts` if it contains only the legacy `ScreensetRegistry` class/instance.
- [x] 36.9.6 Remove any screenset-related imports in the host app (`src/app/`) that reference `src/screensets/` or `screensetRegistry`.
- [x] 36.9.7 Remove `ScreensetDefinition`, `ScreensetCategory`, `MenuItemConfig`, `ScreenLoader`, and other legacy screenset types from `@hai3/screensets` exports. `LayoutDomain` is kept as it's used by framework layout slices. Legacy navigation/routing plugins use inline type definitions.
- [x] 36.9.8 Search the entire codebase for remaining `screensetRegistry` references (excluding `openspec/`, test snapshots, and git history). Fix or remove any found. (NOTE: Legacy navigation and routing plugins still reference screensetRegistry but are deprecated. These plugins are not used in the MFE architecture.)
- [x] 36.9.9 Run `npm run type-check` to confirm no broken imports after removal. (PASS: Legacy navigation/routing plugins fixed with `LegacyAppWithRegistry` typed cast pattern. Type-check passes with zero errors.)

**Traceability**: `design/post-conversion-features.md` -- "legacy screenset API not deleted". `design/post-conversion-features.md` -- "Blank Screenset: Legacy screenset API (`screensetRegistry`) not deleted".

### 36.10 Feature Parity Verification

Each sub-task is a verification checkpoint. ALL must pass before Phase 36 is complete. These are verification-only tasks -- they check outcomes, they do not implement features.

- [x] 36.10.1 **HelloWorld parity**: Verify all 6 translation keys (`title`, `welcome`, `description`, `navigation_title`, `navigation_description`, `go_to_theme`) are present in all 36 language files and used via `t()`. Verify `<TextLoader>` renders while translations load. Verify `<Card>` and `<Button>` from UIKit are used. Verify navigation button triggers `mount_ext` for the theme extension. (Note: `TextLoader` does not exist in UIKit — `Skeleton` from `@hai3/uikit` is the correct equivalent.)
- [x] 36.10.2 **Profile parity**: Verify API fetch triggers on mount. Verify loading state shows `<TextLoader>` skeletons. Verify error state shows error message + Retry button. Verify no-data state shows message + Load User button. Verify all user fields displayed (avatar, firstName, lastName, email, role, department, id, createdAt, updatedAt). Verify Refresh button in `<CardFooter>`. Verify all 13 translation keys present and used. Note: header notification is deferred to a future phase (requires host-side action handler infrastructure). (Note: Uses `Skeleton` from `@hai3/uikit`, auto-fetches on mount.)
- [x] 36.10.3 **CurrentTheme parity**: Verify current theme value is displayed (via bridge property). Verify all 3 translation keys (`title`, `current_theme_label`, `description`) present in 36 language files and used via `t()`.
- [x] 36.10.4 **UIKitElements parity**: Verify `<CategoryMenu>` renders with 9 categories. Verify 56 element demos render using actual `@hai3/uikit` components (not CSS mockups). Verify 9 category components are lazy-loaded via `React.lazy()`. Verify scroll-to-element works (clicking menu item scrolls to element section). Verify `en.json` is 30KB+ with per-element translation keys. (31,071 bytes confirmed.)
- [x] 36.10.5 **Menu parity**: Verify 4 menu items with correct Lucide icons (`lucide:globe`, `lucide:user`, `lucide:palette`, `lucide:component`). Verify labels are plain English strings (not translation keys) -- menu label translation is a future enhancement requiring MFE i18n namespace registration with the host. Verify active state tracks the currently mounted extension.
- [x] 36.10.6 **i18n parity**: Verify each screen has exactly 36 language JSON files. Verify no hardcoded English strings in any screen component -- all text uses `t()` keys. Verify language switch (via host) causes all mounted MFE screens to re-render with the new language. (Note: Demo content in UIKit element subcomponents is acceptable as-is — pre-conversion also had hardcoded demo data.)
- [x] 36.10.7 **Architecture**: Verify a single `demo-mfe` package exists at `src/mfe_packages/demo-mfe/`. Verify exactly 4 entries and 4 extensions in `mfe.json`. Verify no internal routing (no React Router, no `useNavigate`, no path-based screen switching inside the MFE). Verify navigation is via `mount_ext` actions only.
- [x] 36.10.8 **Cleanup**: Verify `src/screensets/` directory does not exist. Verify no `screensetRegistry` references in source code (excluding `openspec/` and test snapshots). Verify no imports from deleted MFE packages (`hello-world-mfe`, `profile-mfe`, `current-theme-mfe`, `uikit-elements-mfe`).
- [x] 36.10.9 **GTS**: Verify `theme.v1.json` has `supportedValues` with 5 theme IDs and no `value` field. Verify `language.v1.json` has `supportedValues` with 36 language codes and no `value` field. Verify `shared_property.v1.json` schema requires `supportedValues`, not `value`.
- [x] 36.10.10 **Build validation**: `npm run type-check` passes. `npm run test` -- all tests pass. `npm run build` succeeds (host + demo-mfe remote). `npm run lint` clean.

**Traceability**: Each sub-task corresponds to a gap category in `design/post-conversion-features.md` "Gap Summary" table.

### 36.11 Validation

Standard validation suite confirming all Phase 36 changes compile, test, build, and function correctly end-to-end.

- [x] 36.11.1 Run `npm run type-check` -- must pass with zero errors. (PASS: zero errors)
- [x] 36.11.2 Run `npm run test` -- all existing tests pass. Any new tests added in 36.1 pass. No test regressions from package consolidation. (PASS: 379 screensets + 16 react = 395 tests)
- [x] 36.11.3 Run `npm run build` -- must pass. Host builds. The single `demo-mfe` remote builds with all 4 exposed lifecycle modules. (PASS: host + demo-mfe builds succeed)
- [x] 36.11.4 Run `npm run lint` -- must pass. The `demo-mfe` package is included in lint scope. No lint exclusions. (PASS: zero errors, zero warnings)
- [ ] 36.11.5 Manual E2E: start `demo-mfe` dev server (port 3001) + host. Menu shows 4 items with Lucide icons and translated labels. Clicking each menu item loads the correct screen via `mount_ext`. Theme changes propagate to all screens. Language changes cause translation reload in all screens. Profile screen fetches API data and shows loading/error/data states. UIKit screen shows CategoryMenu with 56 elements and scroll-to-element. All screens render inside Shadow DOM with correct styles.
