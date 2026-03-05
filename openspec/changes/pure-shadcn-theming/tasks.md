## 1. Framework Theme Registry

- [x] 1.1 Update `packages/framework/src/types.ts` — change theme registry `register()` signature from `(configOrId: ThemeConfig | string, uikitTheme?: UikitTheme)` to accept `Record<string, string>` CSS variable maps; remove `UikitTheme` type import
- [x] 1.2 Update `packages/framework/src/registries/themeRegistry.ts` — store themes as `Record<string, string>`; implement internal `applyTheme()` that iterates the map and calls `document.documentElement.style.setProperty()` for each entry; clear previous theme vars before applying new set
- [x] 1.3 Update `packages/framework/src/plugins/themes.ts` — adapt theme plugin to work with the new registry API; remove any `@hai3/uikit` imports
- [x] 1.4 Remove `@hai3/uikit` from `packages/framework/package.json` dependencies (if present)

## 2. MountManager Theme Interface

- [x] 2.1 Add `setTheme(cssVars: Record<string, string>): void` to abstract `MountManager` class in `packages/screensets/src/mfe/runtime/mount-manager.ts`
- [x] 2.2 Implement `setTheme()` in `DefaultMountManager` as a no-op (Shadow DOM relies on CSS inheritance from `:root`)
- [x] 2.3 Wire the framework to call `setTheme()` on every active mount manager on initial mount (after container creation, before lifecycle `mount()`) and on theme change

## 3. HAI3_SHARED_PROPERTY_THEME

- [x] 3.1 Update `HAI3_SHARED_PROPERTY_THEME` value type from `Theme` object reference to `string` (theme name) in `packages/react/src`
- [x] 3.2 Update host-side code that sets this property to pass the theme name string instead of a Theme object
- [x] 3.3 Update any MFE-side code in `packages/react` that reads this property expecting a `Theme` object

## 4. Initialization Sequence

- [x] 4.1 Remove `uikitRegistry` initialization step from the application startup sequence; sequence becomes `themeRegistry → screensetsRegistryFactory.build() → domain registration → extension registration → HAI3Provider`
- [x] 4.2 Remove uikit registry imports and references from `packages/framework/src/createHAI3App.ts` and `packages/framework/src/presets/index.ts`

## 5. Blank-MFE Template Update

- [x] 5.1 Create `src/mfe_packages/_blank-mfe/src/components/ui/button.tsx` — copy shadcn button component with `cn()` utility, `class-variance-authority`, and `@radix-ui/react-slot`
- [x] 5.2 Create `src/mfe_packages/_blank-mfe/src/components/ui/card.tsx` — copy shadcn card component
- [x] 5.3 Create `src/mfe_packages/_blank-mfe/src/components/ui/skeleton.tsx` — copy shadcn skeleton component
- [x] 5.4 Create `src/mfe_packages/_blank-mfe/src/lib/utils.ts` — `cn()` utility using `clsx` + `tailwind-merge`
- [x] 5.5 Remove `src/mfe_packages/_blank-mfe/src/shared/ThemeAwareReactLifecycle.tsx` — replace with a simpler lifecycle base class that does not subscribe to theme or call `applyThemeToShadowRoot`
- [x] 5.6 Remove `src/mfe_packages/_blank-mfe/src/shared/themes.ts`
- [x] 5.7 Update `src/mfe_packages/_blank-mfe/src/screens/home/HomeScreen.tsx` — change imports from `@hai3/uikit` to local `../../components/ui/*`
- [x] 5.8 Remove `@hai3/uikit` from `src/mfe_packages/_blank-mfe/package.json`
- [x] 5.9 Remove `@hai3/uikit` from shared deps in `src/mfe_packages/_blank-mfe/vite.config.ts`

## 6. Demo-MFE Migration

- [x] 6.1 Create `src/mfe_packages/demo-mfe/src/components/ui/` — copy all shadcn components currently used by demo-MFE screens from `packages/uikit/src/base/`
- [x] 6.2 Create `src/mfe_packages/demo-mfe/src/lib/utils.ts` — `cn()` utility
- [x] 6.3 Update all screen files in `src/mfe_packages/demo-mfe/src/screens/` — change `@hai3/uikit` imports to local `../../components/ui/*` paths
- [x] 6.4 Remove `src/mfe_packages/demo-mfe/src/shared/ThemeAwareReactLifecycle.tsx` — replace with simplified lifecycle base
- [x] 6.5 Remove `src/mfe_packages/demo-mfe/src/shared/themes.ts`
- [x] 6.6 Update all lifecycle files (`lifecycle-helloworld.tsx`, `lifecycle-profile.tsx`, `lifecycle-theme.tsx`, `lifecycle-uikit.tsx`) — remove theme subscription boilerplate, extend simplified lifecycle
- [x] 6.7 Remove `@hai3/uikit` from `src/mfe_packages/demo-mfe/package.json`
- [x] 6.8 Remove `@hai3/uikit` from shared deps in `src/mfe_packages/demo-mfe/vite.config.ts`

## 7. @hai3/uikit Deprecation

- [x] 7.1 Add `"deprecated": "Use locally owned shadcn components instead. See migration guide."` to `packages/uikit/package.json`
- [x] 7.2 Add deprecation notice to `packages/uikit/README.md`

## 8. Guidelines Update

- [x] 8.1 Update `.ai/GUIDELINES.md` — remove "the configured UI kit" from app-level deps invariant; add MFE UI autonomy guideline
- [x] 8.2 Update `.ai/targets/UIKIT.md` — mark as deprecated; note that MFEs own their UI components locally
- [x] 8.3 Update `.ai/targets/STYLING.md` if it references `@hai3/uikit` base layer conventions — adapt for local component ownership

## 9. Build and Verify

- [x] 9.1 Run `npm run build:packages` — verify all packages build without `@hai3/uikit` in the dependency chain for framework/react/screensets
- [x] 9.2 Build blank-MFE — verify it compiles and renders with local components
- [x] 9.3 Build demo-MFE — verify all screens compile and render with local components
- [x] 9.4 Verify theme switching works end-to-end: host changes theme → CSS vars update on `:root` → MFE components reflect new theme via CSS inheritance
