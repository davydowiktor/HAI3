/**
 * useFormatters Hook - Locale-aware formatters
 *
 * Returns formatters that use i18nRegistry.getLanguage() internally.
 * Calls useTranslation() so the component re-renders when language changes.
 *
 * React Layer: L3
 */

import { useMemo } from 'react';
import {
  formatDate as formatDateFn,
  formatTime as formatTimeFn,
  formatDateTime as formatDateTimeFn,
  formatRelative as formatRelativeFn,
  formatNumber as formatNumberFn,
  formatPercent as formatPercentFn,
  formatCompact as formatCompactFn,
  formatCurrency as formatCurrencyFn,
  compareStrings as compareStringsFn,
  createCollator as createCollatorFn,
} from '@hai3/framework';
import type { UseFormattersReturn } from '../types';
import { useTranslation } from './useTranslation';

/**
 * Hook for accessing locale-aware formatters (date, number, currency, sort).
 *
 * Formatters use the current app language from i18nRegistry.getLanguage().
 * Re-renders when language changes via useTranslation() subscription.
 *
 * @returns Object with formatDate, formatTime, formatDateTime, formatRelative,
 *   formatNumber, formatPercent, formatCompact, formatCurrency, compareStrings, createCollator
 *
 * @example
 * ```tsx
 * const { formatDate, formatCurrency } = useFormatters();
 * return (
 *   <span>{formatDate(new Date(), 'short')}</span>
 *   <span>{formatCurrency(99.99, 'USD')}</span>
 * );
 * ```
 */
export function useFormatters(): UseFormattersReturn {
  // useTranslation() subscribes to language changes so this component re-renders
  // when language changes; formatters read i18nRegistry.getLanguage() at call time
  const { language } = useTranslation();

  return useMemo<UseFormattersReturn>(
    () => {
      void language; // re-run when language changes so formatters see new locale
      return {
        formatDate: formatDateFn,
        formatTime: formatTimeFn,
        formatDateTime: formatDateTimeFn,
        formatRelative: formatRelativeFn,
        formatNumber: formatNumberFn,
        formatPercent: formatPercentFn,
        formatCompact: formatCompactFn,
        formatCurrency: formatCurrencyFn,
        compareStrings: compareStringsFn,
        createCollator: createCollatorFn,
      };
    },
    [language]
  );
}
