# Change: i18n-formatters

## Why

Applications need to display dates, numbers, currency, and sorted lists according to the user's current language (e.g. 12,345.67 in USA vs 12.345,67 in Germany). A single, locale-aware formatting API keeps the UI consistent and avoids ad-hoc `Intl` usage or hardcoded formats.

## What Changes

- **L1 @hai3/i18n**: Locale-aware formatters using `i18nRegistry.getLanguage()` as the source of truth, with fallback to `Language.English`. Date/time (formatDate, formatTime, formatDateTime, formatRelative), number (formatNumber, formatPercent, formatCompact), currency (formatCurrency), and string comparison (compareStrings, createCollator). All use browser `Intl` APIs; invalid or null/undefined inputs return `''`.
- **L2 @hai3/framework**: Re-export formatters and types from `@hai3/i18n` so app code can consume from framework without depending on i18n package internals.
- **L3 @hai3/react**: `useFormatters()` hook returning all formatters bound to the current locale; hook subscribes to language (e.g. via useTranslation) so components re-render when language changes.

## Impact

- **Layers**: L1 (i18n), L2 (framework), L3 (react). No registry root changes.
- **Rollback**: Remove or stub formatter exports and hook; no persisted state.

## Spec

- [openspec/specs/i18n-formatters/spec.md](../../specs/i18n-formatters/spec.md)
