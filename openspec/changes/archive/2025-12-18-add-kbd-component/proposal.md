# Change: Add Kbd Base Component

## Why

The UI Kit needs a Kbd (keyboard) component for displaying keyboard shortcuts and key combinations in a styled inline format. This is commonly used in tooltips, buttons, input groups, and documentation to show keyboard shortcuts. Kbd is already planned in the "Data Display" category but not yet implemented.

## What Changes

- Add `Kbd` and `KbdGroup` components to `@hai3/uikit`
- Add demo examples showing Kbd in buttons, tooltips, input groups, and as grouped combinations
- Add translations for all 36 supported languages
- Add 'Kbd' to `IMPLEMENTED_ELEMENTS` array

## Impact

- Affected specs: `uikit-base`
- Affected code:
  - `packages/uikit/src/base/kbd.tsx` (new file)
  - `packages/uikit/src/index.ts` (export)
  - `src/screensets/demo/components/DataDisplayElements.tsx` (demo)
  - `src/screensets/demo/screens/uikit/uikitCategories.ts` (IMPLEMENTED_ELEMENTS)
  - `src/screensets/demo/screens/uikit/i18n/*.json` (36 files)
