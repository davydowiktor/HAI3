# 3-Layer SDK Architecture

## Purpose

Defines the 3-layer SDK architecture for HAI3: flat SDK packages, headless framework, and React adapter with CLI-generated layout rendering.

## ADDED Requirements

### Requirement: Flat SDK Layer

The system SHALL provide 5 flat SDK packages with ZERO @hai3 inter-dependencies, each with a single responsibility.

#### Scenario: SDK packages have no @hai3 dependencies

- **WHEN** checking any SDK package's `package.json` (events, store, layout, api, i18n)
- **THEN** no `@hai3/*` packages appear in dependencies or peerDependencies
- **AND** the package can be used standalone without other HAI3 packages

#### Scenario: @hai3/events package

- **WHEN** importing from `@hai3/events`
- **THEN** `EventBus`, `eventBus`, `EventPayloadMap` are available
- **AND** `Action` type and `createAction` helper are available
- **AND** the package has ZERO external dependencies
- **AND** it works in Node.js without React

#### Scenario: @hai3/store package

- **WHEN** importing from `@hai3/store`
- **THEN** `store`, `registerSlice`, `RootState`, `AppDispatch` are available
- **AND** the only external dependency is `@reduxjs/toolkit`
- **AND** it has ZERO @hai3 dependencies

#### Scenario: @hai3/layout package

- **WHEN** importing from `@hai3/layout`
- **THEN** domain slices, types, and selectors are available (header, footer, menu, sidebar, screen, popup, overlay)
- **AND** `LayoutDomain`, `ScreensetDefinition`, `MenuItemConfig` types are available
- **AND** the only external dependency is `@reduxjs/toolkit`
- **AND** it has ZERO @hai3 dependencies

#### Scenario: @hai3/api package

- **WHEN** importing from `@hai3/api`
- **THEN** `BaseApiService`, `RestProtocol`, `SseProtocol`, `MockPlugin`, `apiRegistry` are available
- **AND** the only external dependency is `axios`
- **AND** it has ZERO @hai3 dependencies

#### Scenario: @hai3/i18n package

- **WHEN** importing from `@hai3/i18n`
- **THEN** `I18nRegistry`, `Language`, `TranslationLoader` are available
- **AND** the package has ZERO external dependencies
- **AND** it has ZERO @hai3 dependencies

### Requirement: Framework Layer

The system SHALL provide a `@hai3/framework` package that wires SDK packages together without React dependencies.

#### Scenario: Framework depends only on SDK packages

- **WHEN** checking `@hai3/framework` package.json
- **THEN** only SDK packages appear as @hai3 dependencies: events, store, layout, api, i18n
- **AND** NO React or react-dom dependency exists
- **AND** NO @hai3/uikit-contracts dependency exists

#### Scenario: Framework provides registries

- **WHEN** importing from `@hai3/framework`
- **THEN** `screensetRegistry`, `themeRegistry`, `routeRegistry` are available
- **AND** registries use event bus for notifications
- **AND** registries are type-safe with module augmentation

#### Scenario: Framework provides effect coordination

- **WHEN** importing from `@hai3/framework`
- **THEN** effect handlers are available for wiring events to state changes
- **AND** `createHAI3App()` function initializes all wiring

#### Scenario: Framework works without React

- **WHEN** using `@hai3/framework` in a Node.js script
- **THEN** all registries and wiring work correctly
- **AND** no React-specific errors occur

### Requirement: Action Pattern

The system SHALL define the action pattern (types and helpers) in `@hai3/events`, with action instances in `@hai3/framework` and user code.

#### Scenario: @hai3/events provides action pattern

- **WHEN** importing from `@hai3/events`
- **THEN** `Action<TPayload>` type is available
- **AND** `createAction(eventName)` helper function is available
- **AND** actions created with `createAction` are fully typed via `EventPayloadMap`

#### Scenario: Action type definition

- **WHEN** defining an action
- **THEN** it MUST be a pure function that returns void
- **AND** it MUST only emit events via `eventBus.emit()`
- **AND** it MUST NOT dispatch directly to Redux store

#### Scenario: Framework provides core action instances via plugins

