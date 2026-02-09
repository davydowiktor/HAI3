# i18n-formatters Design Overview

## Locale source

All formatters use `getLocale()` from `packages/i18n/src/formatters/utils.ts`, which returns `i18nRegistry.getLanguage() ?? Language.English`. No formatter accepts a locale argument; locale is always the current registry language so that UI stays in sync with the active language.

## API surface

| Area | Functions | Intl API |
|------|-----------|----------|
| Date/time | formatDate, formatTime, formatDateTime, formatRelative | DateTimeFormat, RelativeTimeFormat |
| Number | formatNumber, formatPercent, formatCompact | NumberFormat |
| Currency | formatCurrency | NumberFormat (style: currency) |
| Sort | compareStrings, createCollator | Collator |

## Package layout

- **@hai3/i18n**: Formatters live under `src/formatters/` (dateFormatter, numberFormatter, currencyFormatter, sortUtils, utils). Public API exported from package index; types DateFormatStyle, TimeFormatStyle, DateInput exported.
- **@hai3/framework**: Re-exports all formatter functions and types from `@hai3/i18n`.
- **@hai3/react**: `useFormatters()` in hooks; returns same functions; uses useTranslation (or equivalent) so components re-render when language changes.

## Edge behavior

- Null, undefined, NaN, or invalid Date inputs: all formatters return `''` and do not throw.
- Public APIs are fully typed (no `any`/`unknown`); date inputs use `DateInput` (Date | number | string).
