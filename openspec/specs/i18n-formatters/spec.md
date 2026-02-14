# i18n-formatters Specification

## Purpose

Define locale-aware formatting utilities for dates, numbers, currency, and string comparison so that data displays according to the user's current language (e.g. 12,345.67 in USA vs 12.345,67 in Germany). Implementation lives in `@hai3/i18n` (L1 SDK); formatters are re-exported by `@hai3/framework` and exposed to React via `useFormatters()` in `@hai3/react`.

## Risk

**Low risk, additive-only.** This spec introduces new formatter APIs and exports only; it does not change or remove existing public APIs. All formatters use standard browser `Intl` APIs and return empty string for invalid inputs, avoiding runtime exceptions.

## Requirements

### Requirement: Locale source for formatters

The system SHALL use `i18nRegistry.getLanguage()` as the source of truth for the active locale in all formatters. When the current language is null, the system SHALL fall back to `Language.English`.

#### Scenario: Formatters use registry locale

```typescript
// packages/i18n/src/formatters/utils.ts
export function getLocale(): string {
  return i18nRegistry.getLanguage() ?? Language.English;
}
```

- **GIVEN** the i18n registry has a current language set (e.g. via `i18n/language/changed` event)
- **WHEN** any formatter (formatDate, formatNumber, formatCurrency, compareStrings, etc.) is called
- **THEN** the formatter SHALL use `getLocale()` which reads `i18nRegistry.getLanguage() ?? Language.English`
- **AND** output SHALL follow that locale's conventions (e.g. date order, decimal separator, currency symbol)

#### Scenario: React components re-render when language changes

```typescript
// useFormatters() calls useTranslation() so component re-renders when language changes
const { formatDate, formatCurrency } = useFormatters();
```

- **GIVEN** a component that uses `useFormatters()`
- **WHEN** the user changes language (e.g. via setLanguage or event)
- **THEN** the component SHALL re-render with formatters using the new locale
- **BECAUSE** useFormatters subscribes to language via useTranslation()

### Requirement: Date and time formatters

The system SHALL provide locale-aware date and time formatting functions using the browser `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` APIs.

#### Scenario: formatDate

```typescript
formatDate(date, format: 'short' | 'medium' | 'long' | 'full')
```

- **GIVEN** a date input (Date, timestamp, or ISO string)
- **WHEN** `formatDate(date, format)` is called
- **THEN** the system SHALL return a string formatted for the current locale with the given date style
- **AND** invalid or null/undefined input SHALL return `''`

#### Scenario: formatTime

```typescript
formatTime(date, format: 'short' | 'medium')
```

- **GIVEN** a date input
- **WHEN** `formatTime(date, format)` is called
- **THEN** the system SHALL return the time portion formatted for the current locale
- **AND** invalid or null/undefined input SHALL return `''`

#### Scenario: formatDateTime

```typescript
formatDateTime(date, dateFormat, timeFormat)
```

- **GIVEN** a date input and date/time style options
- **WHEN** `formatDateTime(date, dateFormat, timeFormat)` is called
- **THEN** the system SHALL return date and time formatted for the current locale
- **AND** invalid or null/undefined input SHALL return `''`

#### Scenario: formatRelative

```typescript
formatRelative(date, base?)
```

- **GIVEN** a date input and optional base date (default now)
- **WHEN** `formatRelative(date, base)` is called
- **THEN** the system SHALL return a relative time string (e.g. "2 hours ago", "in 3 days") using `Intl.RelativeTimeFormat`
- **AND** invalid or null/undefined input SHALL return `''`

### Requirement: Number formatters

The system SHALL provide locale-aware number formatting using the browser `Intl.NumberFormat` API.

#### Scenario: formatNumber

```typescript
formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions)
```

- **GIVEN** a numeric value (or null/undefined)
- **WHEN** `formatNumber(value, options)` is called
- **THEN** the system SHALL return a string with locale-appropriate grouping and decimal separators
- **AND** null, undefined, or NaN SHALL return `''`

#### Scenario: formatPercent

```typescript
formatPercent(value, decimals?)
```

- **GIVEN** a decimal value (e.g. 0.15 for 15%) and optional decimal places
- **WHEN** `formatPercent(value, decimals)` is called
- **THEN** the system SHALL return a percentage string for the current locale (e.g. "15%")
- **AND** null, undefined, or NaN SHALL return `''`

#### Scenario: formatCompact

```typescript
formatCompact(value)
```