- **WHEN** using `createHAI3App()` (full preset)
- **THEN** all actions are available on the app instance:
  - navigation actions: `navigateToScreen`, `navigateToScreenset` (from navigation plugin)
  - layout actions: `showPopup`, `hidePopup`, `showOverlay`, `hideOverlay` (from layout plugin)
  - theme actions: `changeTheme` (from themes plugin)
  - language actions: `setLanguage` (from i18n plugin)
- **AND** all actions are created using `createAction` from `@hai3/events`

#### Scenario: Action availability depends on plugins

- **WHEN** using `createHAI3().use(presets.headless()).build()`
- **THEN** navigation/layout/theme/language actions are NOT available
- **AND** only screensets plugin capabilities are present
- **BECAUSE** headless preset only includes screensets plugin

#### Scenario: User-defined action instances

- **WHEN** a screenset needs domain-specific actions
- **THEN** actions are defined in user's screenset code (e.g., `src/screensets/chat/actions/`)
- **AND** actions use `createAction` from `@hai3/events`
- **AND** actions emit screenset-specific events

#### Scenario: SDK packages export only primitives

- **WHEN** checking SDK package exports (store, layout, api, i18n)
- **THEN** no action instances are exported
- **AND** only primitives (types, slices, registries) are available
- **BUT** `@hai3/events` exports the action pattern (`Action` type, `createAction` helper)

### Requirement: React Adapter Layer

The system SHALL provide a `@hai3/react` package with React bindings but NO layout rendering components.

#### Scenario: React depends only on framework

- **WHEN** checking `@hai3/react` package.json
- **THEN** only `@hai3/framework` appears as @hai3 dependency
- **AND** NO direct SDK package imports (events, store, layout, api, i18n)
- **AND** NO @hai3/uikit-contracts dependency exists

#### Scenario: React provides HAI3Provider

- **WHEN** importing from `@hai3/react`
- **THEN** `HAI3Provider` component is available
- **AND** it wraps the app with Redux Provider and initializes effects

#### Scenario: React provides hooks

- **WHEN** importing from `@hai3/react`
- **THEN** hooks are available: `useAppDispatch`, `useAppSelector`, `useTranslation`, `useScreenTranslations`
- **AND** hooks are fully typed with TypeScript

#### Scenario: React provides AppRouter

- **WHEN** importing from `@hai3/react`
- **THEN** `AppRouter` component is available for routing
- **AND** it integrates with framework's routeRegistry

#### Scenario: React has NO layout components

- **WHEN** checking `@hai3/react` exports
- **THEN** NO Layout, Header, Footer, Menu, Sidebar, Screen, Popup, Overlay components exist
- **AND** layout rendering is provided via CLI scaffolding

### Requirement: CLI-Generated Layout

The system SHALL provide CLI commands to scaffold layout components into the user's project, using @hai3/uikit as the default.

#### Scenario: Scaffold layout command exists

- **WHEN** running `hai3 scaffold layout`
- **THEN** layout components are generated in `src/layout/`
- **AND** generated files include: Layout.tsx, Header.tsx, Footer.tsx, Menu.tsx, Sidebar.tsx, Screen.tsx, Popup.tsx, Overlay.tsx
- **AND** generated code imports from `@hai3/uikit` (default)

#### Scenario: Default uses @hai3/uikit

- **WHEN** running `hai3 scaffold layout` without `--ui-kit` option
- **THEN** generated components import from `@hai3/uikit`
- **AND** `@hai3/uikit` is added to package.json dependencies if not present
- **AND** generated components import hooks from `@hai3/react`
- **AND** generated components import types/selectors from `@hai3/layout`

#### Scenario: Custom UI kit option (no bundled uikit)

- **WHEN** running `hai3 scaffold layout --ui-kit=custom`
- **THEN** generated components do NOT import from `@hai3/uikit`
- **AND** generated components use placeholder component references
- **AND** user provides their own UI component implementations
- **AND** `@hai3/uikit` is NOT added to package.json

#### Scenario: Future UI kit options (shadcn, mui)

- **WHEN** reviewing CLI scaffold architecture
- **THEN** design allows adding `--ui-kit=<shadcn|mui>` options in the future
- **AND** current implementation supports `@hai3/uikit` (default) and `custom`

#### Scenario: User owns generated code

