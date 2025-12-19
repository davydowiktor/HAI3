# Change: Optional Auto-Navigation on Initial Load

## Why

Applications need control over initial routing behavior. Currently, HAI3 always redirects from "/" to the first registered screen, preventing external navigation control. This makes it impossible to defer navigation until after application initialization or external trigger.

## What Changes

- Add `autoNavigate` optional boolean prop to `RouterConfig` type in HAI3Provider
- Modify AppRouter to conditionally redirect based on `autoNavigate` flag
- When `autoNavigate=false`, app renders Layout on "/" without redirect, waiting for explicit `navigateToScreen()` call
- When `autoNavigate=true` (default), maintains current behavior - auto-redirect to first screen
- Update HAI3Provider to pass `autoNavigate` prop to AppRouter

## Impact

- **Affected specs**: app-configuration
- **Affected code**:
  - `packages/uicore/src/core/HAI3Provider.tsx` - RouterConfig type and prop passing
  - `packages/uicore/src/core/routing/AppRouter.tsx` - Conditional redirect logic
  - `src/main.tsx` - Example usage in consuming app
- **Breaking changes**: None - default behavior preserved
- **New capabilities**: External navigation control, deferred routing
