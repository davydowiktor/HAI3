/**
 * Shared formatter utilities - locale and value coercion used by formatters.
 */

import { i18nRegistry } from '../I18nRegistry';
import { Language } from '../types';

export function getLocale(): string {
  return i18nRegistry.getLanguage() ?? Language.English;
}

export function toNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
