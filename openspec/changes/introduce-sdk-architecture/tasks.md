# Tasks: 3-Layer SDK Architecture

## TDD Approach: Protections → Types → Implementation

---

## PREREQUISITES (MANDATORY)

### Execution Rules

**NO TASK CAN BE SKIPPED.** Every task must be completed in order. If any task reveals a conceptual problem, architectural inconsistency, or implementation blocker:

1. **STOP IMMEDIATELY** - Do not proceed to the next task
2. **DOCUMENT THE PROBLEM** - Create a detailed issue description
3. **ESCALATE** - Return to the proposal/design documents and resolve the conceptual issue
4. **UPDATE SPECS** - If the design needs changes, update proposal.md, design.md, and spec.md FIRST
5. **RESUME** - Only continue after the conceptual problem is fully resolved

**Conceptual problems include:**
- Circular dependency discovered during implementation
- Type that cannot be expressed as specified
- Backward compatibility break not anticipated
- Performance issue that invalidates the architecture
- Missing migration path for existing functionality

### Verification Checkpoints

At the end of each PHASE, all tasks in that phase MUST pass verification before proceeding:
- Phase 1: `npm run arch:check` passes
- Phase 3: Each SDK package installs and imports independently
- Phase 4: Framework and React packages install correctly
- Phase 6: All backward compatibility tests pass
- Phase 10: Full integration test suite passes

---

## PHASE 1: Protections (MUST complete before any implementation)

### 1.1 ESLint Rules for New Architecture

- [ ] 1.1.1 Create `eslint-plugin-hai3-sdk` with rules for flat SDK enforcement
- [ ] 1.1.2 Add rule: `sdk-no-cross-imports` - SDK packages cannot import other @hai3 packages
- [ ] 1.1.3 Add rule: `sdk-no-react` - SDK packages cannot import react/react-dom
- [ ] 1.1.4 Add rule: `framework-layer-imports` - framework can only import SDK packages
- [ ] 1.1.5 Add rule: `react-layer-imports` - react can only import framework (not SDK directly)
- [ ] 1.1.6 Update `.eslintrc.cjs` to include new rules
- [ ] 1.1.7 Verify rules fail on violations before any code exists

### 1.2 Dependency Cruiser Rules

- [ ] 1.2.1 Add rule: `sdk-packages-flat` - No @hai3 deps within SDK layer
- [ ] 1.2.2 Add rule: `no-uikit-contracts-in-sdk` - SDK cannot import uikit-contracts
- [ ] 1.2.3 Add rule: `no-uikit-contracts-in-framework` - Framework cannot import uikit-contracts
- [ ] 1.2.4 Add rule: `no-uikit-contracts-in-react` - React cannot import uikit-contracts
- [ ] 1.2.5 Add rule: `no-react-in-sdk` - SDK cannot import React
- [ ] 1.2.6 Add rule: `no-react-in-framework` - Framework cannot import React
- [ ] 1.2.7 Add rule: `layer-dependencies` - Enforce layer hierarchy (SDK ← Framework ← React)
- [ ] 1.2.8 Update `.dependency-cruiser.cjs` with all new rules
- [ ] 1.2.9 Run `npm run arch:deps` to verify rules are active

### 1.3 Architecture Tests

- [ ] 1.3.1 Add test: Each SDK package has zero @hai3 dependencies in package.json
- [ ] 1.3.2 Add test: Framework package.json only lists SDK packages as @hai3 deps
- [ ] 1.3.3 Add test: React package.json only lists framework as @hai3 dep
- [ ] 1.3.4 Add test: No package depends on @hai3/uikit-contracts
- [ ] 1.3.5 Add test: Build order is enforced (SDK → Framework → React)
- [ ] 1.3.6 Update `npm run arch:check` to run all new tests

### 1.4 Separate AI Infrastructure (hai3dev-* vs hai3-*)

**Establish two distinct command namespaces following Nx/Turborepo patterns**

#### 1.4.1 HAI3 Monorepo Commands (Internal Development)

- [ ] 1.4.1.1 Create `.ai/commands/internal/` directory for monorepo-only commands
- [ ] 1.4.1.2 Create `/hai3dev-publish` - Build and publish packages to npm
- [ ] 1.4.1.3 Create `/hai3dev-release` - Create version, changelog, git tags
- [ ] 1.4.1.4 Create `/hai3dev-update-guidelines` - Update AI source of truth
- [ ] 1.4.1.5 Create `/hai3dev-test-packages` - Run package integration tests
- [ ] 1.4.1.6 Ensure hai3dev-* commands are NEVER shipped to user projects
- [ ] 1.4.1.7 Add `.ai/commands/internal/` to CLI template exclusion list

#### 1.4.2 User Project Commands (Technical + Business-Friendly Aliases)

**Screenset is a fundamental HAI3 concept - keep technical commands, add business aliases**

- [ ] 1.4.2.1 Create `.ai/commands/user/` directory for shipped commands
- [ ] 1.4.2.2 Keep `/hai3-new-screenset` (fundamental HAI3 concept)
- [ ] 1.4.2.3 Keep `/hai3-new-screen` (fundamental HAI3 concept)
- [ ] 1.4.2.4 Keep `/hai3-new-api-service` (technical command)
- [ ] 1.4.2.5 Keep `/hai3-new-action` (technical command)
- [ ] 1.4.2.6 Keep `/hai3-validate` (technical command)
- [ ] 1.4.2.7 Keep `/hai3-fix-violation` (technical command)
- [ ] 1.4.2.8 Add `/hai3-add-feature` as alias for `/hai3-new-screenset` (business term)
- [ ] 1.4.2.9 Add `/hai3-add-page` as alias for `/hai3-new-screen` (business term)
- [ ] 1.4.2.10 Add `/hai3-check` as alias for `/hai3-validate` (business term)
- [ ] 1.4.2.11 Add `/hai3-fix` as alias for `/hai3-fix-violation` (business term)
- [ ] 1.4.2.12 Keep arch-explain, quick-ref, rules for developers who want them

### 1.5 CLI-Backed Commands with Protections

**All AI commands delegate to HAI3 CLI for consistency and validation**

#### 1.5.1 CLI Command Aliases (Business-Friendly)

- [ ] 1.5.1.1 Add `hai3 add feature <name>` command (alias for screenset create)
- [ ] 1.5.1.2 Add `hai3 add page <name>` command (alias for screen add)
- [ ] 1.5.1.3 Add `hai3 add service <name>` command (alias for api-service create)
- [ ] 1.5.1.4 Add `hai3 add action <name>` command (alias for action create)
- [ ] 1.5.1.5 Add `hai3 add component <name>` command
- [ ] 1.5.1.6 Add `hai3 check` command (alias for validate)
- [ ] 1.5.1.7 Add `hai3 fix` command (alias for fix-violations)

#### 1.5.2 Built-In Validation (Protections)

- [ ] 1.5.2.1 CLI runs ESLint after every scaffolding command
- [ ] 1.5.2.2 CLI runs TypeScript check after every scaffolding command
- [ ] 1.5.2.3 CLI runs `arch:check` after every scaffolding command
- [ ] 1.5.2.4 If validation fails: show clear error + suggest `hai3 fix`
- [ ] 1.5.2.5 If validation passes: show success + next steps
- [ ] 1.5.2.6 Add `--skip-validation` flag for advanced users

#### 1.5.3 Command Format (User-Friendly)

