## MODIFIED Requirements

### Requirement: Components use React 19 native ref pattern

**Status: Deprecated** — This requirement applies only to the `@hai3/uikit` package, which is deprecated. No new components SHALL be added. Existing components remain as-is during the deprecation window.

All UI Kit base and composite components SHALL use React 19's native ref-as-prop pattern instead of the deprecated `forwardRef` wrapper.

#### Scenario: Component accepts ref as a standard prop

- **WHEN** a component in the deprecated `@hai3/uikit` package needs to accept a ref from a parent
- **THEN** the ref is included as a standard prop in the component's props type
- **AND** no `forwardRef` wrapper is used
- **AND** no new components SHALL be added to the package

## REMOVED Requirements

### Requirement: UiKitComponent enum defines registered components

**Reason**: `@hai3/uikit` is deprecated. MFEs are no longer required to use a specific UI library or register components with a central enum. Component type contracts are owned by each MFE locally.

**Migration**: Remove all references to `UiKitComponent` enum, `UiKitComponentMap`, and `ComponentName` type. MFE components use their own types defined locally or by their chosen UI library.

### Requirement: Base components come from the configured UI kit

**Reason**: The "configured UI kit" concept is removed. There is no centrally configured UI kit. MFEs source their own UI components.

**Migration**: Replace `@hai3/uikit` imports with locally owned component files (e.g., `components/ui/button.tsx`) or imports from any npm UI library.

### Requirement: Theme type contract

**Reason**: The typed `Theme` interface is replaced by `Record<string, string>` CSS variable maps managed by the framework theme registry. MFEs no longer import or consume `Theme` objects.

**Migration**: Remove all imports of `Theme` type from `@hai3/uikit`. Theme application is automatic via CSS inheritance and mount manager injection. Remove `applyTheme`, `applyThemeToShadowRoot`, and `themes.ts` from MFE code.

### Requirement: Skeleton used for loading states

**Reason**: The `Skeleton` component is no longer mandated from `@hai3/uikit`. MFEs MAY use any skeleton implementation from their chosen UI library or local components.

**Migration**: Replace `import { Skeleton } from '@hai3/uikit'` with a local `components/ui/skeleton.tsx` or equivalent from the MFE's chosen UI library.
