# Design: React 19 Phase 2 - forwardRef Migration

## Approach

**Automated Migration with Manual Validation Strategy:**
1. Use official React codemod for bulk transformation (99 declarations)
2. Manually handle edge cases (textarea.tsx with useImperativeHandle)
3. Comprehensive validation suite to ensure correctness
4. Single feature branch with atomic commits for easy rollback

**Why use codemod:**
- Official tool maintained by React team
- Tested across thousands of projects
- Handles complex type transformations automatically
- Reduces human error in repetitive changes
- Faster than manual migration (29 files, 100 declarations)

## Migration Patterns

### Pattern 1: Simple forwardRef (95% of cases)

**Before:**
```typescript
import React, { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
```

**After (codemod transformation):**
```typescript
import React, { type Ref } from 'react';

export const Button = ({
  ref,
  className,
  variant,
  size,
  ...props
}: ButtonProps & { ref?: Ref<HTMLButtonElement> }) => {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
};
Button.displayName = 'Button';
```

**Changes:**
- Remove `forwardRef` wrapper
- Add `ref` to destructured props
- Merge ref type into props: `ButtonProps & { ref?: Ref<HTMLButtonElement> }`
- displayName preserved (unchanged)

### Pattern 2: Compound components (Radix UI wrappers)

**Before:**
```typescript
const DropdownMenuTrigger = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={className}
    {...props}
  />
));
```

**After (codemod transformation):**
```typescript
const DropdownMenuTrigger = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger> & {
  ref?: Ref<React.ElementRef<typeof DropdownMenuPrimitive.Trigger>>;
}) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={className}
    {...props}
  />
);
```

**Applies to:**
- All Radix UI wrapper components (accordion, alert-dialog, avatar, dialog, dropdown-menu, etc.)
- Sheet, Drawer, Select, Popover, HoverCard, Tooltip, Collapsible, NavigationMenu

### Pattern 3: useImperativeHandle (requires manual fix)

**File:** `packages/uikit/src/base/textarea.tsx`

**Before:**
```typescript
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => textareaRef.current!);

    // ... resize logic
  }
);
```

**After (manual transformation required):**
```typescript
export const Textarea = ({
  ref,
  className,
  autoResize,
  ...props
}: TextareaProps & { ref?: Ref<HTMLTextAreaElement> }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Need to manually handle ref forwarding with useImperativeHandle
  // Option 1: Use callback ref
  const handleRef = useCallback((node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as MutableRefObject<HTMLTextAreaElement | null>).current = node;
    }
  }, [ref]);

  // Option 2: Continue using useImperativeHandle (works with React 19)
  useImperativeHandle(ref, () => textareaRef.current!);

  // ... resize logic, use textareaRef as before
};
```

**Decision:** Keep `useImperativeHandle` approach (simpler, still supported in React 19)

### Pattern 4: Composite components (internal to uikit)

**Files:**
- `packages/uikit/src/composite/buttons/DropdownButton.tsx`
- `packages/uikit/src/composite/buttons/IconButton.tsx`
- `packages/uikit/src/composite/navigation/Sidebar.tsx`
- `packages/uikit/src/composite/navigation/SidebarHeader.tsx`
- `packages/uikit/src/composite/user/UserInfo.tsx`

**Pattern same as Pattern 1:**
- Remove forwardRef wrapper
- Add ref to props type
- Codemod handles automatically

## File-by-File Migration Plan

### Base Components (21 files)

| File | forwardRef Count | Pattern | Codemod |
|------|-----------------|---------|---------|
| accordion.tsx | 4 | Radix wrapper | ✅ Auto |
| alert-dialog.tsx | 7 | Radix wrapper | ✅ Auto |
| avatar.tsx | 3 | Radix wrapper | ✅ Auto |
| button.tsx | 1 | Simple | ✅ Auto |
| card.tsx | 6 | Simple | ✅ Auto |
| carousel.tsx | 5 | Simple | ✅ Auto |
| collapsible.tsx | 3 | Radix wrapper | ✅ Auto |
| dialog.tsx | 4 | Radix wrapper | ✅ Auto |
| drawer.tsx | 6 | Radix wrapper | ✅ Auto |
| dropdown-menu.tsx | 8 | Radix wrapper | ✅ Auto |
| header.tsx | 1 | Simple | ✅ Auto |
| hover-card.tsx | 2 | Radix wrapper | ✅ Auto |
| input.tsx | 1 | Simple | ✅ Auto |
| input-group.tsx | 6 | Simple | ✅ Auto |
| navigation-menu.tsx | 6 | Radix wrapper | ✅ Auto |
| popover.tsx | 3 | Radix wrapper | ✅ Auto |
| progress.tsx | 1 | Radix wrapper | ✅ Auto |
| select.tsx | 7 | Radix wrapper | ✅ Auto |
| sheet.tsx | 4 | Radix wrapper | ✅ Auto |
| slider.tsx | 4 | Radix wrapper | ✅ Auto |
| spinner.tsx | 1 | Simple | ✅ Auto |
| switch.tsx | 1 | Radix wrapper | ✅ Auto |
| **textarea.tsx** | **1** | **useImperativeHandle** | **⚠️ Manual** |
| tooltip.tsx | 2 | Radix wrapper | ✅ Auto |