- **WHEN** layout is scaffolded
- **THEN** the code is copied to user's project (not symlinked)
- **AND** user can freely modify the generated code
- **AND** layout rendering is decoupled from @hai3/react package

### Requirement: No uikit-contracts Dependency

The system SHALL NOT require `@hai3/uikit-contracts` in any layer.

#### Scenario: SDK packages don't depend on uikit-contracts

- **WHEN** checking any SDK package's dependencies
- **THEN** `@hai3/uikit-contracts` does NOT appear

#### Scenario: Framework doesn't depend on uikit-contracts

- **WHEN** checking `@hai3/framework` dependencies
- **THEN** `@hai3/uikit-contracts` does NOT appear

#### Scenario: React doesn't depend on uikit-contracts

- **WHEN** checking `@hai3/react` dependencies
- **THEN** `@hai3/uikit-contracts` does NOT appear

#### Scenario: CLI templates use user's UI kit directly

- **WHEN** layout is scaffolded
- **THEN** generated components import from user's UI kit (shadcn, MUI, etc.)
- **AND** no abstraction layer via contracts is needed

### Requirement: Type-Safe Module Augmentation

The system SHALL use TypeScript module augmentation for extensibility across packages.

#### Scenario: EventPayloadMap augmentation

- **WHEN** a screenset defines custom events
- **THEN** it augments `EventPayloadMap` from `@hai3/events`
- **AND** custom events are type-safe in `eventBus.emit()` and `eventBus.on()`

#### Scenario: RootState augmentation

- **WHEN** a screenset registers a slice
- **THEN** it augments `RootState` from `@hai3/store`
- **AND** slice state is available in `useAppSelector()` with full typing

#### Scenario: Type safety across layers

- **WHEN** types are augmented in one layer
- **THEN** they are visible in all dependent layers
- **AND** TypeScript provides full IntelliSense

### Requirement: Layer Dependency Rules

The system SHALL enforce strict layer dependencies via ESLint and dependency-cruiser.

**IMPORTANT**: Layer rules apply to **PACKAGE dependencies** (what a package lists in package.json), NOT to **user/generated code**. User code and CLI-generated layout code CAN import from any @hai3 package.

#### Scenario: SDK layer isolation

- **WHEN** running `npm run arch:deps`
- **THEN** any @hai3 import within SDK packages fails validation
- **AND** any React import within SDK packages fails validation

#### Scenario: Framework layer constraints

- **WHEN** running `npm run arch:deps`
- **THEN** framework can only import from SDK layer
- **AND** framework cannot import React
- **AND** framework cannot import uikit-contracts

#### Scenario: React layer constraints

- **WHEN** running `npm run arch:deps`
- **THEN** react can only import from framework
- **AND** react cannot directly import SDK packages
- **AND** react cannot import uikit-contracts

#### Scenario: User code can import any package

- **WHEN** user code (screensets, generated layout) imports from @hai3 packages
- **THEN** it CAN import from any layer: `@hai3/events`, `@hai3/layout`, `@hai3/react`
- **AND** layer rules do NOT apply to user's src/ directory
- **AND** this allows generated layout to import selectors from `@hai3/layout`

### Requirement: Build Order

The system SHALL build packages in layer order with SDK packages parallelizable.

#### Scenario: SDK packages build in parallel

- **WHEN** running `npm run build:packages`
- **THEN** SDK packages (events, store, layout, api, i18n) can build in parallel
- **AND** they have no build-time dependencies on each other

#### Scenario: Framework builds after SDK

- **WHEN** running `npm run build:packages`
- **THEN** framework builds after ALL SDK packages complete
- **AND** framework depends on SDK package type definitions

#### Scenario: React builds after framework

- **WHEN** running `npm run build:packages`
- **THEN** react builds after framework completes
- **AND** react depends on framework type definitions

### Requirement: Backward Compatibility

The system SHALL maintain backward compatibility for existing `@hai3/uicore` users.

#### Scenario: uicore re-exports work

- **WHEN** importing from `@hai3/uicore`
- **THEN** all previously available exports are still available
- **AND** they are re-exported from framework and react packages

#### Scenario: Deprecation warning

- **WHEN** importing from `@hai3/uicore`
- **THEN** a deprecation warning is logged (in development)
- **AND** documentation suggests migration to framework/react

