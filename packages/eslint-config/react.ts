/**
 * HAI3 ESLint React Configuration (L3)
 * Rules for @hai3/react package
 *
 * React package CAN import:
 * - @hai3/framework (wires everything together)
 * - react, react-dom (React adapter)
 *
 * React package CANNOT import:
 * - @hai3/state, @hai3/layout, @hai3/api, @hai3/i18n (use framework re-exports)
 * - @hai3/uikit-contracts (deprecated)
 * - @hai3/uicore (deprecated)
 */

import type { ConfigArray } from 'typescript-eslint';
import { baseConfig } from './base';
import reactHooks from 'eslint-plugin-react-hooks';

export const reactConfig: ConfigArray = [
  ...baseConfig,

  // React hooks rules
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
    },
  },

  // React package-specific restrictions
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@hai3/state', '@hai3/state/*'],
              message: 'REACT VIOLATION: Import from @hai3/framework instead. React package uses framework re-exports.',
            },
            {
              group: ['@hai3/layout', '@hai3/layout/*'],
              message: 'REACT VIOLATION: Import from @hai3/framework instead. React package uses framework re-exports.',
            },
            {
              group: ['@hai3/api', '@hai3/api/*'],
              message: 'REACT VIOLATION: Import from @hai3/framework instead. React package uses framework re-exports.',
            },
            {
              group: ['@hai3/i18n', '@hai3/i18n/*'],
              message: 'REACT VIOLATION: Import from @hai3/framework instead. React package uses framework re-exports.',
            },
            {
              group: ['@hai3/uikit-contracts', '@hai3/uikit-contracts/*'],
              message: 'REACT VIOLATION: @hai3/uikit-contracts is deprecated.',
            },
            {
              group: ['@hai3/uicore', '@hai3/uicore/*'],
              message: 'REACT VIOLATION: @hai3/uicore is deprecated. Use @hai3/framework and @hai3/react.',
            },
          ],
        },
      ],
    },
  },
];

export default reactConfig;