### Composite Components (7 files)

| File | forwardRef Count | Pattern | Codemod |
|------|-----------------|---------|---------|
| buttons/DropdownButton.tsx | 1 | Simple | ✅ Auto |
| buttons/IconButton.tsx | 1 | Simple | ✅ Auto |
| navigation/Sidebar.tsx | 7 | Compound | ✅ Auto |
| navigation/SidebarHeader.tsx | 1 | Simple | ✅ Auto |
| user/UserInfo.tsx | 1 | Simple | ✅ Auto |

### CLI Template (1 file)

| File | forwardRef Count | Pattern | Codemod |
|------|-----------------|---------|---------|
| cli/templates/.../MenuItemButton.tsx | 2 | Simple | ✅ Auto |

**Total: 29 files, 100 forwardRef declarations**
- Automated: 29 files (99 declarations)
- Manual fix: 1 file (textarea.tsx - 1 declaration using useImperativeHandle)

## Codemod Execution

### Install codemod CLI
```bash
npm install -g codemod
```

### Run on all affected files
```bash
# Base components
npx codemod react/19/remove-forward-ref packages/uikit/src/base/*.tsx

# Composite components
npx codemod react/19/remove-forward-ref packages/uikit/src/composite/**/*.tsx

# CLI template
npx codemod react/19/remove-forward-ref packages/cli/templates/src/screensets/demo/uikit/icons/MenuItemButton.tsx
```

### Expected codemod output
- Removes `forwardRef` imports (if unused)
- Keeps `Ref` import (adds if missing)
- Transforms function signature
- Preserves displayName assignments
- Preserves all other code (hooks, logic, JSX)

### Manual textarea.tsx fix
After codemod:
1. Verify `useImperativeHandle` still works with new signature
2. Test autoResize functionality
3. Ensure ref forwarding works correctly

## Validation Strategy

### 1. Pre-Migration Baseline
```bash
npm run type-check          # Establish baseline (should pass)
npm run build:packages      # Verify clean build
npm run arch:check          # Architecture rules
git status                  # Clean working tree
```

### 2. Run Codemod
```bash
npx codemod react/19/remove-forward-ref packages/uikit/src/base/*.tsx
npx codemod react/19/remove-forward-ref packages/uikit/src/composite/**/*.tsx
npx codemod react/19/remove-forward-ref packages/cli/templates/src/screensets/demo/uikit/icons/MenuItemButton.tsx
```

### 3. Manual textarea.tsx Fix
- Open `packages/uikit/src/base/textarea.tsx`
- Verify codemod transformation
- Test useImperativeHandle compatibility
- Ensure ref callback works with autoResize

### 4. Post-Migration Validation
```bash
npm run type-check          # Must pass (zero errors)
npm run type-check:packages # All packages compile
npm run build:packages      # Clean build
npm run arch:check          # All checks pass
npm run lint                # Zero warnings
```

### 5. Manual Testing
- Start dev server: `npm run dev`
- Test all components with refs:
  - Button (click, focus)
  - Input (focus, setValue)
  - Textarea (focus, autoResize, setValue)
  - Select (focus, open)
  - Dialog/Sheet (open, close, focus trap)
  - Dropdown menus (open, close, keyboard nav)
  - All composite components (IconButton, DropdownButton, Sidebar)
- Verify no console errors or warnings
- Test ref access from parent components

### 6. CLI Generator Testing
```bash
# Generate new project
npx @hai3/cli@alpha init /tmp/test-react19-p2

# Verify MenuItemButton.tsx in generated project
cat /tmp/test-react19-p2/src/screensets/demo/uikit/icons/MenuItemButton.tsx

# Run validation in generated project
cd /tmp/test-react19-p2
npm install
npm run type-check
npm run build
npm run dev
```

## Rollback Plan

### Quick Rollback (single commit revert)
```bash
# Revert codemod changes
git revert HEAD

# Validate rollback
npm run type-check
npm run build:packages
npm run dev
```

### Full Rollback (abandon branch)
```bash
git checkout main
git branch -D feat/react19-p2
```

## Trade-offs

### Chosen: Automated Codemod + Manual textarea.tsx

**Pros:**
- Fast migration (minutes vs. hours)
- Consistent transformations across all files
- Reduces human error in repetitive changes
- Official React tool (tested across ecosystem)
- Easy to review (single atomic commit)
- Manual attention for complex case (useImperativeHandle)

**Cons:**
- Must review codemod output for correctness
- textarea.tsx requires manual intervention
- Codemod may produce verbose type annotations

### Alternative: Manual Migration

**Pros:**
- Full control over each transformation
- Can optimize types during migration
- No tool installation required