- [ ] 1.5.3.1 Define command template with "What This Does" section
- [ ] 1.5.3.2 Use business language (feature, page, service) not technical (screenset, screen)
- [ ] 1.5.3.3 Keep commands under 500 words (concise = user-friendly)
- [ ] 1.5.3.4 Always include "If Something Goes Wrong" section
- [ ] 1.5.3.5 Commands must call CLI, not implement logic directly

### 1.6 Configuration-Aware Command Generation

**Commands generated based on installed packages**

- [ ] 1.6.1 Read `package.json` dependencies in `hai3 ai sync`
- [ ] 1.6.2 Detect layer: SDK (api only), Framework (framework), React (react)
- [ ] 1.6.3 SDK layer: generate only `/hai3-add-service`
- [ ] 1.6.4 Framework layer: generate SDK + feature, action, check, fix commands
- [ ] 1.6.5 React layer: generate all commands including page, component
- [ ] 1.6.6 Store layer metadata in generated `.claude/commands/` files
- [ ] 1.6.7 `hai3 update` regenerates commands when packages change

### 1.7 Multi-Tool Support (Single Source of Truth)

**Generate files for Claude, GitHub Copilot, Cursor, Windsurf**

- [ ] 1.7.1 Create `.ai/rules/` directory with package-specific rules
- [ ] 1.7.2 Create `.ai/templates/CLAUDE.md.hbs` template
- [ ] 1.7.3 Create `.ai/templates/copilot-instructions.md.hbs` template
- [ ] 1.7.4 Create `.ai/templates/cursor-rules.md.hbs` template
- [ ] 1.7.5 Create `.ai/templates/windsurf-rules.md.hbs` template
- [ ] 1.7.6 `hai3 ai sync` generates all 4 files from templates
- [ ] 1.7.7 Only Claude gets `.claude/commands/` (others don't support commands)
- [ ] 1.7.8 Rules content is identical across all 4 tools

### 1.8 AI.md Update (Prompt Engineering Standards)

**Update `.ai/targets/AI.md` with new architecture**

- [ ] 1.8.1 Add section: TWO COMMAND NAMESPACES (hai3dev-* vs hai3-*)
- [ ] 1.8.2 Add section: CLI-BACKED COMMANDS (delegation pattern)
- [ ] 1.8.3 Add section: BUILT-IN PROTECTIONS (validation flow)
- [ ] 1.8.4 Add section: BUSINESS-FRIENDLY LANGUAGE (command naming)
- [ ] 1.8.5 Add section: CONFIGURATION-AWARE GENERATION (layer detection)
- [ ] 1.8.6 Update KEYWORDS: add PROTECTION, DELEGATE, LAYER
- [ ] 1.8.7 Update STOP CONDITIONS: never implement logic in commands
- [ ] 1.8.8 Keep AI.md under 100 lines (reference design.md for details)

### 1.9 Automated Prompt Validation (Promptfoo)

**Validate commands call CLI correctly and use business language**

- [ ] 1.9.1 Install `promptfoo` as dev dependency
- [ ] 1.9.2 Create `.ai/tests/promptfoo.yaml` main configuration
- [ ] 1.9.3 Create `.ai/tests/assertions/cli-patterns.yaml`

#### 1.9.4 Test: Commands Delegate to CLI

- [ ] 1.9.4.1 Test `/hai3-new-screenset` calls `hai3 screenset create`
- [ ] 1.9.4.2 Test `/hai3-new-screen` calls `hai3 screen add`
- [ ] 1.9.4.3 Test `/hai3-validate` calls `hai3 validate`
- [ ] 1.9.4.4 Test `/hai3-fix-violation` calls `hai3 fix`
- [ ] 1.9.4.5 Test `/hai3-add-feature` (alias) calls `hai3 screenset create`
- [ ] 1.9.4.6 Test `/hai3-add-page` (alias) calls `hai3 screen add`

#### 1.9.5 Test: Command Quality

- [ ] 1.9.5.1 Test commands explain screenset concept briefly
- [ ] 1.9.5.2 Test business aliases use simpler language
- [ ] 1.9.5.3 Test error messages are user-friendly
- [ ] 1.9.5.4 Test commands are under 500 words

#### 1.9.6 Test: Error Handling

- [ ] 1.9.6.1 Test commands suggest `/hai3-fix-violation` on errors
- [ ] 1.9.6.2 Test commands include "If Something Goes Wrong" section

#### 1.9.7 CI/CD Integration

- [ ] 1.9.7.1 Add `npm run test:prompts` script
- [ ] 1.9.7.2 Create `.github/workflows/prompt-tests.yml`
- [ ] 1.9.7.3 Block PRs that modify `.ai/` with failing tests

---

## PHASE 2: Types & Interfaces (Before implementation)

### 2.1 @hai3/events Types

- [ ] 2.1.1 Define `EventBus<TEvents>` interface with full generics
- [ ] 2.1.2 Define `EventPayloadMap` base interface (empty, augmentable)
- [ ] 2.1.3 Define `Unsubscribe` type
- [ ] 2.1.4 Define `EventHandler<T>` type
- [ ] 2.1.5 Define template literal types for event naming convention
- [ ] 2.1.6 Define `Action<TPayload>` type (pure function, returns void)
- [ ] 2.1.7 Define `createAction` function signature (type-safe action factory)
- [ ] 2.1.8 Export all types from `@hai3/events/types`

### 2.2 @hai3/store Types

- [ ] 2.2.1 Define `RootState` base interface (augmentable)
- [ ] 2.2.2 Define `AppDispatch` type
- [ ] 2.2.3 Define `SliceObject<TState>` interface
- [ ] 2.2.4 Define `EffectInitializer` type
- [ ] 2.2.5 Define `registerSlice` function signature
- [ ] 2.2.6 Export all types from `@hai3/store/types`

### 2.3 @hai3/layout Types

- [ ] 2.3.1 Define `LayoutDomain` enum (Header, Footer, Menu, Sidebar, Screen, Popup, Overlay)
- [ ] 2.3.2 Define `LayoutDomainState<TConfig>` generic interface
- [ ] 2.3.3 Define `ScreenConfig` interface
- [ ] 2.3.4 Define `MenuItemConfig` interface
- [ ] 2.3.5 Define `ScreensetDefinition` interface
- [ ] 2.3.6 Define `ScreensetCategory` enum
- [ ] 2.3.7 Define branded types: `ScreensetId`, `ScreenId`
- [ ] 2.3.8 Define all domain slice state interfaces
- [ ] 2.3.9 Export all types from `@hai3/layout/types`

### 2.4 @hai3/api Types

- [ ] 2.4.1 Define `ApiService` base interface
- [ ] 2.4.2 Define `ApiProtocol` interface
- [ ] 2.4.3 Define `RestProtocolConfig` interface
- [ ] 2.4.4 Define `SseProtocolConfig` interface
- [ ] 2.4.5 Define `MockMap` type
- [ ] 2.4.6 Define `ApiRegistry` interface
- [ ] 2.4.7 Export all types from `@hai3/api/types`

### 2.5 @hai3/i18n Types

- [ ] 2.5.1 Define `Language` enum (36 languages)
- [ ] 2.5.2 Define `TranslationLoader` type
- [ ] 2.5.3 Define `TranslationDictionary` type
- [ ] 2.5.4 Define `I18nRegistry` interface
- [ ] 2.5.5 Define `TextDirection` enum
- [ ] 2.5.6 Export all types from `@hai3/i18n/types`

### 2.6 @hai3/framework Types

- [ ] 2.6.1 Define `HAI3Config` interface
- [ ] 2.6.2 Define `ScreensetRegistry` interface
- [ ] 2.6.3 Define `ThemeRegistry` interface
- [ ] 2.6.4 Define `RouteRegistry` interface
- [ ] 2.6.5 Define `createHAI3App` function signature
- [ ] 2.6.6 Export all types from `@hai3/framework/types`

#### 2.6.7 Plugin System Types

- [ ] 2.6.7.1 Define `HAI3Plugin<TConfig>` interface with name, dependencies, provides, lifecycle hooks
- [ ] 2.6.7.2 Define `HAI3AppBuilder` interface with `.use()` and `.build()` methods
- [ ] 2.6.7.3 Define `HAI3App` interface (built app with registries, store, actions)
- [ ] 2.6.7.4 Define `PluginProvides` interface (registries, slices, effects, actions)
- [ ] 2.6.7.5 Define `PluginLifecycle` interface (onRegister, onInit, onDestroy)
- [ ] 2.6.7.6 Define `ScreensetsConfig` interface for screensets plugin config
- [ ] 2.6.7.7 Define `Preset` type as `() => HAI3Plugin[]`

### 2.7 @hai3/react Types

- [ ] 2.7.1 Define `HAI3ProviderProps` interface
- [ ] 2.7.2 Define hook return types for all hooks
- [ ] 2.7.3 Define `AppRouterProps` interface
- [ ] 2.7.4 Export all types from `@hai3/react/types`

---

## PHASE 3: SDK Package Implementation

### 3.1 @hai3/events Package

- [ ] 3.1.1 Create `packages/events/` directory structure
- [ ] 3.1.2 Create `packages/events/package.json` (zero dependencies)
- [ ] 3.1.3 Create `packages/events/tsconfig.json`
- [ ] 3.1.4 Create `packages/events/tsup.config.ts`
- [ ] 3.1.5 Implement `EventBus` class
- [ ] 3.1.6 Export singleton `eventBus` instance
- [ ] 3.1.7 Implement `createAction` helper function
- [ ] 3.1.8 Create `packages/events/src/index.ts` with all exports
- [ ] 3.1.9 Verify: `npm run build:packages:events` succeeds
- [ ] 3.1.10 Verify: Zero @hai3 dependencies in package.json

### 3.2 @hai3/store Package

- [ ] 3.2.1 Create `packages/store/` directory structure
- [ ] 3.2.2 Create `packages/store/package.json` (only redux-toolkit dep)
- [ ] 3.2.3 Create `packages/store/tsconfig.json`
- [ ] 3.2.4 Create `packages/store/tsup.config.ts`
- [ ] 3.2.5 Implement Redux store creation
- [ ] 3.2.6 Implement `registerSlice()` function
- [ ] 3.2.7 Create `packages/store/src/index.ts` with all exports
- [ ] 3.2.8 Verify: `npm run build:packages:store` succeeds
- [ ] 3.2.9 Verify: Zero @hai3 dependencies in package.json

### 3.3 @hai3/layout Package

- [ ] 3.3.1 Create `packages/layout/` directory structure
- [ ] 3.3.2 Create `packages/layout/package.json` (only redux-toolkit dep)
- [ ] 3.3.3 Create `packages/layout/tsconfig.json`
- [ ] 3.3.4 Create `packages/layout/tsup.config.ts`
- [ ] 3.3.5 Implement all domain slices (header, footer, menu, sidebar, screen, popup, overlay)
- [ ] 3.3.6 Export selectors for each domain
- [ ] 3.3.7 Create `packages/layout/src/index.ts` with all exports
- [ ] 3.3.8 Verify: `npm run build:packages:layout` succeeds
- [ ] 3.3.9 Verify: Zero @hai3 dependencies in package.json

### 3.4 @hai3/api Package

- [ ] 3.4.1 Create `packages/api/` directory structure
- [ ] 3.4.2 Create `packages/api/package.json` (only axios dep)
- [ ] 3.4.3 Create `packages/api/tsconfig.json`
- [ ] 3.4.4 Create `packages/api/tsup.config.ts`
- [ ] 3.4.5 Implement `BaseApiService` class
- [ ] 3.4.6 Implement `RestProtocol`
- [ ] 3.4.7 Implement `SseProtocol`
- [ ] 3.4.8 Implement `MockPlugin`
- [ ] 3.4.9 Implement `apiRegistry`
- [ ] 3.4.10 Create `packages/api/src/index.ts` with all exports
- [ ] 3.4.11 Verify: `npm run build:packages:api` succeeds
- [ ] 3.4.12 Verify: Zero @hai3 dependencies in package.json

### 3.5 @hai3/i18n Package

- [ ] 3.5.1 Create `packages/i18n/` directory structure
- [ ] 3.5.2 Create `packages/i18n/package.json` (zero dependencies)
- [ ] 3.5.3 Create `packages/i18n/tsconfig.json`
- [ ] 3.5.4 Create `packages/i18n/tsup.config.ts`
- [ ] 3.5.5 Implement `I18nRegistry` class
- [ ] 3.5.6 Implement translation loading logic
- [ ] 3.5.7 Implement `Language` enum and metadata
- [ ] 3.5.8 Create `packages/i18n/src/index.ts` with all exports
- [ ] 3.5.9 Verify: `npm run build:packages:i18n` succeeds
- [ ] 3.5.10 Verify: Zero @hai3 dependencies in package.json

### 3.6 Package-Level AI Documentation

**Each package includes CLAUDE.md for `hai3 ai sync --detect-packages`**

- [ ] 3.6.1 Create `packages/events/CLAUDE.md` with events package rules
- [ ] 3.6.2 Create `packages/store/CLAUDE.md` with store package rules
- [ ] 3.6.3 Create `packages/layout/CLAUDE.md` with layout package rules
- [ ] 3.6.4 Create `packages/api/CLAUDE.md` with api package rules
- [ ] 3.6.5 Create `packages/i18n/CLAUDE.md` with i18n package rules
- [ ] 3.6.6 Create `packages/framework/CLAUDE.md` with framework package rules
- [ ] 3.6.7 Create `packages/react/CLAUDE.md` with react package rules
- [ ] 3.6.8 Create `packages/uikit/CLAUDE.md` with uikit package rules (standalone)
- [ ] 3.6.9 Add CLAUDE.md to each package's `files` array in package.json
- [ ] 3.6.10 Verify: `hai3 ai sync --detect-packages` reads all CLAUDE.md files

### 3.7 SDK Package Installation Testing (CHECKPOINT)

**Each SDK package MUST install and work independently in a fresh project.**

#### 3.7.1 @hai3/events Installation Test

- [ ] 3.7.1.1 Create temp directory: `mkdir -p /tmp/test-events && cd /tmp/test-events`
- [ ] 3.7.1.2 Initialize: `npm init -y`
- [ ] 3.7.1.3 Install: `npm install @hai3/events` (or `npm pack` + local install)
- [ ] 3.7.1.4 Inspect package.json dependencies: MUST be empty (zero deps)
- [ ] 3.7.1.5 Inspect node_modules: ONLY @hai3/events folder exists
- [ ] 3.7.1.6 Test import in Node.js: `node -e "const { eventBus, createAction } = require('@hai3/events'); console.log(typeof eventBus.emit)"`
- [ ] 3.7.1.7 Test ESM import: Create test.mjs with `import { eventBus } from '@hai3/events'`
- [ ] 3.7.1.8 Verify NO React dependency pulled in
- [ ] 3.7.1.9 Cleanup: `rm -rf /tmp/test-events`

#### 3.7.2 @hai3/store Installation Test

- [ ] 3.7.2.1 Create temp directory: `mkdir -p /tmp/test-store && cd /tmp/test-store`
- [ ] 3.7.2.2 Initialize: `npm init -y`
- [ ] 3.7.2.3 Install: `npm install @hai3/store`
- [ ] 3.7.2.4 Inspect package.json dependencies: ONLY @reduxjs/toolkit
- [ ] 3.7.2.5 Inspect node_modules: NO @hai3/* packages except @hai3/store
- [ ] 3.7.2.6 Test import: `node -e "const { store, registerSlice } = require('@hai3/store'); console.log(typeof store.getState)"`
- [ ] 3.7.2.7 Verify redux-toolkit is the ONLY external dependency
- [ ] 3.7.2.8 Verify NO React dependency pulled in
- [ ] 3.7.2.9 Cleanup: `rm -rf /tmp/test-store`

#### 3.7.3 @hai3/layout Installation Test

- [ ] 3.7.3.1 Create temp directory: `mkdir -p /tmp/test-layout && cd /tmp/test-layout`
- [ ] 3.7.3.2 Initialize: `npm init -y`
- [ ] 3.7.3.3 Install: `npm install @hai3/layout`
- [ ] 3.7.3.4 Inspect package.json dependencies: ONLY @reduxjs/toolkit
- [ ] 3.7.3.5 Inspect node_modules: NO @hai3/* packages except @hai3/layout
- [ ] 3.7.3.6 Test import: `node -e "const { LayoutDomain, headerSlice } = require('@hai3/layout'); console.log(typeof headerSlice)"`
- [ ] 3.7.3.7 Verify NO @hai3/events or @hai3/store pulled in
- [ ] 3.7.3.8 Verify NO React dependency pulled in
- [ ] 3.7.3.9 Cleanup: `rm -rf /tmp/test-layout`

#### 3.7.4 @hai3/api Installation Test

- [ ] 3.7.4.1 Create temp directory: `mkdir -p /tmp/test-api && cd /tmp/test-api`
- [ ] 3.7.4.2 Initialize: `npm init -y`
- [ ] 3.7.4.3 Install: `npm install @hai3/api`
- [ ] 3.7.4.4 Inspect package.json dependencies: ONLY axios
- [ ] 3.7.4.5 Inspect node_modules: NO @hai3/* packages except @hai3/api
- [ ] 3.7.4.6 Test import: `node -e "const { BaseApiService, apiRegistry } = require('@hai3/api'); console.log(typeof BaseApiService)"`
- [ ] 3.7.4.7 Verify axios is the ONLY external dependency
- [ ] 3.7.4.8 Verify NO React dependency pulled in
- [ ] 3.7.4.9 Cleanup: `rm -rf /tmp/test-api`

#### 3.7.5 @hai3/i18n Installation Test

- [ ] 3.7.5.1 Create temp directory: `mkdir -p /tmp/test-i18n && cd /tmp/test-i18n`
- [ ] 3.7.5.2 Initialize: `npm init -y`
- [ ] 3.7.5.3 Install: `npm install @hai3/i18n`
- [ ] 3.7.5.4 Inspect package.json dependencies: MUST be empty (zero deps)
- [ ] 3.7.5.5 Inspect node_modules: ONLY @hai3/i18n folder exists
- [ ] 3.7.5.6 Test import: `node -e "const { I18nRegistry, Language } = require('@hai3/i18n'); console.log(typeof I18nRegistry)"`
- [ ] 3.7.5.7 Verify NO external dependencies pulled in
- [ ] 3.7.5.8 Verify NO React dependency pulled in
- [ ] 3.7.5.9 Cleanup: `rm -rf /tmp/test-i18n`

#### 3.7.6 Cross-Package Isolation Verification

- [ ] 3.7.6.1 Verify: `npm ls @hai3/events` in @hai3/store shows NOT installed
- [ ] 3.7.6.2 Verify: `npm ls @hai3/store` in @hai3/layout shows NOT installed
- [ ] 3.7.6.3 Verify: `npm ls @hai3/api` in @hai3/events shows NOT installed
- [ ] 3.7.6.4 Run `npm pack` on each SDK package and inspect tarball contents
- [ ] 3.7.6.5 Verify each package's `package.json` has NO @hai3/* in dependencies
- [ ] 3.7.6.6 Document total install size for each SDK package

---

## PHASE 4: Framework & React Packages

### 4.1 @hai3/framework Package

#### 4.1.0 Package Setup

- [ ] 4.1.0.1 Create `packages/framework/` directory structure
- [ ] 4.1.0.2 Create `packages/framework/package.json` (deps: all SDK packages)
- [ ] 4.1.0.3 Create `packages/framework/tsconfig.json`
- [ ] 4.1.0.4 Create `packages/framework/tsup.config.ts`

#### 4.1.1 Plugin System Core (MUST implement first)

- [ ] 4.1.1.1 Implement `createHAI3()` builder function
- [ ] 4.1.1.2 Implement `HAI3AppBuilder` class with `.use()` method
- [ ] 4.1.1.3 Implement `HAI3AppBuilder.build()` method
- [ ] 4.1.1.4 Implement plugin dependency resolution:
  - Auto-add missing deps with DEFAULT config when unambiguous
  - Warn (don't duplicate) when dep exists with custom config
  - Error only if plugin cannot be instantiated
- [ ] 4.1.1.5 Implement plugin lifecycle management (onRegister, onInit, onDestroy)
- [ ] 4.1.1.6 Implement registry aggregation from plugins
- [ ] 4.1.1.7 Implement slice aggregation and store configuration from plugins
- [ ] 4.1.1.8 Implement effect aggregation from plugins
- [ ] 4.1.1.9 Implement action aggregation from plugins
- [ ] 4.1.1.10 Add error handling for missing plugin dependencies

#### 4.1.2 Individual Plugins

- [ ] 4.1.2.1 Implement `screensets()` plugin (screensetRegistry, screenSlice - NO navigation actions)
- [ ] 4.1.2.2 Implement `themes()` plugin (themeRegistry, changeTheme action)
- [ ] 4.1.2.3 Implement `layout()` plugin (header, footer, menu, sidebar, popup, overlay slices + effects)
- [ ] 4.1.2.4 Implement `routing()` plugin (routeRegistry, URL sync)
- [ ] 4.1.2.5 Implement `effects()` plugin (core effect coordination infrastructure)
- [ ] 4.1.2.6 Implement `navigation()` plugin (navigateToScreen, navigateToScreenset actions + URL effects)
- [ ] 4.1.2.7 Implement `i18n()` plugin (i18nRegistry wiring, setLanguage action)

#### 4.1.3 Presets

- [ ] 4.1.3.1 Implement `presets.full()` - all plugins for full HAI3 experience
- [ ] 4.1.3.2 Implement `presets.minimal()` - screensets + themes only
- [ ] 4.1.3.3 Implement `presets.headless()` - screensets only for external integration
- [ ] 4.1.3.4 Implement `createHAI3App()` convenience function using full preset

#### 4.1.4 Registries (via plugins)

- [ ] 4.1.4.1 Implement `createScreensetRegistry()` factory
- [ ] 4.1.4.2 Implement `createThemeRegistry()` factory
- [ ] 4.1.4.3 Implement `createRouteRegistry()` factory

#### 4.1.5 Actions (via plugins)

- [ ] 4.1.5.1 Implement navigation actions (`navigateToScreen`, `navigateToScreenset`)
- [ ] 4.1.5.2 Implement layout actions (`showPopup`, `hidePopup`, `showOverlay`, `hideOverlay`)
- [ ] 4.1.5.3 Implement theme actions (`changeTheme`)
- [ ] 4.1.5.4 Implement language actions (`setLanguage`)

#### 4.1.6 Package Finalization

- [ ] 4.1.6.1 Create `packages/framework/src/index.ts` with all exports
- [ ] 4.1.6.2 Export: `createHAI3`, `createHAI3App`, `presets`
- [ ] 4.1.6.3 Export: individual plugins (`screensets`, `themes`, `layout`, etc.)
- [ ] 4.1.6.4 Export: all types from `@hai3/framework/types`
- [ ] 4.1.6.5 Verify: `npm run build:packages:framework` succeeds
- [ ] 4.1.6.6 Verify: Only SDK packages as @hai3 dependencies

#### 4.1.7 Plugin System Testing

- [ ] 4.1.7.1 Test: `createHAI3().use(screensets()).build()` works (headless mode)
- [ ] 4.1.7.2 Test: `createHAI3().use(presets.full()).build()` works (all plugins)
- [ ] 4.1.7.3 Test: Plugin dependency auto-resolution (layout adds screensets if missing)
- [ ] 4.1.7.4 Test: Missing dependency throws clear error message
- [ ] 4.1.7.5 Test: `app.screensetRegistry` is accessible after build
- [ ] 4.1.7.6 Test: `app.store` is configured with plugin slices
- [ ] 4.1.7.7 Test: Plugin lifecycle hooks are called in correct order
- [ ] 4.1.7.8 Test: Tree-shaking - unused plugins not in bundle (verify with bundlesize)

### 4.2 @hai3/react Package

- [ ] 4.2.1 Create `packages/react/` directory structure
- [ ] 4.2.2 Create `packages/react/package.json` (deps: framework, react)
- [ ] 4.2.3 Create `packages/react/tsconfig.json`
- [ ] 4.2.4 Create `packages/react/tsup.config.ts`
- [ ] 4.2.5 Implement `HAI3Provider` component
- [ ] 4.2.6 Implement `useAppDispatch` hook
- [ ] 4.2.7 Implement `useAppSelector` hook
- [ ] 4.2.8 Implement `useTranslation` hook
- [ ] 4.2.9 Implement `useScreenTranslations` hook
- [ ] 4.2.10 Implement `AppRouter` component
- [ ] 4.2.11 Implement effect lifecycle wiring (useEffect-based)
- [ ] 4.2.12 Create `packages/react/src/index.ts` with all exports
- [ ] 4.2.13 Verify: `npm run build:packages:react` succeeds
- [ ] 4.2.14 Verify: Only framework as @hai3 dependency
- [ ] 4.2.15 Verify: NO Layout components in this package

### 4.3 Framework & React Installation Testing (CHECKPOINT)

**Verify correct dependency chains and no unexpected transitive deps.**

#### 4.3.1 @hai3/framework Installation Test

- [ ] 4.3.1.1 Create temp directory: `mkdir -p /tmp/test-framework && cd /tmp/test-framework`
- [ ] 4.3.1.2 Initialize: `npm init -y`
- [ ] 4.3.1.3 Install: `npm install @hai3/framework`
- [ ] 4.3.1.4 Inspect dependencies: MUST include ALL 5 SDK packages
- [ ] 4.3.1.5 Verify: `npm ls @hai3/events` shows it as dependency of framework
- [ ] 4.3.1.6 Verify: `npm ls @hai3/store` shows it as dependency of framework
- [ ] 4.3.1.7 Verify: `npm ls @hai3/layout` shows it as dependency of framework
- [ ] 4.3.1.8 Verify: `npm ls @hai3/api` shows it as dependency of framework
- [ ] 4.3.1.9 Verify: `npm ls @hai3/i18n` shows it as dependency of framework
- [ ] 4.3.1.10 Verify NO React in node_modules (framework is headless)
- [ ] 4.3.1.11 Verify NO @hai3/uikit-contracts anywhere in tree
- [ ] 4.3.1.12 Test import: `node -e "const { screensetRegistry, createHAI3App } = require('@hai3/framework')"`
- [ ] 4.3.1.13 Document total install size
- [ ] 4.3.1.14 Cleanup: `rm -rf /tmp/test-framework`

#### 4.3.2 @hai3/react Installation Test

- [ ] 4.3.2.1 Create temp directory: `mkdir -p /tmp/test-react && cd /tmp/test-react`
- [ ] 4.3.2.2 Initialize: `npm init -y`
- [ ] 4.3.2.3 Install: `npm install @hai3/react react react-dom`
- [ ] 4.3.2.4 Inspect dependencies: @hai3/framework ONLY as @hai3 dep
- [ ] 4.3.2.5 Verify: `npm ls @hai3/framework` shows direct dependency
- [ ] 4.3.2.6 Verify: SDK packages come transitively via framework
- [ ] 4.3.2.7 Verify: NO direct SDK package deps in @hai3/react package.json
- [ ] 4.3.2.8 Verify NO @hai3/uikit-contracts anywhere in tree
- [ ] 4.3.2.9 Verify NO @hai3/uicore anywhere in tree
- [ ] 4.3.2.10 Test import in Node.js: `node -e "require('@hai3/react')"`
- [ ] 4.3.2.11 Verify: NO Layout/Header/Footer/Menu components exported
- [ ] 4.3.2.12 Document total install size (should be SDK + framework + react)
- [ ] 4.3.2.13 Cleanup: `rm -rf /tmp/test-react`

#### 4.3.3 Dependency Tree Verification

- [ ] 4.3.3.1 Run `npm ls --all` in test-react and save output
- [ ] 4.3.3.2 Verify dependency tree matches expected hierarchy:
  ```
  @hai3/react
  └── @hai3/framework
      ├── @hai3/events (zero deps)
      ├── @hai3/store (redux-toolkit only)
      ├── @hai3/layout (redux-toolkit only)
      ├── @hai3/api (axios only)
      └── @hai3/i18n (zero deps)
  ```
- [ ] 4.3.3.3 Verify NO peer dependency warnings during install
- [ ] 4.3.3.4 Verify NO deprecated package warnings
- [ ] 4.3.3.5 Run `npm audit` and verify no security vulnerabilities

---

## PHASE 5: CLI Updates

### 5.1 New Scaffold Commands

- [ ] 5.1.1 Add `hai3 scaffold` command group to CLI
- [ ] 5.1.2 Implement `hai3 scaffold layout --ui-kit=<shadcn|mui|custom>`
- [ ] 5.1.3 Create layout templates for custom (no @hai3/uikit imports, available NOW)
- [ ] 5.1.4 Structure templates to allow future shadcn option
- [ ] 5.1.5 Structure templates to allow future MUI option
- [ ] 5.1.6 Implement template variable substitution
- [ ] 5.1.7 Add `hai3 scaffold screenset <name>` command
- [ ] 5.1.8 Update `hai3 create` to use new architecture
- [ ] 5.1.9 Add `hai3 update layout` command for template updates

### 5.2 CLI Template Structure

**@hai3/uikit as default, custom (no uikit) available now**

#### 5.2.1 Default Templates (@hai3/uikit)

- [ ] 5.2.1.1 Create `packages/cli/templates/layout/hai3-uikit/` directory
- [ ] 5.2.1.2 Create Layout.tsx template (imports from @hai3/uikit)
- [ ] 5.2.1.3 Create Header.tsx template (imports from @hai3/uikit)
- [ ] 5.2.1.4 Create Footer.tsx template (imports from @hai3/uikit)
- [ ] 5.2.1.5 Create Menu.tsx template (imports from @hai3/uikit)
- [ ] 5.2.1.6 Create Sidebar.tsx template (imports from @hai3/uikit)
- [ ] 5.2.1.7 Create Screen.tsx template (imports from @hai3/uikit)
- [ ] 5.2.1.8 Create Popup.tsx template (imports from @hai3/uikit)
- [ ] 5.2.1.9 Create Overlay.tsx template (imports from @hai3/uikit)

#### 5.2.2 Custom Templates (no bundled uikit)

- [ ] 5.2.2.1 Create `packages/cli/templates/layout/custom/` directory
- [ ] 5.2.2.2 Create Layout.tsx template (placeholder components, no @hai3/uikit)
- [ ] 5.2.2.3 Create Header.tsx template (placeholder, no @hai3/uikit)
- [ ] 5.2.2.4 Create Footer.tsx template (placeholder, no @hai3/uikit)
- [ ] 5.2.2.5 Create Menu.tsx template (placeholder, no @hai3/uikit)
- [ ] 5.2.2.6 Create Sidebar.tsx template (placeholder, no @hai3/uikit)
- [ ] 5.2.2.7 Create Screen.tsx template (placeholder, no @hai3/uikit)
- [ ] 5.2.2.8 Create Popup.tsx template (placeholder, no @hai3/uikit)
- [ ] 5.2.2.9 Create Overlay.tsx template (placeholder, no @hai3/uikit)
- [ ] 5.2.2.10 Document how to implement custom UI components

### 5.3 AI Sync Command

- [ ] 5.3.1 Implement `hai3 ai sync` command
- [ ] 5.3.2 Read `.ai/rules/_meta.json` configuration (rules + commands)
- [ ] 5.3.3 Combine rules from `.ai/rules/*.md` files
- [ ] 5.3.4 Generate `CLAUDE.md` output
- [ ] 5.3.5 Generate `.github/copilot-instructions.md` output
- [ ] 5.3.6 Generate `.cursor/rules/hai3.md` output
- [ ] 5.3.7 Generate `.windsurf/rules/hai3.md` output
- [ ] 5.3.8 Generate `.claude/commands/*.md` from `.ai/commands/` (layer-filtered)
- [ ] 5.3.9 Implement `--tool=<claude|copilot|cursor|windsurf>` option
- [ ] 5.3.10 Implement `--detect-packages` to read from node_modules/@hai3/*/CLAUDE.md
- [ ] 5.3.11 Filter commands by layer based on installed packages
- [ ] 5.3.12 Add `hai3 ai sync` to project templates' npm scripts

### 5.4 CLI Update Command Enhancement

- [ ] 5.4.1 Enhance `hai3 update` to run `hai3 ai sync` after package updates
- [ ] 5.4.2 Preserve user modifications in `.ai/rules/app.md` during sync
- [ ] 5.4.3 Show diff of updated rules/commands
- [ ] 5.4.4 Add `--skip-ai-sync` option to skip AI file regeneration

### 5.5 Layer Support in Create Command

- [ ] 5.5.1 Add `--layer=<sdk|framework|react>` option to `hai3 create`
- [ ] 5.5.2 Generate layer-appropriate `.ai/rules/_meta.json`
- [ ] 5.5.3 Generate layer-appropriate package.json dependencies
- [ ] 5.5.4 Generate layer-appropriate commands in `.claude/commands/`
- [ ] 5.5.5 Run `hai3 ai sync` after project creation
- [ ] 5.5.6 Document layer options in CLI help

### 5.6 CLI Documentation

- [ ] 5.6.1 Update CLI README with new commands
- [ ] 5.6.2 Add examples for each scaffold command
- [ ] 5.6.3 Add examples for `hai3 ai sync` command
- [ ] 5.6.4 Document template customization options
- [ ] 5.6.5 Document layer options for project creation
- [ ] 5.6.6 Document AI commands and their layer requirements

---

## PHASE 6: Deprecation & Migration

### 6.0 CRITICAL: State Structure Migration

**Current state structure uses `uicore.X` nesting - new structure uses flat keys**

Current: `state.uicore.header`, `state.uicore.menu`, `state.uicore.screen`
New: `state.header`, `state.menu`, `state.screen` (or moved to `@hai3/layout`)

- [ ] 6.0.1 Document current state shape for backward compatibility
- [ ] 6.0.2 Add state migration helper in `@hai3/framework`
- [ ] 6.0.3 Update all selectors to use new state paths
- [ ] 6.0.4 Provide `createLegacySelector()` helper for old state paths
- [ ] 6.0.5 Add deprecation warnings for `state.uicore.X` access patterns
- [ ] 6.0.6 Document migration guide for existing apps

### 6.1 @hai3/uicore Deprecation

- [ ] 6.1.1 Update `packages/uicore/package.json` to depend on framework + react
- [ ] 6.1.2 Replace `packages/uicore/src/index.ts` with re-exports
- [ ] 6.1.3 Add deprecation notice to package.json description
- [ ] 6.1.4 Add console.warn on import suggesting migration
- [ ] 6.1.5 Verify all existing uicore imports still work
- [ ] 6.1.6 Re-export `<Layout>` component for backward compat (renders CLI-generated layout)

### 6.1.A Layout Components Migration

**Current: Layout components are in @hai3/uicore. New: CLI-generated in user's project.**

Components to migrate: Layout, Header, Footer, Menu, Sidebar, Screen, Popup, Overlay

- [ ] 6.1.A.1 Identify all Layout component usages in existing apps
- [ ] 6.1.A.2 Create wrapper `<LegacyLayout>` that renders CLI-generated components
- [ ] 6.1.A.3 Export `<Layout>` from uicore that renders `<LegacyLayout>`
- [ ] 6.1.A.4 Add migration guide: "Run `hai3 scaffold layout` then update imports"
- [ ] 6.1.A.5 Test existing app with deprecated Layout still works

### 6.1.B Actions Refactoring

**Current: Actions call registries. New: Actions are pure event emitters.**

Current `navigateToScreen` calls `routeRegistry.hasScreen()`, `screensetRegistry.getMenuItems()`.
This violates pure function principle - move validation to effects.

- [ ] 6.1.B.1 Audit all actions in `core/actions/` for registry calls
- [ ] 6.1.B.2 Move `routeRegistry.hasScreen()` check to navigation effect
- [ ] 6.1.B.3 Move `screensetRegistry.getMenuItems()` call to menu effect
- [ ] 6.1.B.4 Update `navigateToScreen` to only emit event (pure)
- [ ] 6.1.B.5 Update `navigateToScreenset` to only emit event (pure)
- [ ] 6.1.B.6 Verify effects handle validation and show warnings

### 6.2 @hai3/uikit-contracts Migration (30+ imports across packages)

**Current contracts types used: ButtonVariant, ButtonSize, Theme, UiKitComponent, UiKitIcon, TextDirection, ComponentName, UiKitComponentMap, IconButtonSize**

#### 6.2.1 Move types to appropriate new packages

- [ ] 6.2.1.1 Move `Theme` type to `@hai3/framework` (theme registry owns this)
- [ ] 6.2.1.2 Move `TextDirection` to `@hai3/i18n` (i18n concern)
- [ ] 6.2.1.3 Move `ButtonVariant`, `ButtonSize`, `IconButtonSize` to `@hai3/uikit` (component concern)
- [ ] 6.2.1.4 Move `UiKitComponentMap`, `ComponentName` to `@hai3/framework` (registry concern)
- [ ] 6.2.1.5 Move `UiKitComponent`, `UiKitIcon` helpers to `@hai3/framework`

#### 6.2.2 Update @hai3/uikit imports (12 files)

- [ ] 6.2.2.1 Update `base/button.tsx` - import from local types
- [ ] 6.2.2.2 Update `base/pagination.tsx` - import from local types
- [ ] 6.2.2.3 Update `base/calendar.tsx` - import from local types
- [ ] 6.2.2.4 Update `base/carousel.tsx` - import from local types
- [ ] 6.2.2.5 Update `base/dropdown-menu.tsx` - define TextDirection locally (uikit has NO @hai3 deps)
- [ ] 6.2.2.6 Update `composite/buttons/IconButton.tsx` - import from local types
- [ ] 6.2.2.7 Update `composite/buttons/DropdownButton.tsx` - import from local types
- [ ] 6.2.2.8 Update `composite/chat/ThreadList.tsx` - import from local types
- [ ] 6.2.2.9 Update `composite/chat/ChatInput.tsx` - import from local types
- [ ] 6.2.2.10 Update `styles/applyTheme.ts` - define Theme interface locally (uikit has NO @hai3 deps)

#### 6.2.3 Update @hai3/uicore imports (10 files)

- [ ] 6.2.3.1 Update `uikit/uikitRegistry.ts` - import from `@hai3/framework`
- [ ] 6.2.3.2 Update `layout/domains/header/Header.tsx` - will be CLI-generated
- [ ] 6.2.3.3 Update `layout/domains/footer/Footer.tsx` - will be CLI-generated
- [ ] 6.2.3.4 Update `layout/domains/menu/Menu.tsx` - will be CLI-generated
- [ ] 6.2.3.5 Update `layout/domains/screen/Screen.tsx` - will be CLI-generated
- [ ] 6.2.3.6 Update `components/ScreensetSelector.tsx` - import from `@hai3/framework`
- [ ] 6.2.3.7 Update `components/ThemeSelector.tsx` - import from `@hai3/framework`
- [ ] 6.2.3.8 Update `components/UserInfo.tsx` - import from `@hai3/framework`
- [ ] 6.2.3.9 Update `theme/themeRegistry.ts` - import from `@hai3/framework`
- [ ] 6.2.3.10 Update `i18n/types.ts` - import from `@hai3/i18n`
- [ ] 6.2.3.11 Update `i18n/TextLoader.tsx` - import from `@hai3/framework`

#### 6.2.4 Update @hai3/studio imports (3 files)

- [ ] 6.2.4.1 Update `sections/ScreensetSelector.tsx` - import from `@hai3/uikit`
- [ ] 6.2.4.2 Update `sections/ThemeSelector.tsx` - import from `@hai3/uikit`
- [ ] 6.2.4.3 Update `sections/LanguageSelector.tsx` - import from `@hai3/uikit`

#### 6.2.5 Update CLI templates (5 files)

- [ ] 6.2.5.1 Update `templates/src/themes/default.ts` - import from `@hai3/framework`
- [ ] 6.2.5.2 Update `templates/src/themes/dark.ts` - import from `@hai3/framework`
- [ ] 6.2.5.3 Update `templates/src/themes/light.ts` - import from `@hai3/framework`
- [ ] 6.2.5.4 Update `templates/src/themes/dracula.ts` - import from `@hai3/framework`
- [ ] 6.2.5.5 Update `templates/src/themes/dracula-large.ts` - import from `@hai3/framework`
- [ ] 6.2.5.6 Update `templates/src/screensets/demo/components/FormElements.tsx` - import from `@hai3/uikit`

#### 6.2.6 Deprecation

- [ ] 6.2.6.1 Mark package as deprecated in package.json
- [ ] 6.2.6.2 Add deprecation notice to README
- [ ] 6.2.6.3 Re-export ALL types from `@hai3/uikit-contracts` for backward compat
- [ ] 6.2.6.4 Add console.warn on import suggesting migration paths
- [ ] 6.2.6.5 Plan removal in future major version (v2.0)

### 6.3 @hai3/uikit Stays as Package (Default UI Kit)

**@hai3/uikit remains a standalone npm package, used as CLI default**

- [ ] 6.3.1 Verify @hai3/uikit has NO @hai3 SDK/framework/react dependencies
- [ ] 6.3.2 Verify @hai3/uikit is NOT in dependency tree of SDK packages
- [ ] 6.3.3 Update CLI templates to import from `@hai3/uikit`
- [ ] 6.3.4 CLI `hai3 scaffold layout` adds `@hai3/uikit` to user's package.json
- [ ] 6.3.5 Document that @hai3/uikit is default but swappable

---

## PHASE 7: Build System Updates

### 7.1 Build Order

- [ ] 7.1.1 Update root `package.json` with new build order:
  - SDK: events, store, layout, api, i18n (parallel)
  - framework
  - react
  - uikit (standalone, can build in parallel with SDK)
  - uicore (deprecated, re-exports only)
  - studio
  - cli
- [ ] 7.1.2 Add individual build scripts for each new package
- [ ] 7.1.3 Update `npm run clean:artifacts` for new packages
- [ ] 7.1.4 Update `npm run clean:deps` for new packages

### 7.2 Workspace Configuration

- [ ] 7.2.1 Update root `package.json` workspaces array
- [ ] 7.2.2 Verify `npm ci` installs all packages correctly
- [ ] 7.2.3 Verify cross-package TypeScript references work

---

## PHASE 8: Documentation Updates

### 8.1 Project Documentation

- [ ] 8.1.1 Update `README.md` with new architecture
- [ ] 8.1.2 Update `QUICK_START.md` for new CLI commands
- [ ] 8.1.3 Update `docs/MANIFEST.md` with new philosophy
- [ ] 8.1.4 Update `docs/ROADMAP.md` to reflect completed SDK work

### 8.2 OpenSpec Updates

- [ ] 8.2.1 Update `openspec/project.md` with new package structure
- [ ] 8.2.2 Add new specs for each SDK package

---

## PHASE 9: Test Setup

### 9.1 Copy Test Screensets

**Temporarily copy screensets from ~/Dev/hai3-samples for comprehensive testing**

Note: Screensets are auto-discovered via Vite glob pattern (`*Screenset.tsx`). No manual registration needed.

- [ ] 9.1.1 Copy `~/Dev/hai3-samples/src/screensets/chat/` to `src/screensets/chat/`
- [ ] 9.1.2 Copy `~/Dev/hai3-samples/src/screensets/machine-monitoring/` to `src/screensets/machine-monitoring/`
- [ ] 9.1.3 Verify screensets are auto-discovered (check console log for "Auto-discovered X screenset(s)")
- [ ] 9.1.4 Verify test screensets build without errors
- [ ] 9.1.5 Run `npm run dev` and verify all screensets load

---

## PHASE 10: Final Validation

### 10.1 Architecture Validation

- [ ] 10.1.1 Run `npm run arch:check` - all tests pass
- [ ] 10.1.2 Run `npm run arch:deps` - all dependency rules pass
- [ ] 10.1.3 Run `npm run arch:unused` - no unused exports

### 10.2 Build Validation

- [ ] 10.2.1 Run `npm run type-check` - all packages pass
- [ ] 10.2.2 Run `npm run lint` - no errors
- [ ] 10.2.3 Run `npm run build` - full build succeeds

### 10.3 SDK Isolation Tests

- [ ] 10.3.1 Test: Import only @hai3/events in Node.js script - works
- [ ] 10.3.2 Test: Import only @hai3/store in Node.js script - works
- [ ] 10.3.3 Test: Import only @hai3/api in Node.js script - works
- [ ] 10.3.4 Test: Import only @hai3/i18n in Node.js script - works
- [ ] 10.3.5 Verify: No React dependencies in SDK packages
- [ ] 10.3.6 Verify: No @hai3 inter-dependencies in SDK packages

### 10.4 CLI Scaffold Tests

- [ ] 10.4.1 Test: `hai3 scaffold layout` generates files with @hai3/uikit imports (default)
- [ ] 10.4.2 Test: `hai3 scaffold layout --ui-kit=custom` generates files WITHOUT @hai3/uikit
- [ ] 10.4.3 Test: `hai3 create test-app` creates working project with @hai3/uikit
- [ ] 10.4.4 Test: `hai3 create test-app --ui-kit=custom` creates project without @hai3/uikit
- [ ] 10.4.5 Test: Generated project builds without errors
- [ ] 10.4.6 Test: Generated project runs in browser
- [ ] 10.4.7 Test: `hai3 ai sync` generates all 4 tool files
- [ ] 10.4.8 Cleanup: Remove test-app directories

### 10.5 Chrome DevTools MCP Testing

**Thorough browser testing using Chrome DevTools MCP**

- [ ] 10.5.1 Start dev server: `npm run dev`
- [ ] 10.5.2 Navigate to http://localhost:5173
- [ ] 10.5.3 Verify: Layout renders correctly (Header, Sidebar, Menu, Screen)
- [ ] 10.5.4 Verify: No console errors on page load
- [ ] 10.5.5 Test: Demo screenset - navigate to HelloWorld screen
- [ ] 10.5.6 Test: Chat screenset - navigate and verify threads/messages render
- [ ] 10.5.7 Test: Machine Monitoring screenset - verify charts/data render
- [ ] 10.5.8 Test: Navigation between screensets works
- [ ] 10.5.9 Test: Menu item clicks trigger correct navigation
- [ ] 10.5.10 Test: Popup/Overlay functionality works
- [ ] 10.5.11 Test: Theme switching works
- [ ] 10.5.12 Test: i18n language switching works
- [ ] 10.5.13 Verify: No network errors in DevTools
- [ ] 10.5.14 Verify: Redux state updates correctly (via console or Redux DevTools)
- [ ] 10.5.15 Take screenshot of each screenset for documentation

### 10.6 Backward Compatibility Tests

- [ ] 10.6.1 Test: Existing app using @hai3/uicore imports - still works
- [ ] 10.6.2 Test: Deprecation warnings appear in dev mode
- [ ] 10.6.3 Verify: All @hai3/uicore exports are available

### 10.7 Plugin System & External Integration Tests

**Test the plugin architecture for external platform integration (screensets-only use case)**

#### 10.7.1 Headless Preset Tests

- [ ] 10.7.1.1 Create test project using `createHAI3().use(presets.headless()).build()`
- [ ] 10.7.1.2 Verify: Only screensets plugin is active
- [ ] 10.7.1.3 Verify: `app.screensetRegistry` is available and works
- [ ] 10.7.1.4 Verify: `app.store` is configured with screen slice only
- [ ] 10.7.1.5 Verify: Layout domains (header, menu, footer) are NOT registered
- [ ] 10.7.1.6 Verify: Bundle size is smaller than full preset

#### 10.7.2 Custom Plugin Composition Tests

- [ ] 10.7.2.1 Test: `createHAI3().use(screensets()).use(themes()).build()` works
- [ ] 10.7.2.2 Test: Individual plugins can be imported and used
- [ ] 10.7.2.3 Test: Unused plugins are tree-shaken from bundle
- [ ] 10.7.2.4 Verify: Plugin dependency auto-resolution works

#### 10.7.3 External Platform Integration Simulation

- [ ] 10.7.3.1 Create mock "external platform" with custom menu component
- [ ] 10.7.3.2 Integrate HAI3 screensets using headless preset
- [ ] 10.7.3.3 Render HAI3 screens inside external platform's layout
- [ ] 10.7.3.4 Verify: External menu can navigate to HAI3 screens
- [ ] 10.7.3.5 Verify: HAI3 screen state is managed correctly
- [ ] 10.7.3.6 Verify: No conflicts between external platform and HAI3
- [ ] 10.7.3.7 Document integration pattern for external platforms

### 10.8 AI Guidelines Validation

- [ ] 10.8.1 Verify each file in `.ai/` against `.ai/targets/AI.md`
- [ ] 10.8.2 Run `hai3 ai sync` and verify all 4 files generated
- [ ] 10.8.3 Verify CLAUDE.md content is accurate
- [ ] 10.8.4 Verify .github/copilot-instructions.md content is accurate
- [ ] 10.8.5 Verify .cursor/rules/hai3.md content is accurate
- [ ] 10.8.6 Verify .windsurf/rules/hai3.md content is accurate

### 10.9 Automated Prompt Validation

- [ ] 10.9.1 Run `npm run test:prompts` - all tests pass
- [ ] 10.9.2 Verify coverage report shows ≥80% coverage
- [ ] 10.9.3 Run each test 3 times - variance <30%
- [ ] 10.9.4 Verify `/hai3-validate` correctly detects:
  - [ ] Direct dispatch violations
  - [ ] Internal import violations
  - [ ] Circular dependency violations
  - [ ] Missing ID constants violations
- [ ] 10.9.5 Verify `/hai3-new-screenset` generates correct imports
- [ ] 10.9.6 Verify `/hai3-new-action` generates correct `createAction` usage
- [ ] 10.9.7 Verify all commands are under 500 words
- [ ] 10.9.8 Verify GitHub Actions workflow syntax is valid
- [ ] 10.9.9 Document any flaky tests for future investigation

---

## PHASE 11: Cleanup

### 11.1 Remove Test Screensets

- [ ] 11.1.1 Remove `src/screensets/chat/` (copied for testing)
- [ ] 11.1.2 Remove `src/screensets/machine-monitoring/` (copied for testing)
- [ ] 11.1.3 Verify test screensets are no longer auto-discovered (check console for screenset count)
- [ ] 11.1.4 Verify build still passes with demo screenset only
- [ ] 11.1.5 Final `npm run arch:check` - all tests pass
