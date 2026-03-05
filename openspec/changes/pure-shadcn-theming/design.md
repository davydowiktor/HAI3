## Context

`@hai3/uikit` currently serves two roles: a shared MFE federation dependency providing React components, and a theming layer providing the typed `Theme` contract plus `applyTheme` / `applyThemeToShadowRoot` utilities. These roles are entangled, making it impossible to drop the UI component layer without also losing the theme delivery mechanism.

Today's theme flow: host registers typed `Theme` objects → broadcasts a `Theme` reference via `HAI3_SHARED_PROPERTY_THEME` → each MFE receives the object, looks it up in its own local `themes.ts` copy, and calls `applyThemeToShadowRoot()` to inject CSS variables. This means theme data is duplicated in every MFE, and every MFE requires `@hai3/uikit` just to inject CSS variables.

CSS custom properties are inherited properties per spec: they cross Shadow DOM boundaries naturally. This makes the manual shadow root injection redundant for the current isolation technique. Future techniques (iframes) do not inherit from the document root, but the `MountManager` abstraction already exists to handle per-context concerns.

## Goals / Non-Goals

**Goals:**
- MFEs may use any UI library or locally owned components — no shared UI kit required
- Theme CSS variables are delivered to all MFE isolation contexts automatically, with no per-MFE boilerplate
- Shadcn-using MFEs work out of the box with the host's theme, no configuration needed
- `MountManager` implementations handle theme delivery transparently per isolation context
- `@hai3/uikit` is deprecated cleanly without immediately breaking existing adopters

**Non-Goals:**
- Providing a new official UI library to replace `@hai3/uikit`
- Migrating existing `demo-mfe` UI components away from shadcn (components themselves stay; wiring changes)
- Supporting UI libraries that do not use CSS custom properties for theming (out of scope for this change)
- Removing `@hai3/uikit` from the monorepo in this change (deprecated, not deleted)

## Decisions

### Decision 1: Theme representation — `Record<string, string>` over typed `Theme`

The framework theme registry changes from accepting `UikitTheme` / typed `Theme` objects to accepting `Record<string, string>`, where each key is a CSS custom property name (e.g., `'--primary'`) and each value is its raw CSS value (e.g., `'221 83% 53%'`).

**Why:** A `Record<string, string>` is library-agnostic. The framework has no knowledge of shadcn variable names, HSL formats, or color semantics. The host app decides what variables to set. The `Theme` type was a HAI3-specific contract that coupled the framework to one UI library's conventions.

**Alternative considered:** Keep typed `Theme`, add a `toCssVars(theme: Theme)` conversion step. Rejected: the type itself still couples the framework to shadcn conventions and provides no benefit once all consumers use raw CSS vars.

---

### Decision 2: Shadcn variable set as the documented baseline

The framework does not enforce specific variable names, but the blank-MFE template and documentation treat the shadcn variable set (`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--border`, `--ring`, `--destructive`, `--accent`, chart vars, radius vars) as the baseline contract.

**Why:** Adopters starting from the blank-MFE template get a known starting point. MFEs using shadcn components simply work. Other libraries can map from this set or add their own variables.

**Alternative considered:** Define a HAI3-specific token set (e.g., `--hai3-brand`, `--hai3-surface`). Rejected: introduces yet another mapping layer with no ecosystem benefit; shadcn is already the de-facto starting point.

---

### Decision 3: CSS delivery — document root + MountManager re-injection

The host applies the active theme's CSS variables to `document.documentElement` on activation and on theme change. Shadow DOM MFEs receive these via CSS inheritance — no explicit injection needed. For isolation contexts that do not inherit (iframes, future techniques), the `MountManager` re-injects the same variable set into the context's own root.

**Why:** CSS inheritance is free and automatic for Shadow DOM. The `MountManager` already abstracts per-context mounting concerns; theme CSS delivery is one more per-context concern. This keeps MFE code completely theme-unaware.

