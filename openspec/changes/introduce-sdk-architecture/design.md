# Design: 3-Layer SDK Architecture

## Context

HAI3 needs a modular, SOLID-compliant architecture that:
- Allows users to pick individual SDK pieces
- Provides a cohesive framework for those who want it
- Lets users own their rendering code (CLI-generated)
- Supports future framework adapters (Vue, Solid, Svelte)

**Stakeholders:**
- SDK consumers wanting individual packages
- Framework users wanting HAI3 patterns with custom UI
- React users wanting full HAI3 experience
- Future Vue/Solid/Svelte adapter authors

**Constraints:**
- SDK packages must have ZERO @hai3 inter-dependencies
- Backward compatibility for existing @hai3/uicore users
- TypeScript strict mode with exceptional typing quality
- All protections (ESLint, dependency-cruiser) implemented BEFORE code changes

## Goals / Non-Goals

**Goals:**
- Full SOLID compliance across all packages
- Types-first design with best TypeScript techniques
- TDD approach: protections before implementation
- CLI-generated layout following shadcn/ui model
- Framework-agnostic core enabling future adapters

**Non-Goals:**
- Vue/Solid/Svelte adapters (future work)
- Breaking existing apps (backward compat required)
- Changing the event-driven Flux pattern (it works well)

## SOLID Principles Validation

### S - Single Responsibility Principle

Each package has ONE reason to change:

| Package | Single Responsibility | Changes When |
|---------|----------------------|--------------|
| `@hai3/events` | Event pub/sub mechanism | Event bus API changes |
| `@hai3/store` | Redux state management | Store configuration changes |
| `@hai3/layout` | Layout domain definitions | Domain structure changes |
| `@hai3/api` | HTTP communication | API patterns change |
| `@hai3/i18n` | Internationalization | i18n strategy changes |
| `@hai3/framework` | SDK integration patterns | HAI3 patterns change |
| `@hai3/react` | React bindings | React-specific needs change |

### O - Open/Closed Principle

Packages are open for extension, closed for modification:

| Extension Point | Mechanism |
|-----------------|-----------|
| Custom events | Module augmentation of `EventPayloadMap` |
| Custom slices | `registerSlice()` function |
| Custom API services | `apiRegistry.register()` |
| Custom translations | `i18nRegistry.registerLoader()` |
| Custom screensets | `screensetRegistry.register()` |

### L - Liskov Substitution Principle

Base types can be substituted with derived types:

```typescript
// Base type
interface ApiService {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
}

// Any implementation can substitute
class RestApiService implements ApiService { ... }
class MockApiService implements ApiService { ... }
class GraphQLApiService implements ApiService { ... }
```

### I - Interface Segregation Principle

Users import ONLY what they need:

```typescript
// User wants just events
import { eventBus } from '@hai3/events';  // No Redux, no axios

// User wants just API
import { RestProtocol } from '@hai3/api';  // No events, no Redux

// User wants full framework
import { createHAI3App } from '@hai3/framework';  // Gets everything wired
```

### D - Dependency Inversion Principle

High-level modules don't depend on low-level modules:

```
WRONG (current):
  @hai3/react → @hai3/uikit (concrete implementation)

RIGHT (proposed):
  @hai3/react → NO UI dependency
  CLI generates layout → uses user's UI kit
```

## Types-First Design

### Core Type Definitions

Each SDK package exports its types as the primary API:

```typescript
// @hai3/events - Types first
export interface EventBus<TEvents extends EventPayloadMap = EventPayloadMap> {
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
  on<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void): Unsubscribe;
  once<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void): Unsubscribe;
}

export interface EventPayloadMap {
  // Base events - extended via module augmentation
}

// @hai3/layout - Types first
export interface LayoutDomainState<TConfig = unknown> {
  visible: boolean;
  config: TConfig;
}

export interface ScreenConfig {
  id: string;
  loader: () => Promise<{ default: unknown }>;
}

export interface MenuItemConfig {
  id: string;
  label: string;  // Translation key
  icon?: string;
  screenId?: string;
  children?: MenuItemConfig[];
}

export interface ScreensetDefinition {
  id: string;
  category: ScreensetCategory;
  defaultScreen: string;
  screens: ScreenConfig[];
  menu: MenuItemConfig[];
}
```

### TypeScript Best Practices

| Technique | Usage |
|-----------|-------|
| **Discriminated unions** | Event types, action types |
| **Template literal types** | Event names `${screenset}/${domain}/${action}` |
| **Mapped types** | Registry type inference |
| **Conditional types** | Payload extraction from event names |
| **Module augmentation** | Extending EventPayloadMap, RootState |
| **const assertions** | Event name enums, domain IDs |
| **Branded types** | ScreensetId, ScreenId for type safety |

### Example: Type-Safe Event System

