# Implementation Tasks

## Progress Summary

**Current Status**: Complete

---

## Phase 1: Locale source and @hai3/i18n formatters

**Goal**: Ensure formatters use i18nRegistry.getLanguage() and all formatters/types are exported from @hai3/i18n.

- [x] 1.1 Verify `packages/i18n/src/formatters/utils.ts` exports `getLocale()` returning `i18nRegistry.getLanguage() ?? Language.English` (used internally by formatters; not required on package public API)
- [x] 1.2 Verify date formatters: formatDate, formatTime, formatDateTime, formatRelative in `dateFormatter.ts` use getLocale(), Intl APIs, invalid input → `''`
- [x] 1.3 Verify number formatters: formatNumber, formatPercent, formatCompact in `numberFormatter.ts` use getLocale(), null/undefined/NaN → `''`
- [x] 1.4 Verify formatCurrency in `currencyFormatter.ts` (Intl.NumberFormat style currency), null/undefined/NaN → `''`
- [x] 1.5 Verify compareStrings and createCollator in `sortUtils.ts` use getLocale()
- [x] 1.6 Verify `packages/i18n/src/index.ts` exports all 10 formatter functions
- [x] 1.7 Verify `packages/i18n/src/index.ts` (or formatters) exports types DateFormatStyle, TimeFormatStyle, DateInput

**Traceability**: Requirement "Locale source for formatters", "Date and time formatters", "Number formatters", "Currency formatter", "Locale-aware string comparison", "Package and export surface"

---

## Phase 2: Framework and React

**Goal**: Re-export from @hai3/framework and expose useFormatters() in @hai3/react with language subscription.

- [x] 2.1 Verify `packages/framework/src/index.ts` re-exports all formatter functions and types from @hai3/i18n
- [x] 2.2 Verify `packages/react/src/hooks/useFormatters.ts` returns object with all 10 formatters
- [x] 2.3 Verify useFormatters() depends on useTranslation() and useMemo([language]) so components re-render when language changes

**Traceability**: Requirement "Package and export surface", "useFormatters hook from @hai3/react", "React components re-render when language changes"

---

## Phase 3: Edge cases, types, and documentation

**Goal**: All formatters handle invalid input and are fully typed and documented.

- [x] 3.1 Verify every formatter returns `''` for null, undefined, NaN, or invalid Date and does not throw
- [x] 3.2 Verify formatter public signatures use explicit types (no any/unknown); date inputs use DateInput
- [x] 3.3 Verify JSDoc on all public formatters: @param, @returns, and note empty string for null/undefined/invalid (equivalent wording acceptable)

**Traceability**: Requirement "Edge cases and types", "Documentation"

---

## Phase 4: Tests

**Goal**: Tests cover locale behavior and edge cases.

- [x] 4.1 Verify `packages/i18n/src/formatters/__tests__/*.test.ts` mock i18nRegistry.getLanguage() and assert locale-specific output where relevant
- [x] 4.2 Verify same tests cover null/undefined/NaN or invalid date returning `''`

**Traceability**: Spec scenarios and edge cases