#### Scenario: Existing apps still work

- **WHEN** an existing app uses `@hai3/uicore`
- **THEN** it continues to work without code changes
- **AND** Layout component is still available (re-exported from scaffolded location or legacy)

### Requirement: SOLID Compliance

The system SHALL comply with all SOLID principles.

#### Scenario: Single Responsibility

- **WHEN** reviewing any package
- **THEN** it has ONE primary reason to change
- **AND** responsibilities do not overlap between packages

#### Scenario: Open/Closed

- **WHEN** adding new functionality
- **THEN** it is done via module augmentation or registry registration
- **AND** core package code does not require modification

#### Scenario: Interface Segregation

- **WHEN** a user needs only event bus functionality
- **THEN** they import only `@hai3/events`
- **AND** they do not receive Redux, axios, or React as dependencies

#### Scenario: Dependency Inversion

- **WHEN** reviewing package dependencies
- **THEN** high-level packages depend on abstractions (interfaces, types)
- **AND** no package depends on concrete uikit implementation

### Requirement: Plugin Architecture

The system SHALL provide a plugin-based architecture in `@hai3/framework` that allows users to compose only the features they need.

#### Scenario: Plugin interface contract

- **WHEN** creating a new plugin
- **THEN** it implements the `HAI3Plugin` interface
- **AND** it declares a unique `name` property
- **AND** it optionally declares `dependencies` on other plugins
- **AND** it optionally provides `registries`, `slices`, `effects`, and/or `actions`

#### Scenario: createHAI3 builder pattern

- **WHEN** importing from `@hai3/framework`
- **THEN** `createHAI3()` function is available
- **AND** it returns a builder with `.use(plugin)` method
- **AND** it returns a builder with `.build()` method that creates the app

#### Scenario: Plugin composition

- **WHEN** using `createHAI3().use(plugin1).use(plugin2).build()`
- **THEN** only the specified plugins are initialized
- **AND** only dependencies of those plugins are included
- **AND** unused plugins are not bundled (tree-shaking)

#### Scenario: Presets for common configurations

- **WHEN** importing from `@hai3/framework`
- **THEN** `presets.full()` is available (all plugins)
- **AND** `presets.minimal()` is available (screensets + themes)
- **AND** `presets.headless()` is available (screensets only)

#### Scenario: Full preset is default

- **WHEN** using `createHAI3App()` convenience function
- **THEN** it is equivalent to `createHAI3().use(presets.full()).build()`
- **AND** all plugins are included for full HAI3 experience

#### Scenario: Headless preset for external integration

- **WHEN** an external platform wants only screenset orchestration
- **THEN** they use `createHAI3().use(presets.headless()).build()`
- **AND** only `screensets` plugin is included
- **AND** layout domains (header, footer, menu, etc.) are NOT included
- **AND** they can render HAI3 screens in their own layout

#### Scenario: Individual plugin imports

- **WHEN** importing individual plugins
- **THEN** `screensets`, `themes`, `layout`, `routing`, `effects`, `navigation`, `i18n` are available
- **AND** each can be used independently via `.use(plugin())`

#### Scenario: Plugin dependency auto-resolution

- **WHEN** a plugin declares dependencies on other plugins
- **AND** the dependencies are not explicitly added
- **AND** no conflicting plugin with custom config exists
- **THEN** the system auto-adds missing dependencies with DEFAULT config

#### Scenario: Plugin dependency conflict warning

- **WHEN** a plugin declares dependencies on other plugins
- **AND** the dependency already exists with CUSTOM config
- **THEN** the system logs a warning about the existing configuration
- **AND** does NOT add a duplicate plugin

#### Scenario: Screensets-only integration

- **WHEN** using `createHAI3().use(screensets()).build()`
- **THEN** `app.screensetRegistry` is available
- **AND** `app.store` is available (for screen state)
- **AND** layout domains are NOT registered
- **AND** the company can use their own menu/header/routing

#### Scenario: Plugin provides registries

- **WHEN** a plugin provides registries (e.g., `screensetRegistry`)
- **THEN** they are accessible on the built app instance
- **AND** they are typed correctly via TypeScript

#### Scenario: Plugin lifecycle hooks