```typescript
// Template literal types for event names
type EventName<
  TScreenset extends string,
  TDomain extends string,
  TAction extends string
> = `${TScreenset}/${TDomain}/${TAction}`;

// Branded types for IDs
type ScreensetId = string & { readonly __brand: 'ScreensetId' };
type ScreenId = string & { readonly __brand: 'ScreenId' };

// Conditional type for payload extraction
type PayloadOf<K extends keyof EventPayloadMap> = EventPayloadMap[K];

// Usage
declare module '@hai3/events' {
  interface EventPayloadMap {
    'chat/threads/selected': { threadId: string };
    'chat/messages/received': { message: Message };
  }
}

// Type-safe emit
eventBus.emit('chat/threads/selected', { threadId: '123' });  // ✅
eventBus.emit('chat/threads/selected', { wrong: 'key' });     // ❌ Type error
```

## Package Dependency Graph

```
                     LAYER 1: SDK (Flat, zero @hai3 deps)

┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│  events   │  │   store   │  │  layout   │  │    api    │  │   i18n    │
│           │  │           │  │           │  │           │  │           │
│ EventBus  │  │ Redux     │  │ Domain    │  │ Rest/SSE  │  │ Registry  │
│ Types     │  │ Slices    │  │ Slices    │  │ Protocols │  │ Loaders   │
└───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘
      │              │              │              │              │
      └──────────────┴──────────────┴──────────────┴──────────────┘
                                    │
                     LAYER 2: Framework
                                    │
                     ┌──────────────▼──────────────┐
                     │        @hai3/framework       │
                     │                              │
                     │  • Wires all SDK packages   │
                     │  • screensetRegistry        │
                     │  • themeRegistry            │
                     │  • routeRegistry            │
                     │  • Effect coordination      │
                     └──────────────┬──────────────┘
                                    │
                     LAYER 3: React Adapter
                                    │
                     ┌──────────────▼──────────────┐
                     │         @hai3/react          │
                     │                              │
                     │  • HAI3Provider             │
                     │  • React hooks              │
                     │  • AppRouter                │
                     │  • NO Layout components     │
                     └─────────────────────────────┘

                     LAYER 4: CLI-Generated (User's Project)

                     ┌─────────────────────────────┐
                     │    src/layout/*.tsx         │
                     │                              │
                     │  • Layout, Header, Menu...  │
                     │  • Uses user's UI kit       │
                     │  • User owns this code      │
                     └─────────────────────────────┘
```

## Layer Rules vs User Code

**IMPORTANT DISTINCTION:**

| Context | Can Import From | Enforced By |
|---------|-----------------|-------------|
| **SDK packages** (events, store, etc.) | NO @hai3 packages | dependency-cruiser |
| **Framework package** | Only SDK packages | dependency-cruiser |
| **React package** | Only framework | dependency-cruiser |
| **User code** (src/, generated layout) | ANY @hai3 package | Not enforced |

User code and CLI-generated layout code CAN import from any @hai3 package. This is intentional:
- Generated `Header.tsx` imports selectors from `@hai3/layout`
- Screensets import `createAction` from `@hai3/events`
- Components import hooks from `@hai3/react`

Layer rules enforce **package-to-package dependencies**, not user code imports.

## Registry Placement

| Registry | Package | Rationale |
|----------|---------|-----------|
| `eventBus` | `@hai3/events` | Core of event system |
| `store` | `@hai3/store` | Core of state management |
| `apiRegistry` | `@hai3/api` | Registers API services |
| `i18nRegistry` | `@hai3/i18n` | Registers translation loaders |
| `screensetRegistry` | `@hai3/framework` | Screensets are HAI3 pattern |
| `themeRegistry` | `@hai3/framework` | Themes are HAI3 pattern |
| `routeRegistry` | `@hai3/framework` | Routing is HAI3 pattern |

## Action Pattern

Actions are pure functions that return void and ONLY emit events. This pattern is fundamental to HAI3's event-driven architecture.

### Action Pattern Definition

The action pattern (types and helpers) belongs in `@hai3/events`:

```typescript
// @hai3/events - Action pattern types and helper

/**
 * An Action is a pure function that emits an event.
 * Actions MUST NOT dispatch directly to store.
 * Actions MUST return void.
 */
export type Action<TPayload> = (payload: TPayload) => void;

/**
 * Creates a type-safe action that emits the specified event.
 */
export function createAction<K extends keyof EventPayloadMap>(
  eventName: K
): Action<EventPayloadMap[K]> {
  return (payload) => eventBus.emit(eventName, payload);
}
```

### Action Placement

| What | Where | Rationale |
|------|-------|-----------|
| **Action type & `createAction` helper** | `@hai3/events` | Actions are event emitters by definition |
| **Core action instances** | `@hai3/framework` | Navigation, layout, theme, language actions |
| **Domain action instances** | User's screenset | Business logic specific to vertical slice |

### Framework Actions

Framework provides core action instances using the pattern from events:

```typescript
// @hai3/framework/actions/navigation.ts
import { createAction } from '@hai3/events';

export const navigateToScreen = createAction('navigation/screen/navigated');
export const navigateToScreenset = createAction('navigation/screenset/navigated');
export const showPopup = createAction('layout/popup/requested');
export const hidePopup = createAction('layout/popup/hidden');
export const changeTheme = createAction('theme/changed');
export const setLanguage = createAction('i18n/language/changed');
```

### User-Defined Actions