**Cons:**
- Time-consuming (29 files, 100 declarations)
- High risk of inconsistency
- Prone to copy-paste errors
- Harder to review (multiple commits)
- Tedious and error-prone

**Decision:** Codemod chosen for speed, consistency, and reliability. Manual fix for 1 edge case is acceptable trade-off.

## Risk Assessment

### Low Risk Factors
- React 19 fully supports native ref pattern (not experimental)
- Codemod maintained by React core team
- No API changes (internal refactor only)
- displayName preserved (component names unchanged)
- Comprehensive validation suite catches regressions

### Medium Risk Factors
- Large change surface (29 files, 100 declarations)
- textarea.tsx uses useImperativeHandle (manual fix required)
- Must test all ref-dependent features manually
- Type inference changes may affect consumers (unlikely)

### Mitigation Strategies
- Single atomic commit for easy rollback
- Separate commit for textarea.tsx fix
- Full validation suite before merging
- Manual testing checklist for ref features
- CLI generator integration test

## Additional Fixes During Migration

### Demo Code Type Errors

**Issue:** After codemod transformation, TypeScript revealed pre-existing type errors in demo code.

**File:** `src/screensets/demo/components/FormElements.tsx`

**Problem:**
```typescript
// Invalid align prop values
<InputGroupAddon align="block-end">    // Error: not assignable to "inline-end" | "inline-start"
<InputGroupAddon align="block-start">  // Error: not assignable to "inline-end" | "inline-start"
```

**Root cause:**
- `InputGroupAddon` component type only accepts `"inline-start" | "inline-end"`
- Demo code was using CSS logical flow directions `"block-start"` and `"block-end"`
- These errors were hidden before but exposed by stricter typing after migration

**Fix applied:**
```typescript
// Expanded InputGroupAddon type to accept all 4 CSS logical flow directions
type InputGroupAddonProps = {
  align?: "inline-start" | "inline-end" | "block-start" | "block-end";
};

// Demo code correctly uses block directions for vertical positioning
<InputGroupAddon align="block-end">   // Bottom addon (after textarea)
<InputGroupAddon align="block-start"> // Top addon (before textarea)
```

**Rationale:**
- `block-start/end` are correct for vertical positioning (top/bottom addons)
- `inline-start/end` are correct for horizontal positioning (left/right addons)
- Expanded type definition to support both use cases
- Demo code uses vertical positioning for textarea addons (code editor layout)

### ElementRef Deprecation (React 19)

**Issue:** After codemod transformation, all Radix UI wrapper components used `React.ElementRef` which is deprecated in React 19.

**Files affected:** 16 base components (accordion, alert-dialog, avatar, collapsible, dialog, drawer, dropdown-menu, hover-card, navigation-menu, popover, progress, select, sheet, slider, switch, tooltip)

**Problem:**
```typescript
// Deprecated in React 19
ref?: React.Ref<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>>
```

**Root cause:**
- `React.ElementRef` is deprecated in React 19
- React 19 deprecates accessing `element.ref` - ref is now a regular prop
- Official replacement is `React.ComponentRef`

**Fix applied:**
```typescript
// React 19 compatible
ref?: React.Ref<React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>>
```

**Implementation:**
- Batch replacement using sed: `s/React\.ElementRef/React.ComponentRef/g`
- 67 occurrences replaced across 16 files
- Type checking passes (zero errors)

**References:**
- [shadcn-ui ElementRef deprecation discussion](https://github.com/shadcn-ui/ui/discussions/6195)
- [shadcn-ui React 19 ElementRef issue](https://github.com/shadcn-ui/ui/issues/7920)

## Success Criteria

- [x] All 100 forwardRef declarations migrated
- [x] Zero TypeScript errors (npm run type-check)
- [x] Clean package builds (npm run build:packages)
- [x] All architecture checks pass (npm run arch:check)
- [x] No linting errors (npm run lint)
- [ ] Dev server starts cleanly (npm run dev)
- [ ] All ref-dependent features work (manual test)
- [ ] textarea.tsx autoResize works correctly
- [ ] CLI generator produces correct MenuItemButton.tsx
- [ ] Generated project builds and runs
- [ ] No React warnings in browser console

## Implementation Status

**Completed:**
- Automated codemod migration (100 forwardRef declarations)
- Type corrections (RefObject to Ref, optional refs)
- Type annotations for implicit any types
- Demo code fixes (FormElements.tsx align props)
- Import cleanup (unused VariantProps, missing ButtonProps)
- Full compilation validation (type-check, build, lint)

**Pending manual testing:**
- Runtime validation in dev server
- Manual testing of ref-dependent features
- CLI generator integration testing
- Browser console validation

## References

- [React 19 Upgrade Guide - forwardRef](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-as-a-prop)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React Codemod Documentation](https://codemod.com/registry/react-19-remove-forward-ref)
- [React forwardRef Deprecation RFC](https://github.com/reactjs/rfcs/pull/258)
