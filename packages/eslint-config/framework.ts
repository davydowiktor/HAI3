/**
 * HAI3 ESLint Framework Configuration (L2)
 * Rules for @hai3/framework package
 *
 * Framework package CAN import:
 * - @hai3/state, @hai3/layout, @hai3/api, @hai3/i18n (SDK packages)
 *
 * Framework package CANNOT import:
 * - @hai3/react (would create circular dependency)
 * - @hai3/uikit, @hai3/uikit-contracts (UI layer)
 * - @hai3/uicore (deprecated)
 * - react, react-dom (framework is headless)
 */

import type { ConfigArray } from 'typescript-eslint';
import { baseConfig } from './base';

export const frameworkConfig: ConfigArray = [
  ...baseConfig,

  // Framework-specific restrictions
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@hai3/react'],
              message: 'FRAMEWORK VIOLATION: Framework cannot import @hai3/react (circular dependency).',
            },
            {
              group: ['@hai3/uikit', '@hai3/uikit/*'],
              message: 'FRAMEWORK VIOLATION: Framework cannot import @hai3/uikit. Framework is headless.',
            },
            {
              group: ['@hai3/uikit-contracts', '@hai3/uikit-contracts/*'],
              message: 'FRAMEWORK VIOLATION: Framework cannot import @hai3/uikit-contracts (deprecated).',
            },
            {
              group: ['@hai3/uicore', '@hai3/uicore/*'],
              message: 'FRAMEWORK VIOLATION: Framework cannot import @hai3/uicore (deprecated).',
            },
            {
              group: ['react', 'react-dom', 'react/*'],
              message: 'FRAMEWORK VIOLATION: Framework cannot import React. Framework is headless.',
            },
          ],
        },
      ],
    },
  },
];

export default frameworkConfig;
