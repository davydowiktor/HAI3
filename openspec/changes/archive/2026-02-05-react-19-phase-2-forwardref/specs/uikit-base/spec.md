# Delta Spec: UI Kit Base Components - React 19 Ref Pattern

This delta spec documents the migration of all base and composite components from React's deprecated `forwardRef` pattern to React 19's native ref-as-prop pattern.

## MODIFIED Requirements

### Requirement: Components use React 19 native ref pattern

All UI Kit base and composite components SHALL use React 19's native ref-as-prop pattern instead of the deprecated `forwardRef` wrapper.

#### Scenario: Component accepts ref as a standard prop

- **WHEN** a component needs to accept a ref from a parent
- **THEN** the ref is included as a standard prop in the component's props type
- **AND** the ref is destructured from props like any other prop
- **AND** no `forwardRef` wrapper is used

**Example:**
```typescript
// ✅ React 19 native ref pattern
export const Button = ({
  ref,
  className,
  variant,
  ...props
}: ButtonProps & { ref?: Ref<HTMLButtonElement> }) => {
  return <button ref={ref} className={className} {...props} />;
};

// ❌ Deprecated forwardRef pattern (removed)
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <button ref={ref} {...props} />
);
```

#### Scenario: Component type includes optional ref

- **WHEN** defining a component's props type
- **THEN** the ref is included as an optional property using intersection type
- **AND** the ref type matches the element type being forwarded to
- **AND** the ref type is imported from 'react' as `Ref<T>`

**Example:**
```typescript
import { type Ref } from 'react';

// For button element
type ButtonComponentProps = ButtonProps & { ref?: Ref<HTMLButtonElement> };

// For div element
type CardComponentProps = CardProps & { ref?: Ref<HTMLDivElement> };

// For Radix UI component
type DialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> & {
  ref?: Ref<React.ElementRef<typeof DialogPrimitive.Trigger>>;
};
```

#### Scenario: displayName is preserved

- **WHEN** a component previously had a displayName assigned
- **THEN** the displayName assignment is preserved after migration
- **AND** the displayName remains unchanged

**Example:**
```typescript
const Button = ({ ref, ...props }: ButtonProps & { ref?: Ref<HTMLButtonElement> }) => {
  return <button ref={ref} {...props} />;
};
Button.displayName = 'Button'; // Preserved
```

### Requirement: Special handling for useImperativeHandle (MODIFIED)

Components using `useImperativeHandle` SHALL continue to use it with the native ref pattern.

#### Scenario: Component uses useImperativeHandle

- **WHEN** a component needs to customize the ref's exposed API
- **THEN** the component accepts ref as a standard prop
- **AND** `useImperativeHandle` is used with the ref prop
- **AND** the internal ref logic remains unchanged

**Example:**
```typescript
// Textarea with useImperativeHandle and autoResize
export const Textarea = ({
  ref,
  autoResize,
  ...props
}: TextareaProps & { ref?: Ref<HTMLTextAreaElement> }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Forward ref using useImperativeHandle (compatible with React 19)
  useImperativeHandle(ref, () => textareaRef.current!);

  // ... autoResize logic uses textareaRef

  return <textarea ref={textareaRef} {...props} />;
};
```

### Requirement: No forwardRef imports (MODIFIED)

Components SHALL NOT import `forwardRef` from React.

#### Scenario: Clean imports after migration

- **WHEN** reviewing component imports from 'react'
- **THEN** `forwardRef` is not imported
- **AND** `Ref` type is imported if ref is used
- **AND** other React imports remain as needed

**Example:**
```typescript
// ✅ After migration
import { type Ref, useCallback, useState } from 'react';

// ❌ Before migration (removed)
import { forwardRef, useCallback, useState } from 'react';
```

## Affected Components

### Base Components (21 files)
- accordion.tsx - 4 forwardRef declarations → native ref
- alert-dialog.tsx - 7 forwardRef declarations → native ref
- avatar.tsx - 3 forwardRef declarations → native ref
- button.tsx - 1 forwardRef declaration → native ref
- card.tsx - 6 forwardRef declarations → native ref
- carousel.tsx - 5 forwardRef declarations → native ref
- collapsible.tsx - 3 forwardRef declarations → native ref
- dialog.tsx - 4 forwardRef declarations → native ref
- drawer.tsx - 6 forwardRef declarations → native ref
- dropdown-menu.tsx - 8 forwardRef declarations → native ref
- header.tsx - 1 forwardRef declaration → native ref
- hover-card.tsx - 2 forwardRef declarations → native ref
- input.tsx - 1 forwardRef declaration → native ref
- input-group.tsx - 6 forwardRef declarations → native ref
- navigation-menu.tsx - 6 forwardRef declarations → native ref
- popover.tsx - 3 forwardRef declarations → native ref
- progress.tsx - 1 forwardRef declaration → native ref
- select.tsx - 7 forwardRef declarations → native ref
- sheet.tsx - 4 forwardRef declarations → native ref
- slider.tsx - 4 forwardRef declarations → native ref
- spinner.tsx - 1 forwardRef declaration → native ref
- switch.tsx - 1 forwardRef declaration → native ref
- textarea.tsx - 1 forwardRef declaration → native ref (with useImperativeHandle)
- tooltip.tsx - 2 forwardRef declarations → native ref

### Composite Components (7 files)
- composite/buttons/DropdownButton.tsx - 1 forwardRef → native ref
- composite/buttons/IconButton.tsx - 1 forwardRef → native ref
- composite/navigation/Sidebar.tsx - 7 forwardRef → native ref
- composite/navigation/SidebarHeader.tsx - 1 forwardRef → native ref
- composite/user/UserInfo.tsx - 1 forwardRef → native ref

### CLI Templates (1 file)
- cli/templates/src/screensets/demo/uikit/icons/MenuItemButton.tsx - 2 forwardRef → native ref

**Total: 29 files, 100 forwardRef declarations migrated**

## Implementation Notes

### Migration Tool
- Official React codemod used: `npx codemod react/19/remove-forward-ref`
- Automated transformation for 99 declarations
- Manual fix for textarea.tsx (useImperativeHandle case)

### API Compatibility
- No breaking changes to component APIs
- Component props remain identical
- Ref behavior unchanged from consumer perspective
- All existing code continues to work

### Type Safety
- TypeScript compilation passes with zero errors
- Type inference improved in some cases
- Ref types correctly inferred by TypeScript

## Testing

### Type Checking
- All packages compile cleanly
- Zero TypeScript errors
- Ref types validate correctly

### Manual Testing
- All ref-dependent features tested
- Focus management works correctly
- Imperative methods accessible via refs
- No React warnings in console

### Integration Testing
- CLI generator produces correct component templates
- Generated projects build and run successfully
- MenuItemButton.tsx in demo screenset uses native ref pattern

## References

- [React 19 Upgrade Guide - ref as a prop](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-as-a-prop)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React Codemod Documentation](https://codemod.com/registry/react-19-remove-forward-ref)
