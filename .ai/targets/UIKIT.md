
# UI Kit Guidelines (DEPRECATED)

> **DEPRECATED**: `@hai3/uikit` is deprecated. MFEs own their UI components locally using copy-owned shadcn/ui components in a `components/ui/` directory. Theme CSS variables are delivered automatically via CSS inheritance from `:root`.

## AI WORKFLOW (REQUIRED)
1) This package is deprecated. No new components should be added.
2) STOP if asked to add new components to `@hai3/uikit`.

## SCOPE
- All code under packages/uikit/** is in maintenance-only mode.
- No new features, components, or capabilities will be added.
- Existing components remain as-is during the deprecation window.

## MIGRATION
- MFEs should copy needed components from `packages/uikit/src/base/` to their own `components/ui/` directory.
- MFEs should add `clsx`, `tailwind-merge`, `class-variance-authority` as local dependencies.
- Remove `@hai3/uikit` from `package.json` and `vite.config.ts` shared dependencies.
- See the blank-MFE template (`src/mfe_packages/_blank-mfe/`) for the recommended pattern.

## FILE STRUCTURE RULES
- Base components: packages/uikit/src/base/**. (frozen)
- Composites: packages/uikit/src/composite/**. (frozen)
- Icons: packages/uikit/src/icons/**. (frozen)
- Theme utilities: packages/uikit/src/theme/**. (frozen)