**Alternative considered:** Always inject explicitly into every shadow root (don't rely on inheritance). Rejected: unnecessary complexity for the current case; inheritance is reliable for CSS custom properties per spec.

**Alternative considered:** MFEs subscribe to theme changes and inject themselves. Rejected: re-introduces per-MFE boilerplate and `themes.ts` duplication.

---

### Decision 4: `HAI3_SHARED_PROPERTY_THEME` becomes a `string` signal

The property value type changes from a `Theme` object reference to a plain `string` (theme name). MFEs that need to react to theme changes (e.g., re-render charts, toggle a `.dark` class inside their shadow root) subscribe to this property. Most MFEs ignore it entirely.

**Why:** CSS vars handle visual delivery. The theme name is useful metadata for conditional logic without requiring MFEs to carry theme data. Removing the property entirely would break MFEs with legitimate theme-reactive behavior.

**Alternative considered:** Remove `HAI3_SHARED_PROPERTY_THEME` entirely. Rejected: charting MFEs, canvas-based renderers, and similar need a programmatic signal to re-draw on theme change.

---

### Decision 5: `MountManager` owns theme injection via lifecycle hook

`MountManager` gains a `setTheme(cssVars: Record<string, string>): void` method that the framework calls on initial mount and on every theme change. `DefaultMountManager` (Shadow DOM) relies on CSS inheritance — `setTheme` is effectively a no-op or is omitted from the Shadow DOM implementation. Future `IframeMountManager` injects a `<style>` block into the iframe document's `<head>`.

**Why:** The mount manager knows its isolation context. Centralizing this avoids spreading context-specific logic into the bridge or the MFE lifecycle.

**Alternative considered:** Add a theme channel to `ChildMfeBridge`. Rejected: the bridge is an MFE-facing API; theme delivery is infrastructure, not something MFEs should wire up.

---

### Decision 6: `applyTheme` (document-level) moves into the framework theme plugin

The function that iterates a `Record<string, string>` and calls `document.documentElement.style.setProperty` becomes an internal implementation detail of the framework's theme registry / plugin. It is not exported publicly.

**Why:** Applying theme to the document root is a host concern. It was only in `@hai3/uikit` because that's where the `Theme` type lived. Moving it inward removes the last reason for the host app to import from `@hai3/uikit`.

---

### Decision 7: Initialization sequence — `uikitRegistry` step removed

The current initialization sequence starts with `uikitRegistry → themeRegistry → ...`. With `@hai3/uikit` deprecated and no longer a shared dependency, the `uikitRegistry` initialization step is removed. Sequence becomes `themeRegistry → screensetsRegistryFactory.build() → ...`.

---

### Decision 8: Blank-MFE template ships starter `components/ui/`

The template includes a `components/ui/` directory with a representative set of shadcn components (button, card, skeleton, input, label). These are copy-owned files, not a dependency. `ThemeAwareReactLifecycle` and `themes.ts` are removed from the template entirely.

**Why:** Demonstrates the correct pattern; gives adopters a working starting point without requiring any UI kit dependency.

**Open:** Tailwind CSS in shadow DOM — the template currently injects a manual list of Tailwind utility strings. A proper solution (Vite CSS injection or a postcss step emitting into the shadow root) is a separate concern and not addressed in this change. The manual approach is retained in the template for now.

## Risks / Trade-offs

**CSS inheritance could be overridden inside a shadow root** → If a component applies `all: initial` or sets conflicting custom properties on its host element, inherited vars could be shadowed. Mitigation: document the constraint; future `DefaultMountManager` can defensively inject vars at the shadow root level if inheritance proves unreliable in practice.

**Breaking change scope is broad** → Any adopter using `UiKitComponent`, `Theme`, `ButtonVariant`, `ButtonSize`, or reading `HAI3_SHARED_PROPERTY_THEME` as a `Theme` reference must migrate. Mitigation: `@hai3/uikit` is deprecated but not removed; types remain available during the deprecation window; migration guide documents each breaking surface.

**Adopters using non-shadcn libraries must map variables themselves** → A Mantine or Chakra MFE gets `--primary` etc. but must wire these into its own `ThemeProvider`. Mitigation: this is by design (UI autonomy); the docs show a mapping pattern for common libraries.

**Tailwind utilities not automatically available in shadow roots** → Tailwind CSS is a separate concern not solved here; shadow DOM MFEs using shadcn still need to inject Tailwind CSS. Mitigation: existing manual injection approach is preserved; a proper fix is deferred.

## Migration Plan

1. Mark `@hai3/uikit` deprecated in `package.json` with a notice pointing to the migration guide
2. Update `packages/framework` theme registry to accept `Record<string, string>`; remove `UikitTheme` type dependency
3. Add `setTheme(cssVars: Record<string, string>): void` to `MountManager` abstract interface
4. Update `DefaultMountManager` to call `setTheme` (no-op for Shadow DOM; relies on CSS inheritance)
5. Update `HAI3_SHARED_PROPERTY_THEME` value type to `string`
6. Remove `uikitRegistry` step from the documented initialization sequence
7. Update blank-MFE and demo-MFE templates: remove `ThemeAwareReactLifecycle`, `themes.ts`, `@hai3/uikit` imports; add local `components/ui/`
8. Update `.ai/GUIDELINES.md` and `UIKIT.md`

**Rollback:** All changes are additive or internal to the framework. `@hai3/uikit` is deprecated but not removed; rollback means reverting the framework theme API change and the shared property type change.

## Open Questions

1. **Tailwind in shadow DOM:** Should a proper CSS injection solution (e.g., Vite plugin emitting a CSS bundle into each shadow root) be tackled as part of this change or a follow-up?

Follow-up.

2. **`@hai3/uikit` removal timeline:** When does the package get removed from the monorepo — next major version, after N deprecation releases, or when the last internal consumer is migrated?

When the last internal consumer is migrated.

3. **Demo-MFE UI components:** The demo-MFE has ~50 components imported from `@hai3/uikit`. Do these get migrated to local shadcn copies as part of this change, or does the demo-MFE remain on the deprecated package until a follow-up?

Migrate.