Domain-specific actions live in user's screenset code:

```typescript
// src/screensets/chat/actions/threads.ts
import { createAction } from '@hai3/events';

export const selectThread = createAction('chat/threads/selected');
export const markThreadRead = createAction('chat/threads/marked-read');
```

### Event-Driven Flux Flow

```
Action (pure function, returns void)
    → emits Event (via eventBus from @hai3/events)
        → Effect subscribes (in @hai3/framework or user's screenset)
            → Updates Slice (in @hai3/layout or user's slice)
```

### Why This Separation?

1. **Pattern in SDK** - `Action` type and `createAction` are primitives, no @hai3 dependencies
2. **Instances in Framework** - Core actions need event names defined in framework
3. **Instances in User Code** - Domain actions use screenset-specific event names
4. **Type Safety** - `createAction` is fully typed via `EventPayloadMap` augmentation

## Plugin Architecture

### Why Plugins?

A potential user (external company) wants to integrate HAI3 screensets into their existing platform. They already have their own menu, header, and navigation - they only need HAI3's screenset orchestration.

**The Problem**: If `screensetRegistry` requires the full `@hai3/framework` (which depends on ALL SDK packages), users who only need screensets would pull in unnecessary dependencies.

**The Solution**: Plugin architecture allows users to compose only the features they need, following patterns from:
- [TanStack](https://tanstack.com/) - Feature plugins extend the core
- [NestJS](https://docs.nestjs.com/modules) - Module composition with DynamicModule
- [AWS SDK v3](https://aws.amazon.com/blogs/developer/modular-packages-in-aws-sdk-for-javascript/) - Modular clients with middleware/plugins
- [Zustand](https://zustand.docs.pmnd.rs/guides/slices-pattern) - Slices composition

### Architecture Overview

```
@hai3/framework
├── createHAI3()              ← Minimal core with plugin system
├── plugins/
│   ├── screensets()          ← Screenset registry + patterns
│   ├── themes()              ← Theme registry
│   ├── layout()              ← Layout domains (header, menu, footer, etc.)
│   ├── routing()             ← Route registry + URL sync
│   ├── effects()             ← Effect coordination system
│   └── navigation()          ← Navigation actions
├── presets/
│   ├── full()                ← All plugins (default for hai3 create)
│   ├── minimal()             ← screensets + themes only
│   └── headless()            ← screensets only (external integration)
```

### Plugin Interface

```typescript
/**
 * HAI3Plugin interface - all plugins implement this contract.
 * Follows Liskov Substitution Principle - any plugin can be used interchangeably.
 */
interface HAI3Plugin<TConfig = unknown> {
  /** Unique plugin identifier */
  name: string;

  /** Other plugins this plugin requires */
  dependencies?: string[];

  /** Lifecycle: Called when plugin is registered */
  onRegister?(app: HAI3AppBuilder, config: TConfig): void;

  /** Lifecycle: Called after all plugins registered, before app starts */
  onInit?(app: HAI3App): void | Promise<void>;

  /** Lifecycle: Called when app is destroyed */
  onDestroy?(app: HAI3App): void;

  /** What this plugin provides to the app */
  provides?: {
    registries?: Record<string, unknown>;
    slices?: SliceObject[];
    effects?: EffectInitializer[];
    actions?: Record<string, Action>;
  };
}
```

### Plugin Examples

```typescript
// screensets plugin - minimal, just screenset orchestration
export const screensets = (config?: ScreensetsConfig): HAI3Plugin => ({
  name: 'screensets',
  dependencies: [],  // No other plugins required

  provides: {
    registries: { screensetRegistry: createScreensetRegistry() },
    slices: [screenSlice],
    // NOTE: Navigation actions are in navigation() plugin, not here
    // This allows headless users to provide their own navigation
  },

  onInit(app) {
    // Auto-discover screensets if configured
    if (config?.autoDiscover) {
      discoverScreensets(app.screensetRegistry);
    }
  },
});

// layout plugin - provides all layout domains
export const layout = (): HAI3Plugin => ({
  name: 'layout',
  dependencies: ['screensets'],  // Needs screensets for screen domain

  provides: {
    slices: [headerSlice, footerSlice, menuSlice, sidebarSlice, popupSlice, overlaySlice],
    effects: [initLayoutEffects],
    actions: { showPopup, hidePopup, showOverlay, hideOverlay },
  },
});

// themes plugin - theme management
export const themes = (): HAI3Plugin => ({
  name: 'themes',
  dependencies: [],

  provides: {
    registries: { themeRegistry: createThemeRegistry() },
    actions: { changeTheme },
  },
});

// navigation plugin - navigation actions for HAI3 patterns
export const navigation = (): HAI3Plugin => ({
  name: 'navigation',
  dependencies: ['screensets'],  // Needs screensetRegistry

  provides: {
    actions: { navigateToScreen, navigateToScreenset },
    effects: [initNavigationEffects],  // URL sync, history, etc.
  },
});

// effects plugin - core effect coordination infrastructure
export const effects = (): HAI3Plugin => ({
  name: 'effects',
  dependencies: [],

  provides: {
    // Provides the effect system itself, not specific effects
    // Individual plugins register their own effects
  },

  onRegister(app) {
    // Initialize the effect coordination system
    // This allows plugins to register effects that respond to events
    initEffectSystem(app);
  },
});
```

### Usage Patterns

#### 1. Full HAI3 Experience (Default)

```typescript
import { createHAI3App } from '@hai3/framework';

// Uses full() preset automatically - all plugins included
const app = createHAI3App();
```

#### 2. Using Presets

```typescript
import { createHAI3, presets } from '@hai3/framework';

// Headless preset - screensets only, for external platform integration
const app = createHAI3()
  .use(presets.headless())
  .build();

// Minimal preset - screensets + themes, no layout domains
const app = createHAI3()
  .use(presets.minimal())
  .build();
```

#### 3. Custom Composition

```typescript
import { createHAI3, screensets, themes, i18n } from '@hai3/framework';

const app = createHAI3()
  .use(screensets())
  .use(themes())
  .use(i18n())
  // NO layout() - they have their own menu/header
  .build();
```

#### 4. External Platform Integration

```typescript
// Company with their own platform - only needs screenset orchestration
import { createHAI3, screensets } from '@hai3/framework';
import { Provider } from 'react-redux';

// Minimal HAI3 setup
const hai3 = createHAI3()
  .use(screensets())
  .build();

// Their own menu component using HAI3 screensets
const TheirMenu: React.FC = () => {
  const allScreensets = hai3.screensetRegistry.getAll();

  return (
    <nav className="their-existing-menu">
      {allScreensets.map(ss => (
        <button key={ss.id} onClick={() => theirNavigate(ss.id)}>
          {ss.name}
        </button>
      ))}
    </nav>
  );
};

// Their screen renderer - injects HAI3 screens into their layout
const TheirScreenRenderer: React.FC<{ screensetId: string; screenId: string }> = ({
  screensetId,
  screenId
}) => {
  const screenset = hai3.screensetRegistry.get(screensetId);
  const screen = screenset.screens.find(s => s.id === screenId);
  const ScreenComponent = React.lazy(screen.loader);

  return (
    <Provider store={hai3.store}>
      <Suspense fallback={<TheirLoadingSpinner />}>
        <ScreenComponent />
      </Suspense>
    </Provider>
  );
};
```

### Presets Definition

```typescript
// presets/full.ts - All features (default)
export const full = (): HAI3Plugin[] => [
  screensets({ autoDiscover: true }),
  themes(),
  layout(),
  routing(),
  effects(),
  navigation(),
  i18n(),
];

// presets/minimal.ts - Screensets + themes, no layout
export const minimal = (): HAI3Plugin[] => [
  screensets({ autoDiscover: true }),
  themes(),
];

// presets/headless.ts - Screensets only, for external integration
export const headless = (): HAI3Plugin[] => [
  screensets({ autoDiscover: false }),  // Manual registration
];
```

### SOLID Compliance

| Principle | How Plugin Architecture Satisfies It |
|-----------|-------------------------------------|
| **S - Single Responsibility** | Each plugin has one job (screensets, themes, layout) |
| **O - Open/Closed** | Add features via new plugins, don't modify existing |
| **L - Liskov Substitution** | All plugins implement `HAI3Plugin` interface |
| **I - Interface Segregation** | Users import only plugins they need |
| **D - Dependency Inversion** | Core depends on `HAI3Plugin` interface, not implementations |

### Dependency Resolution

The plugin system resolves dependencies with clear, predictable behavior:

**Rule: Dependencies are ALWAYS auto-added when unambiguous.**

```typescript
const app = createHAI3()
  .use(layout())      // Declares dependency on 'screensets'
  .use(themes())      // No dependencies
  // screensets() is auto-added with DEFAULT config because layout() depends on it
  .build();
```

**Rule: Error is thrown when auto-resolution is ambiguous (requires config).**

```typescript
// This WORKS - screensets() with default config can be auto-added
const app = createHAI3()
  .use(navigation())  // Depends on 'screensets'
  .build();           // screensets() auto-added with default config

// This FAILS - if the user already has screensets with custom config
const app = createHAI3()
  .use(screensets({ autoDiscover: false }))  // Custom config
  .use(layout())
  // navigation() is NOT auto-added because screensets config is ambiguous
  .build();
// Warning: navigation() requires 'screensets' but it's already configured.
// Explicitly add navigation() if needed.
```

**Dependency Resolution Algorithm:**
1. Collect all plugins' declared dependencies
2. For each missing dependency:
   - If no existing plugin with that name → auto-add with default config
   - If plugin already exists with custom config → warn, don't duplicate
3. Throw error only if a required plugin cannot be instantiated

### Tree-Shaking Benefits

```typescript
// Only screensets - minimal bundle
import { createHAI3, screensets } from '@hai3/framework';
// Bundle: ~15KB (events + store + screensets)

// Full experience
import { createHAI3App } from '@hai3/framework';
// Bundle: ~45KB (all SDK packages + all plugins)
```

## CLI Scaffold Commands

### @hai3/uikit as Default UI Kit

`@hai3/uikit` is a **standalone npm package** (NOT part of SDK/framework layers). It's the default UI kit option at the CLI level:

```
┌─────────────────────────────────────────────────────────────┐
│                    @hai3/uikit (npm package)                │
│                                                             │
│  • Standalone React component library                       │
│  • Based on shadcn/ui + Radix UI + Tailwind                │
│  • NOT a dependency of SDK, framework, or react packages   │
│  • Default option when scaffolding layout                   │
│  • User can swap for any other UI kit                       │
└─────────────────────────────────────────────────────────────┘
```

| UI Kit | Status | Description |
|--------|--------|-------------|
| `@hai3/uikit` | **Default** | HAI3's component library, installed as npm dependency |
| `custom` | **Available** | No bundled UI kit, user provides own components |
| `shadcn` | **Future** | Generate with shadcn/ui imports |
| `mui` | **Future** | Generate with Material UI imports |

### Layout Scaffolding

```bash
# Generate layout with @hai3/uikit (default)
hai3 scaffold layout

# Future: support for other UI kits
# hai3 scaffold layout --ui-kit=shadcn
# hai3 scaffold layout --ui-kit=mui
# hai3 scaffold layout --ui-kit=custom
```

**What happens:**
1. CLI generates layout components in `src/layout/`
2. Generated code imports from `@hai3/uikit`
3. CLI adds `@hai3/uikit` to `package.json` dependencies (if not present)
4. User owns the generated code and can modify freely

**Generated files:**
```
src/layout/
├── Layout.tsx           # Main layout orchestrator
├── Header.tsx           # Header domain (imports from @hai3/uikit)
├── Footer.tsx           # Footer domain
├── Menu.tsx             # Menu domain
├── Sidebar.tsx          # Sidebar domain
├── Screen.tsx           # Screen domain (lazy loading)
├── Popup.tsx            # Popup domain
├── Overlay.tsx          # Overlay domain
└── index.ts             # Barrel export
```

### Generated Code Example

```typescript
// Generated Header.tsx (default with @hai3/uikit)
import { Button, Avatar } from '@hai3/uikit';
import { useAppSelector } from '@hai3/react';
import { selectHeaderState } from '@hai3/layout';

export const Header: React.FC = () => {
  const headerState = useAppSelector(selectHeaderState);

  return (
    <header className="flex items-center justify-between p-4">
      <Avatar src={headerState.user?.avatar} />
      <Button variant="ghost">Settings</Button>
    </header>
  );
};
```

### Why Keep @hai3/uikit as Package? (Not CLI Template Like shadcn/ui)

Unlike shadcn/ui's approach where components are copied into user's codebase, @hai3/uikit remains a **standalone npm package** for strategic reasons:

| Reason | Explanation |
|--------|-------------|
| **AI Agent Boundary** | Prevents AI agents from modifying UI kit components during screenset implementation. AI works on business logic (screensets), UX designers maintain the UI kit. |
| **UX Designer Ownership** | The UI kit is maintained by the UX design team, not developers or AI. Clear separation of concerns. |
| **Consistent Updates** | Bug fixes and improvements delivered via npm updates. All projects benefit without regeneration. |
| **Flexibility for Companies** | Organizations can: use as-is, fork and customize, use shadcn/MUI instead, or build custom. |
| **Not Coupled to SDK** | @hai3/uikit has NO dependencies on SDK, framework, or react packages. It's just a CLI default. |

**The door is open**: Companies who want shadcn/ui approach can use `--ui-kit=shadcn` (future) or build their own custom UI kit.

## AI Infrastructure Architecture

HAI3 separates AI tooling into two distinct domains, following [Nx's generator/executor pattern](https://nx.dev/docs/concepts/decisions/why-monorepos) and [Turborepo's internal vs published packages](https://turborepo.com/docs/core-concepts/internal-packages):

### Two Command Namespaces

| Namespace | Audience | Purpose |
|-----------|----------|---------|
| `hai3dev-*` | HAI3 framework developers | Internal monorepo development |
| `hai3-*` | HAI3-based project developers | User project development |

### HAI3 Monorepo Commands (Internal)

These commands are for HAI3 framework development only. They are **NEVER** shipped to user projects.

```
.claude/commands/           # HAI3 MONOREPO ONLY
├── hai3dev-publish.md      # Publish packages to npm
├── hai3dev-release.md      # Create release with changelog
├── hai3dev-update-guidelines.md  # Update AI source of truth
└── hai3dev-test-packages.md      # Test package changes
```

| Command | Purpose |
|---------|---------|
| `/hai3dev-publish` | Build and publish @hai3/* packages to npm |
| `/hai3dev-release` | Create version, changelog, and git tags |
| `/hai3dev-update-guidelines` | Update `.ai/rules/` source of truth |
| `/hai3dev-test-packages` | Run package integration tests |

### User Project Commands (Technical + Business Aliases)

**Screenset is a fundamental HAI3 concept** - keep technical commands, add business aliases for non-technical users.

Commands:
1. **Technical commands** use HAI3 terminology (screenset, screen, validate)
2. **Business aliases** provide simpler language (feature, page, check)
3. Call **HAI3 CLI** under the hood (ensures consistency)
4. Are **protected by validations** (ESLint, dependency-cruiser)
5. Are **configuration-aware** (only show relevant commands)

```
.claude/commands/           # USER PROJECT (generated by hai3 create)
├── hai3-new-screenset.md   # Technical: create screenset (fundamental HAI3 concept)
├── hai3-new-screen.md      # Technical: add screen to screenset
├── hai3-new-api-service.md # Technical: create API service
├── hai3-new-action.md      # Technical: create action
├── hai3-validate.md        # Technical: validate project
├── hai3-fix-violation.md   # Technical: fix violations
├── hai3-add-feature.md     # Alias: same as hai3-new-screenset (business term)
├── hai3-add-page.md        # Alias: same as hai3-new-screen (business term)
├── hai3-check.md           # Alias: same as hai3-validate (business term)
└── hai3-fix.md             # Alias: same as hai3-fix-violation (business term)
```

### Command Mapping (Technical + Business Aliases)

| Technical Command | Business Alias | CLI Command |
|-------------------|----------------|-------------|
| `/hai3-new-screenset` | `/hai3-add-feature` | `hai3 screenset create <name>` |
| `/hai3-new-screen` | `/hai3-add-page` | `hai3 screen add <name>` |
| `/hai3-new-api-service` | `/hai3-add-service` | `hai3 api-service create <name>` |
| `/hai3-new-action` | `/hai3-add-action` | `hai3 action create <name>` |
| `/hai3-validate` | `/hai3-check` | `hai3 validate` |
| `/hai3-fix-violation` | `/hai3-fix` | `hai3 fix` |

### CLI as Single Source of Truth

**All AI commands delegate to CLI.** This ensures:
- Consistent behavior across AI tools
- Built-in validation (protections)
- Single place to update logic

```markdown
# /hai3-add-feature

> Add a new feature module to your project.

## AI WORKFLOW (REQUIRED)
1. Ask: "What should this feature be called?" (e.g., billing, notifications)
2. Ask: "What category?" (drafts, mockups, production)
3. Run: `hai3 add feature <name> --category=<category>`
4. CLI handles scaffolding + validation automatically
5. Open created files for customization

## PROTECTIONS (CLI enforces these)
- ESLint validates naming conventions
- dependency-cruiser checks import rules
- arch:check validates structure
- If ANY validation fails, CLI shows error and suggests fix
```

### CLI Protection Flow

Every CLI command follows this flow:

```
User runs command (via AI or directly)
    │
    ▼
CLI executes scaffolding/generation
    │
    ▼
CLI automatically runs validations:
├── npm run lint (ESLint)
├── npm run type-check (TypeScript)
└── npm run arch:check (Architecture)
    │
    ├─── If PASS → Show success + next steps
    │
    └─── If FAIL → Show error + suggest `/hai3-fix`
```

### Configuration-Aware Command Generation

When `hai3 create my-app` runs, it generates commands based on project configuration:

```json
// package.json dependencies determine available commands
{
  "dependencies": {
    "@hai3/framework": "^1.0.0",  // Enables framework commands
    "@hai3/react": "^1.0.0"       // Enables react commands
  }
}
```

**Command availability by layer:**

| Layer | Installed Packages | Available Commands |
|-------|-------------------|-------------------|
| SDK | `@hai3/api` only | `/hai3-add-service` |
| Framework | `@hai3/framework` | SDK + `/hai3-add-feature`, `/hai3-add-action`, `/hai3-check`, `/hai3-fix` |
| React | `@hai3/react` | Framework + `/hai3-add-page`, `/hai3-add-component` |

### Multi-Tool Support

HAI3 supports 4 AI coding tools with **single source of truth**:

| Tool | Generated File | Commands Location |
|------|---------------|-------------------|
| Claude Code | `CLAUDE.md` | `.claude/commands/` |
| GitHub Copilot | `.github/copilot-instructions.md` | N/A (instructions only) |
| Cursor | `.cursor/rules/hai3.md` | N/A (rules only) |
| Windsurf | `.windsurf/rules/hai3.md` | N/A (rules only) |

**Note:** Only Claude Code supports custom commands. Other tools get rules/instructions only.

### Source of Truth Structure

```
HAI3 Monorepo:
.ai/
├── rules/                    # Source of truth for rules
│   ├── core.md              # Core patterns (all projects)
│   ├── events.md            # @hai3/events patterns
│   ├── store.md             # @hai3/store patterns
│   ├── layout.md            # @hai3/layout patterns
│   ├── framework.md         # @hai3/framework patterns
│   ├── react.md             # @hai3/react patterns
│   └── screensets.md        # Screenset patterns
│
├── commands/
│   ├── internal/            # hai3dev-* (monorepo only)
│   │   ├── hai3dev-publish.md
│   │   └── hai3dev-release.md
│   └── user/                # hai3-* (shipped to user projects)
│       ├── hai3-add-feature.md
│       ├── hai3-add-page.md
│       └── hai3-check.md
│
└── templates/               # Templates for generated files
    ├── CLAUDE.md.hbs
    ├── copilot-instructions.md.hbs
    └── cursor-rules.md.hbs

User Project (after hai3 create):
CLAUDE.md                    # Generated, includes project context
.github/copilot-instructions.md
.cursor/rules/hai3.md
.windsurf/rules/hai3.md
.claude/commands/            # Generated based on installed packages
    ├── hai3-new-screenset.md   # Technical command
    ├── hai3-new-screen.md      # Technical command
    ├── hai3-validate.md        # Technical command
    ├── hai3-add-feature.md     # Business alias
    └── hai3-check.md           # Business alias
```

### CLI Commands

```bash
# Technical commands (screenset is fundamental HAI3 concept)
hai3 screenset create <name>  # Create screenset (primary)
hai3 screen add <name>        # Add screen to screenset
hai3 api-service create <name> # Create API service
hai3 action create <name>     # Create action
hai3 validate                 # Run all validations
hai3 fix                      # Auto-fix violations

# Business-friendly aliases (for non-technical users)
hai3 add feature <name>       # Alias for: hai3 screenset create
hai3 add page <name>          # Alias for: hai3 screen add
hai3 add service <name>       # Alias for: hai3 api-service create
hai3 add action <name>        # Alias for: hai3 action create
hai3 check                    # Alias for: hai3 validate

# AI sync command
hai3 ai sync                  # Regenerate AI files from package config
hai3 update                   # Update packages + regenerate AI files
```

### Command Format (User-Friendly)

Commands are written for non-technical users:

```markdown
# /hai3-add-feature

> Add a new feature module to your project.

## What This Does
Creates a complete feature with its own pages, data, and styling.
Think of it like adding a new section to your app (e.g., "Billing", "Settings").

## AI WORKFLOW (REQUIRED)
1. Ask: "What should this feature be called?"
   - Examples: billing, notifications, user-settings
   - Use lowercase with hyphens for multi-word names

2. Ask: "Is this a draft, mockup, or production feature?"
   - Draft: For experimenting with ideas
   - Mockup: For showing to stakeholders
   - Production: For real users

3. Run the CLI command:
   ```bash
   hai3 add feature <name> --category=<category>
   ```

4. The CLI will:
   - Create all necessary files
   - Check for any problems
   - Show you what was created

5. Open the main file for customization

## If Something Goes Wrong
The CLI checks for problems automatically.
If it finds issues, run `/hai3-fix` to resolve them.
```

### Automated Validation (Promptfoo)

Commands are tested using [Promptfoo](https://www.promptfoo.dev/):

```
.ai/tests/
├── promptfoo.yaml           # Main config
├── commands/
│   ├── add-feature.test.yaml
│   ├── add-page.test.yaml
│   └── check.test.yaml
└── assertions/
    └── cli-patterns.yaml    # Reusable assertions
```

**Key test cases:**
1. Command correctly calls CLI with proper arguments
2. Business-friendly language is used (not technical jargon)
3. Error handling suggests `/hai3-fix`
4. Command stays under 500 words (user-friendly = concise)

### llms.txt for Discoverability

Each package also generates `llms.txt` following the [llms.txt standard](https://llmstxt.org/):

```markdown
# @hai3/events

> Type-safe event bus and action pattern for HAI3 SDK.

## Documentation

- [API Reference](https://hai3.dev/docs/events/api): EventBus, createAction
- [Action Pattern](https://hai3.dev/docs/events/actions): Pure event emitters

## Optional

- [Migration Guide](https://hai3.dev/docs/events/migration)
```

## Migration Strategy

### Phase 1: Protections (TDD)
1. Update ESLint rules for new package boundaries
2. Update dependency-cruiser for flat SDK enforcement
3. Add architecture tests for SOLID compliance
4. Update AI guidelines in `.ai/` folder

### Phase 2: Types & Interfaces
1. Define all package interfaces
2. Ensure full type coverage
3. Set up module augmentation patterns

### Phase 3: SDK Packages
1. Create @hai3/events (smallest, no deps)
2. Create @hai3/store (uses events types, not runtime)
3. Create @hai3/layout (domain types and slices)
4. Create @hai3/api (standalone)
5. Create @hai3/i18n (standalone)

### Phase 4: Framework & React
1. Create @hai3/framework (wires SDK)
2. Create @hai3/react (React bindings, no layout)

### Phase 5: CLI Templates
1. Add `hai3 scaffold layout` command
2. Create templates for @hai3/uikit (default) and custom (no uikit)
3. Update existing `hai3 create` to use new architecture

### Phase 6: Deprecation & Migration (CRITICAL)

**6.0 State Structure Migration**
- Current: `state.uicore.header`, `state.uicore.menu`, etc. (nested under `uicore` key)
- New: Flat structure managed by `@hai3/layout`
- Requires: Legacy selectors, migration helpers, deprecation warnings

**6.1 Layout Components Migration**
- Current: `<Layout>`, `<Header>`, `<Menu>`, etc. in `@hai3/uicore`
- New: CLI-generated in user's `src/layout/`
- Backward compat: Re-export wrapper that uses CLI-generated components

**6.2 uikit-contracts Migration (30+ files)**
- Types used across uicore, uikit, studio, CLI templates
- Move types to appropriate new packages
- Re-export from deprecated contracts package

**6.3 Actions Refactoring**
- Current: Actions call registries (not pure)
- New: Actions only emit events, effects handle validation
- Example: `navigateToScreen` currently calls `routeRegistry.hasScreen()`

**6.4 @hai3/uicore Deprecation**
1. Update to re-export from framework + react
2. Maintain all existing exports for backward compat
3. Add deprecation warnings in development

## Risks / Trade-offs

### Risk 1: Many Packages to Maintain
- **Risk:** 7 new packages vs 3 current
- **Mitigation:** Clear boundaries, automated testing, monorepo tooling

### Risk 2: CLI Template Updates
- **Risk:** Users don't get updates automatically
- **Mitigation:** `hai3 update layout` command, clear versioning

### Risk 3: Module Augmentation Complexity
- **Risk:** Types across packages can be confusing
- **Mitigation:** Excellent documentation, examples in each package

### Risk 4: Breaking Existing Apps
- **Risk:** Current apps stop working
- **Mitigation:** @hai3/uicore re-exports maintain 100% backward compat

### Risk 5: State Structure Migration
- **Risk:** Selectors using `state.uicore.X` break
- **Mitigation:** Legacy selector helpers, gradual migration guide

### Risk 6: uikit-contracts Migration Scope
- **Risk:** 30+ files across 4 packages need updates
- **Mitigation:** Deprecation re-exports, gradual migration, clear ownership per type

## Critical Assessment

### What This Approach Gets Right

| Aspect | Industry Alignment | Evidence |
|--------|-------------------|----------|
| **Flat SDK packages** | TanStack, shadcn/ui | Zero inter-dependencies enables tree-shaking, independent versioning |
| **CLI-generated layout** | shadcn/ui, Tailwind | User owns code, no runtime abstraction layer overhead |
| **Single source of truth for AI** | Anthropic recommendations | Avoids drift between tool-specific files |
| **Promptfoo for validation** | Industry standard | Used by OpenAI, Anthropic partners for eval |
| **Module augmentation** | TypeScript best practice | Used by Redux Toolkit, React Query |
| **Event-driven architecture** | Redux, RxJS patterns | Proven for loose coupling |

### Potential Concerns

| Concern | Mitigation | Risk Level |
|---------|-----------|------------|
| **7 packages to maintain** | Monorepo tooling, strict boundaries, automated testing | Medium |
| **Users won't update CLI templates** | `hai3 update layout` command, clear versioning in comments | Low |
| **Promptfoo adds CI cost** | Use caching, run on .ai/ changes only, use smaller models for tests | Low |
| **AI guidelines may drift per tool** | Single source + sync command enforces consistency | Low |
| **Breaking changes harder across packages** | Semantic versioning, deprecation warnings, re-export shims | Medium |

### Comparison with Alternatives

| Alternative | Pros | Cons | Why Not Chosen |
|------------|------|------|----------------|
| **Keep monolithic uicore** | Simpler, less packages | SOLID violations, poor tree-shaking | Doesn't scale |
| **Use Turborepo/Nx** | Better build caching | Added complexity, learning curve | Current npm workspaces sufficient |
| **Abstract UI kit interface** | Swap UI kits easily | Runtime overhead, type complexity | CLI templates simpler |
| **Split to micro-packages** | Maximum granularity | Too many packages to manage | 7 is the right balance |

### Industry Research Summary

Based on analysis of TanStack, shadcn/ui, Stripe SDK, Radix UI:

1. **Package granularity**: 5-7 packages is optimal. TanStack has ~6 core packages, shadcn/ui generates per-component.

2. **AI guidelines format**: No industry standard yet. CLAUDE.md is emerging for Claude, llms.txt for general LLMs. Our single-source approach is forward-thinking.

3. **Prompt testing**: Promptfoo is the most mature option. Alternatives (LangSmith, Braintrust) are more opinionated/expensive.

4. **Template over runtime**: shadcn/ui proved users prefer owning code over abstraction layers. 5x adoption vs traditional component libraries.

### Recommended Improvements

1. **Add `@hai3/types` package** - Shared primitives (ScreensetId, ScreenId) prevent duplication
2. **Template versioning header** - Generated files should include version for `hai3 update layout` to work
3. **Prompt regression baseline** - Store golden outputs for comparison, not just pass/fail
4. **Consider Biome over ESLint** - Faster, but less mature plugin ecosystem

## Open Questions

1. **Should SDK packages have a shared types package?** Currently each defines own types. Could have `@hai3/types` for shared primitives.

2. **How to version CLI templates?** When user runs `hai3 scaffold layout`, should it check for updates?

3. **Should @hai3/framework be split per concern?** Could have `@hai3/screensets`, `@hai3/themes`, `@hai3/routing` instead.

4. **Should we use smaller models (Haiku) for prompt tests?** Reduces cost but may miss nuanced issues.

5. **Should prompt tests run on every PR or just .ai/ changes?** Trade-off between safety and CI cost.
