<!-- @standalone:override -->
# FrontX AI Guidelines (Canonical)

## AI WORKFLOW (REQUIRED)
- Route: select target file from Routing section.
- Read: MUST read target file before changing code or docs.
- Summarize: list 3-7 rules from target file (internal, not written).
- Verify: pass Pre-diff Checklist before proposing code.
- STOP: if unsure which target applies, ask instead of guessing.

## CRITICAL RULE
- FORBIDDEN: Making changes based on assumed rules without reading target file.
- REQUIRED: When user says "follow X.md rules", read X.md before any change.

## ROUTING

### SDK Layer (L1) - Zero @cyberfabric dependencies
- packages/state -> .ai/targets/STORE.md
- packages/screensets -> .ai/targets/LAYOUT.md
- packages/api -> .ai/targets/API.md
- packages/i18n -> .ai/targets/I18N.md
- packages/auth -> .ai/targets/AUTH.md

### Framework Layer (L2) - Depends on SDK packages
- packages/framework -> .ai/targets/FRAMEWORK.md

### React Layer (L3) - Depends on Framework
- packages/react -> .ai/targets/REACT.md

### UI and Dev Packages
- packages/studio -> .ai/targets/STUDIO.md

### Other
- packages/cli -> .ai/targets/CLI.md
- presets/standalone, presets/monorepo -> .ai/targets/CLI.md
- packages/screensets/src/mfe, ChildMfeBridge, ScreensetsRegistry, actions chains, lifecycle stages, gtsPlugin -> .ai/targets/MFE.md
- src/mfe_packages (per-MFE Flux + screens) -> .ai/targets/SCREENSETS.md
- src/mfe_packages (bridge, lifecycle, manifest, GTS) -> .ai/targets/MFE.md
- Precedence when both apply to src/mfe_packages: read .ai/targets/MFE.md first (cross-runtime contract), then .ai/targets/SCREENSETS.md (per-MFE Flux).
- src/screensets -> .ai/targets/SCREENSETS.md (legacy — no screensets exist here after MFE conversion)
- src/themes -> .ai/targets/THEMES.md
- Styling anywhere -> .ai/targets/STYLING.md
- .ai documentation -> .ai/targets/AI.md
- .ai/commands, .claude/commands -> .ai/targets/AI_COMMANDS.md

## REPO INVARIANTS
- In-MFE communication is event-driven (Flux: Action -> Event -> Effect -> Slice). See `.ai/targets/EVENTS.md`.
- Cross-runtime coordination (host <-> MFE, MFE <-> MFE) uses lifecycle stages + actions chains via `ScreensetsRegistry.executeActionsChain()` and `ChildMfeBridge`. See `.ai/targets/MFE.md`. Cross-runtime "events" are FORBIDDEN.
- Registries follow Open/Closed; adding items must not modify registry root files.
- App-level deps limited to: @cyberfabric/react, react, react-dom. Standalone projects must also declare peer deps explicitly: @cyberfabric/framework, @cyberfabric/api, @cyberfabric/i18n, @cyberfabric/screensets, @cyberfabric/state.
- MFE UI autonomy: MFEs own their UI components locally (e.g., components/ui/). No shared UI kit required.
- Cross-domain (intra-MFE) communication only via events; cross-runtime (inter-MFE / host<->MFE) only via actions chains and shared properties.
- Public system contracts must not carry tooling metadata; keep tooling and runtime handoff state internal; do not export internal-only Flux event names used for L2/L3 wiring (narrow subscribe helpers are OK).
- No string literal identifiers; use constants or enums.
- No any, no unknown in type definitions, no "as unknown as" casts.
- REQUIRED: Use lodash for non-trivial object and array operations.

## DESIGN INVARIANTS
- Class-based design: extensible runtime contracts use the abstract base + concrete implementation pattern (see `RuntimeCoordinator`, `ScreensetsRegistry`, `MountManager`, `ExtensionManager`, `LifecycleManager`, `MfeBridgeFactory`, `ActionHandler`). Public consumers depend on the abstract; concrete classes are internal.
- SOLID:
  - SRP: each class owns one runtime concern (mount, lifecycle, mediator, bridge, factory).
  - OCP: registries grow by `register()`, never by editing root files.
  - LSP: handlers and lifecycles substitute their abstract bases without runtime checks.
  - ISP: bridges expose narrow interfaces (`ChildMfeBridge` for MFEs, factories for hosts); never widen for convenience.
  - DIP: registries depend on abstractions (`TypeSystemPlugin`, `RuntimeCoordinator`); concrete classes are wired via factories.
- No public API for testing: do NOT add test-only getters, config injection, or compatibility shims. Cover behavior through public contracts; if tests need a hook, redesign the boundary.
- No capability duplication: actions chains have built-in error handling and fallback branches; do not add config-level `onError` callbacks duplicating that. Justify any new capability that overlaps an existing one in a code comment + ADR.

## IMPORT RULES
- Inside same package: relative paths.
- Cross-branch in app: @/ alias.
- Cross-package: @cyberfabric/framework, @cyberfabric/react. Use local components/ui/ for UI.
- Index files: only when aggregating 3 or more exports.
- Redux slices: import directly (no barrels).

## TYPE RULES
- Use type for objects and unions; interface for React props.
- No hardcoded string IDs.
- Resolve type errors at boundaries using proper generics.
- Class member order: properties -> constructor -> methods.
- Module augmentation for Flux types lives on `@cyberfabric/react`: extend `RootState` from each MFE slice file and `EventPayloadMap` from each domain events file (NOT `@cyberfabric/state`).

## STOP CONDITIONS
- Editing /core/runtime or /sdk.
- Modifying registry root files.
- Adding new top-level dependencies.
- Bypassing rules in `.ai/targets/EVENTS.md` (intra-MFE Flux) or `.ai/targets/MFE.md` (cross-runtime actions chains, lifecycle, bridge).
- Adding test-only getters, config injection, or compatibility shims (see DESIGN INVARIANTS).
- Killing MCP server processes (see `.ai/MCP_TROUBLESHOOTING.md`).

## PRE-DIFF CHECKLIST
- Routed to correct target file.
- Target rules read and summarized internally.
- Registry root files unchanged.
- Import paths follow Import Rules.
- Types and dependents compile.
- npm run arch:check passes.
- Dev server test via Google Chrome MCP Tools:
  - Affected flows and screens exercised.
  - UI uses theme CSS tokens (CSS custom properties from :root).
  - Event-driven behavior (no direct slice dispatch).
  - No console errors or missing registrations.

## BLOCKLIST
- Telemetry or tracking code.
- "as unknown as" type casts.
- unknown in public type definitions.
- eslint-disable comments.
- Barrel exports that hide real imports.
- Manual state sync or prop drilling (see EVENTS.md).
- Native helpers where lodash equivalents exist.
- Test-only public APIs (getters, config knobs, "for testing" exports) and capability duplication (e.g., config-level `onError` over an actions chain that already has fallback branches).

## DOC STYLE
- Short, technical, ASCII only.
- Use "->" arrows for flows.
- Use BAD -> GOOD diffs when needed.
- PR description should reference relevant rules or sections.

## CORRECTION POLICY
- Add or update a rule here (short and focused).
- Update the matching target file.
- Store memory of the correction.
- Re-validate using .ai/targets/AI.md.

## FEATURE CREATION POLICY
- Reuse existing patterns where possible.
- If adding a 3rd or later similar item, consider an index file.
- If new items require central edits, redesign to self-register.