- **WHEN** a plugin defines `onInit` lifecycle hook
- **THEN** it is called after all plugins are registered
- **AND** it receives the app instance
- **WHEN** a plugin defines `onDestroy` lifecycle hook
- **THEN** it is called when the app is destroyed

### Requirement: UI Kit Support

The system SHALL keep @hai3/uikit as a standalone npm package, used as the default UI kit option at CLI level.

#### Scenario: @hai3/uikit remains a package

- **WHEN** checking `@hai3/uikit` in packages/
- **THEN** it exists as a standalone npm package
- **AND** it is NOT deprecated
- **AND** it is NOT converted to CLI template

#### Scenario: @hai3/uikit is CLI default

- **WHEN** running `hai3 create my-app`
- **THEN** `@hai3/uikit` is added to project dependencies
- **AND** layout templates import from `@hai3/uikit`

- **WHEN** running `hai3 scaffold layout`
- **THEN** generated code imports from `@hai3/uikit`
- **AND** CLI adds `@hai3/uikit` to package.json if not present

#### Scenario: @hai3/uikit is not part of SDK layers

- **WHEN** checking `@hai3/uikit` package.json
- **THEN** it has NO @hai3 SDK package dependencies (events, store, layout, api, i18n)
- **AND** it has NO @hai3/framework dependency
- **AND** it has NO @hai3/react dependency
- **AND** it is a standalone package that can be used independently

#### Scenario: @hai3/uikit can build in parallel with SDK

- **WHEN** running `npm run build:packages`
- **THEN** @hai3/uikit can build in parallel with SDK packages
- **AND** it does NOT wait for SDK, framework, or react packages

#### Scenario: Architecture supports UI kit options

- **WHEN** reviewing CLI scaffold architecture
- **THEN** `--ui-kit=custom` is available NOW (no bundled UI kit)
- **AND** `--ui-kit=<shadcn|mui>` options are planned for future
- **AND** layout templates are structured to support multiple UI kit variants
- **AND** @hai3/uikit is the default option

### Requirement: Separate AI Infrastructure

The system SHALL provide two distinct command namespaces: `hai3dev-*` for HAI3 framework development and `hai3-*` for user project development.

#### Scenario: Monorepo commands are internal only

- **WHEN** checking HAI3 monorepo `.claude/commands/`
- **THEN** `hai3dev-publish.md`, `hai3dev-release.md`, `hai3dev-update-guidelines.md`, `hai3dev-test-packages.md` exist
- **AND** these commands are NEVER included in user project templates
- **AND** these commands are excluded from `hai3 ai sync` generation

#### Scenario: User commands include technical and business-friendly aliases

- **WHEN** checking user project `.claude/commands/`
- **THEN** technical commands exist: `/hai3-new-screenset`, `/hai3-new-screen`, `/hai3-validate`, `/hai3-fix-violation`
- **AND** business-friendly aliases exist: `/hai3-add-feature`, `/hai3-add-page`, `/hai3-check`, `/hai3-fix`
- **AND** technical commands use HAI3 terminology (screenset is fundamental concept)
- **AND** business aliases provide simpler language for non-technical users

### Requirement: CLI-Backed Commands

The system SHALL ensure all AI commands delegate to HAI3 CLI for consistency and validation.

#### Scenario: Commands call CLI

- **WHEN** `/hai3-add-feature` is executed by AI
- **THEN** it runs `hai3 add feature <name> --category=<category>`
- **AND** CLI handles all scaffolding logic
- **AND** CLI handles all validation

#### Scenario: CLI has business-friendly aliases

- **WHEN** running `hai3 add feature billing`
- **THEN** it is equivalent to `hai3 screenset create billing`
- **WHEN** running `hai3 add page settings`
- **THEN** it is equivalent to `hai3 screen add settings`
- **WHEN** running `hai3 check`
- **THEN** it is equivalent to `hai3 validate`

#### Scenario: CLI runs protections automatically

- **WHEN** any `hai3 add *` command completes scaffolding
- **THEN** CLI automatically runs `npm run lint`
- **AND** CLI automatically runs `npm run type-check`
- **AND** CLI automatically runs `npm run arch:check`
- **AND** if any validation fails, CLI shows error and suggests `hai3 fix`
- **AND** if all validations pass, CLI shows success and next steps

