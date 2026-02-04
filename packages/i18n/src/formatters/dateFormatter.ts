/**
 * Date formatter - Locale-aware date and time formatting
 *
 * Uses i18nRegistry.getLanguage() for locale; fallback to Language.English when null.
 * Invalid date inputs return ''.
 */

import { getLocale } from './utils';

export type DateFormatStyle = 'short' | 'medium' | 'long' | 'full';
export type TimeFormatStyle = 'short' | 'medium';

export type DateInput = Date | number | string;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined) return null;
  const d = new Date(value as Date);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date according to the current locale.
 *
 * @param date - Date, timestamp, or ISO string
 * @param format - 'short' | 'medium' | 'long' | 'full'
 * @returns Formatted date string, or '' if input is invalid
 */
export function formatDate(date: DateInput, format: DateFormatStyle): string {
  const d = toDate(date);
  if (!d) return '';
  const locale = getLocale();
  return new Intl.DateTimeFormat(locale, { dateStyle: format }).format(d);
}

/**
 * Format the time portion of a date according to the current locale.
 *
 * @param date - Date, timestamp, or ISO string
 * @param format - 'short' | 'medium'
 * @returns Formatted time string, or '' if input is invalid
 */
export function formatTime(date: DateInput, format: TimeFormatStyle): string {
  const d = toDate(date);
  if (!d) return '';
  const locale = getLocale();
  return new Intl.DateTimeFormat(locale, { timeStyle: format }).format(d);
}

/**
 * Format date and time according to the current locale.
 *
 * @param date - Date, timestamp, or ISO string
 * @param dateFormat - Date style: 'short' | 'medium' | 'long' | 'full'
 * @param timeFormat - Time style: 'short' | 'medium'
 * @returns Formatted date-time string, or '' if input is invalid
 */
export function formatDateTime(
  date: DateInput,
  dateFormat: DateFormatStyle,
  timeFormat: TimeFormatStyle
): string {
  const d = toDate(date);
  if (!d) return '';
  const locale = getLocale();
  return new Intl.DateTimeFormat(locale, {
    dateStyle: dateFormat,
    timeStyle: timeFormat,
  }).format(d);
}

const RELATIVE_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; max: number; ms: number }> = [
  { unit: 'second', max: 60, ms: 1000 },
  { unit: 'minute', max: 60, ms: 60 * 1000 },
  { unit: 'hour', max: 24, ms: 60 * 60 * 1000 },
  { unit: 'day', max: 30, ms: 24 * 60 * 60 * 1000 },
  { unit: 'month', max: 12, ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'year', max: Infinity, ms: 365 * 24 * 60 * 60 * 1000 },
];

function getRelativeUnit(diffMs: number): { value: number; unit: Intl.RelativeTimeFormatUnit } {
  const abs = Math.abs(diffMs);
  for (const { unit, max, ms } of RELATIVE_UNITS) {
    const value = Math.floor(abs / ms);
    if (value < max) return { value: diffMs < 0 ? -value : value, unit };
  }
  const value = Math.floor(abs / RELATIVE_UNITS[RELATIVE_UNITS.length - 1].ms);
  return {
    value: diffMs < 0 ? -value : value,
    unit: 'year',
  };
}

/**
 * Format a date as relative time (e.g. "2 hours ago", "in 3 days").
 *
 * @param date - Date, timestamp, or ISO string
 * @param base - Reference date for "now"; defaults to new Date()
 * @returns Relative time string, or '' if input is invalid
 */
export function formatRelative(date: DateInput, base?: DateInput): string {
  const d = toDate(date);
  if (!d) return '';
  const baseDate = base !== undefined ? toDate(base) : new Date();
  if (!baseDate) return '';
  const diffMs = d.getTime() - baseDate.getTime();
  const locale = getLocale();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const { value, unit } = getRelativeUnit(diffMs);
  return rtf.format(value, unit);
}
