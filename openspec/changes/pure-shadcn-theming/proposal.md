## Why

`@hai3/uikit` is going to be deprecated, ending the pattern of a centralized framework-mandated UI component library. Adopters need the freedom to use any UI library—or own their components directly—while maintaining visual consistency across all MFEs through a shared, automatically delivered theme.

## What Changes

- **BREAKING** `@hai3/uikit` is deprecated and removed as a required shared MFE federation dependency
- **BREAKING** `UiKitComponent` enum, `UiKitComponentMap`, and the typed `Theme` contract are dropped from the framework
- **BREAKING** `HAI3_SHARED_PROPERTY_THEME` payload changes from carrying a `Theme` object to a plain `string` (theme name only)
- The framework theme registry accepts `Record<string, string>` (CSS custom property name → value) instead of typed `Theme` objects
- The host applies the active theme's CSS custom properties to `document.documentElement` on theme activation
- `MountManager` gains responsibility for re-injecting CSS custom properties into isolation contexts that do not inherit from the document root (e.g., iframes); Shadow DOM MFEs receive theme variables via CSS inheritance at no extra cost
- The blank-MFE template replaces `@hai3/uikit` imports and `ThemeAwareReactLifecycle` with locally owned `components/ui/` shadcn components; `themes.ts` is removed
- Guidelines updated: the "configured UI kit" invariant is removed; MFEs may use any UI library or locally owned components

## Capabilities

### New Capabilities

- `css-var-theming`: Host manages an active shadcn-compatible CSS custom property set applied to `:root`; `MountManager` re-injects into isolation contexts that do not inherit from the document root
- `mfe-ui-autonomy`: MFEs source UI components locally (shadcn copy-owned) or from any npm library; no shared UI kit required as a federation dependency

### Modified Capabilities

- `uikit-base`: `@hai3/uikit` requirements deprecated; package enters maintenance-only mode with no new capabilities
- `microfrontends`: `MountManager` gains theme CSS variable injection responsibility for non-inheriting isolation contexts (iframes and future techniques)

## Impact

- `packages/uikit/` — marked deprecated in `package.json`; no further feature development
- `packages/framework/src/types.ts` — `UiKitTheme`, typed `Theme` references removed from theme registry API
- `packages/screensets/src/mfe/runtime/mount-manager.ts` — abstract theme injection interface added
- `packages/screensets/src/mfe/runtime/default-mount-manager.ts` — theme CSS var injection added (shadow DOM: relies on inheritance; future iframe manager: explicit injection)
- `src/mfe_packages/_blank-mfe/` — `ThemeAwareReactLifecycle` and `themes.ts` removed; local `components/ui/` added with starter shadcn components
- `src/mfe_packages/demo-mfe/` — same template updates applied
- `.ai/GUIDELINES.md` — "configured UI kit" invariant removed; MFE UI autonomy guideline added
- `.ai/targets/UIKIT.md` — marked deprecated
- Breaking for any adopter depending on `@hai3/uikit` as a shared federation dep or the `Theme` / `UiKitComponent` type contracts