#### Scenario: Commands are under 500 words

- **WHEN** measuring any user command in `.claude/commands/`
- **THEN** word count is less than 500
- **AND** command includes "What This Does" section
- **AND** command includes "If Something Goes Wrong" section

### Requirement: Configuration-Aware Command Generation

The system SHALL generate commands based on installed HAI3 packages.

#### Scenario: SDK-only project commands

- **WHEN** project has only `@hai3/api` in dependencies
- **THEN** `hai3 ai sync` generates only `/hai3-add-service`
- **AND** no feature, page, or component commands are generated

#### Scenario: Framework project commands

- **WHEN** project has `@hai3/framework` in dependencies
- **THEN** `hai3 ai sync` generates `/hai3-add-service`, `/hai3-add-feature`, `/hai3-add-action`, `/hai3-check`, `/hai3-fix`
- **AND** no page or component commands are generated

#### Scenario: React project commands

- **WHEN** project has `@hai3/react` in dependencies
- **THEN** `hai3 ai sync` generates all commands including `/hai3-add-page`, `/hai3-add-component`

#### Scenario: Package changes trigger regeneration

- **WHEN** running `hai3 update` and packages change
- **THEN** `hai3 ai sync` is run automatically
- **AND** commands are regenerated based on new package configuration

### Requirement: Multi-Tool Support

The system SHALL support Claude, GitHub Copilot, Cursor, and Windsurf with single source of truth.

#### Scenario: Single source generates all files

- **WHEN** running `hai3 ai sync`
- **THEN** `CLAUDE.md` is generated for Claude Code
- **AND** `.github/copilot-instructions.md` is generated for GitHub Copilot
- **AND** `.cursor/rules/hai3.md` is generated for Cursor
- **AND** `.windsurf/rules/hai3.md` is generated for Windsurf

#### Scenario: Only Claude gets commands

- **WHEN** running `hai3 ai sync`
- **THEN** `.claude/commands/` directory is generated with commands
- **AND** other tools get rules/instructions only (no commands)

#### Scenario: Rules are identical across tools

- **WHEN** comparing rule content across generated files
- **THEN** core rules are identical in all 4 files
- **AND** only formatting differs per tool requirements

### Requirement: Automated Prompt Validation

The system SHALL provide automated testing for AI commands and rules without human involvement using Promptfoo.

#### Scenario: Promptfoo test suite exists

- **WHEN** checking `.ai/tests/` directory
- **THEN** `promptfoo.yaml` configuration file exists
- **AND** test files exist for each AI command
- **AND** reusable assertions exist in `assertions/hai3-patterns.yaml`

#### Scenario: Event-driven pattern detection

- **WHEN** running prompt tests with code containing `store.dispatch(setTheme('dark'))`
- **THEN** the AI command output identifies it as a violation
- **AND** suggests using `eventBus.emit()` or action creators instead
- **AND** the test passes via LLM-as-a-judge assertion

#### Scenario: Import violation detection

- **WHEN** running prompt tests with code containing `import { internal } from '@hai3/uicore/src/internal'`
- **THEN** the AI command output identifies it as a violation
- **AND** suggests using public exports only
- **AND** the test passes via contains/regex assertion

#### Scenario: CI/CD integration

- **WHEN** a pull request modifies `.ai/rules/` or `.ai/commands/`
- **THEN** GitHub Actions runs `npm run test:prompts`
- **AND** the PR is blocked if tests fail
- **AND** prompt effectiveness metrics are reported

#### Scenario: Test coverage tracking

- **WHEN** running `npm run test:prompts`
- **THEN** a coverage report is generated
- **AND** the report shows which rules have tests
- **AND** the report shows which commands have tests
- **AND** minimum 80% coverage is required for CI to pass

#### Scenario: Consistency validation

- **WHEN** running the same prompt test 3 times
- **THEN** variance in outputs is measured
- **AND** high variance (>30%) flags the prompt for review
- **AND** metrics are tracked over time

#### Scenario: Token efficiency tracking

- **WHEN** analyzing a command prompt
- **THEN** word count is measured
- **AND** commands exceeding 500 words are flagged
- **AND** efficiency score (value/tokens) is calculated
