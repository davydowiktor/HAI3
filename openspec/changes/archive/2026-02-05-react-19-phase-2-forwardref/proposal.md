# Change: React 19 Phase 2 - forwardRef Migration

## Why

React 19 introduces native ref support as a standard prop, making the `forwardRef` wrapper deprecated. Phase 1 upgraded React to 19.2.4 but deferred the migration of 100 forwardRef declarations across 29 files. This phase completes the React 19 migration by adopting the modern ref pattern, removing deprecated code, and improving component ergonomics.

**Benefits:**
- Removes deprecated `forwardRef` wrapper (React warns about it)
- Simplifies component definitions (less boilerplate)
- Improves TypeScript inference for refs
- Aligns HAI3 with React 19 best practices
- Enables better tree-shaking (removes wrapper overhead)

## What Changes

- **Automated migration using React codemod:**
  - Run `npx codemod react/19/remove-forward-ref` on 29 files
  - Migrates 100 forwardRef declarations to native ref pattern
  - Automatically handles type conversions and prop spreading

- **Manual fixes required:**
  - `packages/uikit/src/base/textarea.tsx` - uses `useImperativeHandle`, requires custom migration
  - Type annotations for components with implicit any types
  - `packages/uikit/src/base/input-group.tsx` - expand InputGroupAddon type to support block-start/block-end
  - Replace deprecated `React.ElementRef` with `React.ComponentRef` (67 occurrences in 16 Radix UI wrappers)
  - Review and test all migrated components for correctness

- **Code pattern transformation:**
  ```typescript
  // Before (React 18/19 deprecated pattern)
  const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => <button ref={ref} {...props} />
  )

  // After (React 19 native pattern)
  const Button = ({ ref, ...props }: ButtonProps & { ref?: Ref<HTMLButtonElement> }) => (
    <button ref={ref} {...props} />
  )
  ```

## Impact

**Affected specs:**
- `uikit-base` - All 29 base and composite components with forwardRef

**Affected files (29 total):**
- `packages/uikit/src/base/` (21 files): accordion, alert-dialog, avatar, button, card, carousel, collapsible, dialog, drawer, dropdown-menu, header, hover-card, input, input-group, navigation-menu, popover, progress, select, sheet, slider, switch, textarea, tooltip
- `packages/uikit/src/composite/` (7 files): buttons/DropdownButton, buttons/IconButton, navigation/Sidebar, navigation/SidebarHeader, user/UserInfo
- `packages/cli/templates/` (1 file): demo screenset MenuItemButton

**Affected packages (version bumps required):**
- `@hai3/uikit` - All component implementations changed
- `@hai3/cli` - Template file changed
- `@hai3/studio` - May need version bump if it depends on uikit

**Breaking changes:**
- None - this is an internal refactor, no API changes
- Component signatures remain identical from consumer perspective
- Refs continue to work exactly as before

**Compatibility:**
- React 19.2.4+ required (already enforced in Phase 1)
- No changes to component exports or prop types
- All existing code using these components continues to work

**Risk level:** Medium
- Medium risk: 100 forwardRef declarations = large change surface
- Mitigation: Use official React codemod (tested by React team)
- Mitigation: Comprehensive validation suite (type-check, build, tests)
- Mitigation: textarea.tsx requires manual attention (uses useImperativeHandle)

**Rollback plan:**
- Single commit for all codemod changes (easy revert)
- Separate commit for textarea.tsx manual fix
- Feature branch: `feat/react19-p2`
