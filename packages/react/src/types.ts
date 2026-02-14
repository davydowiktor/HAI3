/**
 * @hai3/react - Type Definitions
 *
 * Core types for HAI3 React bindings.
 * Provides type-safe hooks and components.
 *
 * Now using real imports from @hai3/framework since packages are built together.
 */

import type { ReactNode } from 'react';
import type {
  HAI3Config,
  HAI3App,
  RootState,
  Language,
  MenuItemConfig,
  ScreensetDefinition,
  ScreensetCategory,
  Formatters,
} from '@hai3/framework';
import type { MfeContextValue } from './mfe/MfeContext';

// Re-export imported types for convenience
export type { HAI3Config, HAI3App, MenuItemConfig, ScreensetDefinition, ScreensetCategory };

// ============================================================================
// Type Aliases
// ============================================================================

// From @hai3/store
type Selector<TResult, TState = RootState> = (state: TState) => TResult;

// Language is imported from @hai3/framework
type TranslationParams = Record<string, string | number | boolean>;

// ============================================================================
// HAI3 Provider Props
// ============================================================================

/**
 * Router configuration type
 */
export type RouterType = 'browser' | 'hash' | 'memory';

/**
 * Router configuration
 */
export interface RouterConfig {
  /** Router type - browser (default), hash, or memory */
  type?: RouterType;
  /** Auto-navigate to first screen on load (default: true) */
  autoNavigate?: boolean;
}

/**
 * HAI3 Provider Props
 * Props for the main HAI3Provider component.
 *
 * @example
 * ```tsx
 * <HAI3Provider config={{ devMode: true }}>
 *   <App />
 * </HAI3Provider>
 *
 * // With router configuration
 * <HAI3Provider router={{ type: 'hash' }}>
 *   <App />
 * </HAI3Provider>
 *
 * // With MFE bridge (for MFE components)
 * <HAI3Provider mfeBridge={{ bridge, extensionId, domainId }}>
 *   <MyMfeApp />
 * </HAI3Provider>
 * ```
 */
export interface HAI3ProviderProps {
  /** Child components */
  children: ReactNode;
  /** HAI3 configuration */
  config?: HAI3Config;
  /** Pre-built HAI3 app instance (optional) */
  app?: HAI3App;
  /** Router configuration */
  router?: RouterConfig;
  /** MFE bridge context (for MFE components) */
  mfeBridge?: MfeContextValue;
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * useHAI3 Hook Return Type
 * Returns the HAI3 app instance from context.
 */
export type UseHAI3Return = HAI3App;

/**
 * useAppSelector Hook
 * Type-safe selector hook for Redux state.
 *
 * @template TResult - The result type of the selector
 */
export type UseAppSelector = <TResult>(selector: Selector<TResult>) => TResult;

/**
 * useAppDispatch Hook Return Type
 * Returns the typed dispatch function.
 */
export type UseAppDispatchReturn = (action: unknown) => unknown;

/**
 * useTranslation Hook Return Type
 * Translation utilities.
 */
export interface UseTranslationReturn {
  /** Translate a key */
  t: (key: string, params?: TranslationParams) => string;
  /** Current language */
  language: Language | null;
  /** Change language */
  setLanguage: (language: Language) => Promise<void>;
  /** Check if current language is RTL */
  isRTL: boolean;
}

/**
 * useScreenTranslations Hook Return Type
 * Screen-level translation loading state.
 */
export interface UseScreenTranslationsReturn {
  /** Whether translations are loaded */
  isLoaded: boolean;
  /** Loading error (if any) */
  error: Error | null;
}

/**
 * useTheme Hook Return Type
 * Theme utilities.
 */
export interface UseThemeReturn {
  /** Current theme ID */
  currentTheme: string | undefined;
  /** All available themes */
  themes: Array<{ id: string; name: string }>;
  /** Change theme */
  setTheme: (themeId: string) => void;
}

/**
 * useFormatters Hook Return Type
 * Locale-aware formatters (locale from i18nRegistry.getLanguage()).
 * References @hai3/i18n Formatters so signatures stay in sync.
 */
export type UseFormattersReturn = Formatters;

/**
 * useNavigation Hook Return Type
 * Navigation utilities.
 */
export interface UseNavigationReturn {
  /** Navigate to a screen, optionally with route params */
  navigateToScreen: (screensetId: string, screenId: string, params?: Record<string, string>) => void;
  /** Navigate to a screenset (uses default screen) */
  navigateToScreenset: (screensetId: string) => void;
  /** Current screenset ID */
  currentScreenset: string | null;
  /** Current screen ID */
  currentScreen: string | null;
}

// ============================================================================
// App Router Props
// ============================================================================

/**
 * App Router Props
 * Props for the AppRouter component.
 */
export interface AppRouterProps {
  /** Fallback component while loading */
  fallback?: ReactNode;
  /** Error boundary fallback */
  errorFallback?: ReactNode | ((error: Error) => ReactNode);
}
