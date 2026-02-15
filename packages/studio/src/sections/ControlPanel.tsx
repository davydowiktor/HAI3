import React, { useState, useEffect } from 'react';
import { useNavigation, useTranslation } from '@hai3/react';
import { ThemeSelector } from './ThemeSelector';
import { ScreensetSelector, type ScreensetOption } from './ScreensetSelector';
import { LanguageSelector } from './LanguageSelector';
import { ApiModeToggle } from './ApiModeToggle';

// Legacy enum (inline definition for deprecated studio)
enum ScreensetCategory {
  Drafts = 'drafts',
  Mockups = 'mockups',
  Production = 'production',
}

/**
 * All possible screenset categories
 */
const ALL_CATEGORIES: ScreensetCategory[] = [ScreensetCategory.Drafts, ScreensetCategory.Mockups, ScreensetCategory.Production];

/**
 * Build screenset options for selector
 * Returns all categories, even if empty
 *
 * NOTE: Legacy screensetRegistry removed. This function now returns empty data.
 * The HAI3 Studio screenset selector is no longer functional with the MFE architecture.
 * MFE navigation uses extension presentation metadata instead.
 */
const buildScreensetOptions = (): ScreensetOption[] => {
  return ALL_CATEGORIES.map((category) => ({
    category,
    screensets: [],
  }));
};

export const ControlPanel: React.FC = () => {
  const { navigateToScreenset } = useNavigation();
  const [screensetOptions, setScreensetOptions] = useState<ScreensetOption[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const options = buildScreensetOptions();
    setScreensetOptions(options);
  }, []);

  // Build current value in "category:screensetId" format
  // NOTE: Legacy screensetRegistry removed - always returns empty string
  const getCurrentValue = (): string => {
    return '';
  };

  // Handle screenset selection - extract screensetId from "category:screensetId"
  const handleScreensetChange = (value: string): void => {
    const [, screensetId] = value.split(':');
    if (screensetId) {
      navigateToScreenset(screensetId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('studio:controls.heading')}
        </h3>

        <div className="space-y-3">
          {screensetOptions.length > 0 && (
            <ScreensetSelector
              options={screensetOptions}
              currentValue={getCurrentValue()}
              onChange={handleScreensetChange}
            />
          )}
          <ApiModeToggle />
          <ThemeSelector />
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
};

ControlPanel.displayName = 'ControlPanel';
