# Add Item Base UI Kit Element

## Why

The Item component is a fundamental building block for displaying structured content with media, title, description, and actions. It provides a flexible flex container that can house nearly any type of content and is commonly used in lists, menus, and data displays. Grouping items with ItemGroup creates consistent, accessible list patterns.

## What Changes

1. **New Component**: Create `item.tsx` in `packages/uikit/src/base/` with the following components:
   - `Item` - Main flex container with variant ("default" | "outline" | "muted") and size ("default" | "sm") props, plus asChild support
   - `ItemGroup` - Container for grouping related items
   - `ItemSeparator` - Separator between items in a group
   - `ItemMedia` - Media content container with variant ("default" | "icon" | "image")
   - `ItemContent` - Wrapper for title and description
   - `ItemTitle` - Title display component
   - `ItemDescription` - Description display component
   - `ItemActions` - Action buttons container
   - `ItemHeader` - Header section container
   - `ItemFooter` - Footer section container

2. **Dependencies**: Uses existing `@radix-ui/react-slot` for asChild support and `Separator` component from uikit

3. **Export**: Add all Item components to `packages/uikit/src/index.ts`

4. **Demo**: Add Item examples to `DataDisplayElements.tsx` demonstrating:
   - Basic item with media, title, description, and actions
   - Item with different variants (default, outline, muted)
   - Item with different sizes (default, sm)
   - ItemGroup with multiple items and separators
   - Item with header and footer sections
   - Item with icon media variant
   - Item with image media variant

5. **Translations**: Add translation keys to all 36 language files in `src/screensets/demo/screens/uikit/i18n/`

6. **Category System**: Add 'Item' to `IMPLEMENTED_ELEMENTS` array in `uikitCategories.ts` (Item is already listed in the Data Display category)

## Impact

- Medium complexity: Multiple sub-components with variant and size support
- Uses existing dependencies: `@radix-ui/react-slot`, `class-variance-authority`, and `Separator` component
- No breaking changes to existing components
- Follows established shadcn/ui patterns with CVA for variants


