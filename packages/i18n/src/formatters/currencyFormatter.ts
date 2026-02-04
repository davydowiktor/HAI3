/**
 * Currency formatter - Locale-aware currency formatting
 *
 * Uses i18nRegistry.getLanguage() for locale; fallback to Language.English when null.
 * null, undefined, and NaN return ''.
 */

import { getLocale, toNumber } from './utils';

/**
 * Format a value as currency for the given currency code.
 *
 * @param value - Numeric amount
 * @param currencyCode - ISO 4217 currency code (e.g. 'USD', 'EUR')
 * @returns Formatted currency string, or '' if value is null, undefined, or NaN
 */
export function formatCurrency(
  value: number | null | undefined,
  currencyCode: string
): string {
  const n = toNumber(value);
  if (n === null) return '';
  const locale = getLocale();
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(n);
}
