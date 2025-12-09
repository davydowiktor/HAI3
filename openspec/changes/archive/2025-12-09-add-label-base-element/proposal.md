# Change: Add Label Base UI Kit Element

## Why
Label is a fundamental form element for associating text with form controls. It is listed in the UI Kit category system under Forms & Inputs but not yet implemented. Labels are essential for accessibility and proper form semantics.

## What Changes
- Add `Label` base component built on `@radix-ui/react-label`
- Export component from `@hai3/uikit` package
- Add demo examples in Forms & Inputs category with translations
- Mark Label as implemented in category system

## Impact
- Affected specs: `uikit-base`
- Affected code:
  - `packages/uikit/src/base/label.tsx` (new)
  - `packages/uikit/src/index.ts`
  - `src/screensets/demo/components/FormElements.tsx`
  - `src/screensets/demo/screens/uikit/uikitCategories.ts`
  - `src/screensets/demo/screens/uikit/i18n/*.json` (36 language files)