- **GIVEN** a numeric value
- **WHEN** `formatCompact(value)` is called
- **THEN** the system SHALL return compact notation for the current locale (e.g. "1.2K", "3.4M")
- **AND** null, undefined, or NaN SHALL return `''`

### Requirement: Currency formatter

The system SHALL provide locale-aware currency formatting using `Intl.NumberFormat` with style `currency`.

#### Scenario: formatCurrency

```typescript
formatCurrency(value: number | null | undefined, currencyCode: string)
```

- **GIVEN** a numeric amount and an ISO 4217 currency code (e.g. 'USD', 'EUR')
- **WHEN** `formatCurrency(value, currencyCode)` is called
- **THEN** the system SHALL return a currency string for the current locale (symbol position and separators)
- **AND** null, undefined, or NaN SHALL return `''`

### Requirement: Locale-aware string comparison

The system SHALL provide locale-aware string comparison for sorting using the browser `Intl.Collator` API.

#### Scenario: compareStrings

```typescript
compareStrings(a: string, b: string, options?: Intl.CollatorOptions): number
```

- **GIVEN** two strings and optional Collator options
- **WHEN** `compareStrings(a, b, options)` is called
- **THEN** the system SHALL return a number suitable for sort comparators (negative if a < b, 0 if equal, positive if a > b)
- **AND** the comparison SHALL respect the current locale (e.g. accented characters, numeric ordering)

#### Scenario: createCollator

```typescript
createCollator(options?: Intl.CollatorOptions): Intl.Collator
```

- **GIVEN** optional Collator options
- **WHEN** `createCollator(options)` is called
- **THEN** the system SHALL return an `Intl.Collator` instance configured for the current locale
- **AND** callers MAY reuse it for many comparisons (e.g. table column sort)

### Requirement: Package and export surface

Formatters SHALL be implemented in the L1 SDK package `@hai3/i18n` and SHALL be re-exported so that app code can consume them without depending on package internals.

#### Scenario: Exports from @hai3/i18n

- **GIVEN** the `@hai3/i18n` package
- **WHEN** a consumer imports from `@hai3/i18n`
- **THEN** the following SHALL be available: `formatDate`, `formatTime`, `formatDateTime`, `formatRelative`, `formatNumber`, `formatPercent`, `formatCompact`, `formatCurrency`, `compareStrings`, `createCollator`
- **AND** types `DateFormatStyle`, `TimeFormatStyle`, `DateInput` SHALL be exported

#### Scenario: Re-exports from @hai3/framework

- **GIVEN** the `@hai3/framework` package
- **WHEN** a consumer imports formatters from `@hai3/framework`
- **THEN** the same formatter functions and types SHALL be available (re-exported from `@hai3/i18n`)

#### Scenario: useFormatters hook from @hai3/react

- **GIVEN** the `@hai3/react` package
- **WHEN** a component calls `useFormatters()`
- **THEN** the hook SHALL return an object with all formatter functions bound to the current locale
- **AND** the returned object SHALL include: formatDate, formatTime, formatDateTime, formatRelative, formatNumber, formatPercent, formatCompact, formatCurrency, compareStrings, createCollator
- **AND** the hook SHALL cause re-render when language changes (via useTranslation subscription)

### Requirement: Edge cases and types

Formatters SHALL handle null, undefined, and invalid inputs gracefully and SHALL be fully typed with TypeScript.

#### Scenario: Invalid or missing inputs

- **GIVEN** any formatter that accepts a value or date
- **WHEN** the input is null, undefined, or invalid (e.g. NaN, invalid Date)
- **THEN** the formatter SHALL return `''` and SHALL NOT throw

#### Scenario: Full TypeScript typing

- **GIVEN** the formatter module
- **WHEN** TypeScript compiles the codebase
- **THEN** all formatter function signatures SHALL use explicit types (no `any` or `unknown` in public APIs)
- **AND** date inputs SHALL be typed as `Date | number | string | null | undefined` (DateInput) where applicable

### Requirement: Documentation

Formatter functions SHALL be documented with JSDoc comments describing parameters, return value, and edge behavior.

#### Scenario: JSDoc on public formatters

- **GIVEN** any public formatter function (formatDate, formatNumber, formatCurrency, etc.)
- **WHEN** a developer reads the package source or generated docs
- **THEN** each function SHALL have JSDoc with @param and @returns (or equivalent) and SHALL note that null/undefined/invalid inputs return `''`
