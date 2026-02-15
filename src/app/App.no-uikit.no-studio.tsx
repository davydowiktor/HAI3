/**
 * HAI3 Application Component (Legacy Variant - No UIKit, No Studio)
 *
 * NOTE: This is a legacy template variant. The active App.tsx uses MFE system.
 * This variant still uses the legacy AppRouter pattern and needs migration to
 * MFE-based screen loading (see App.tsx for the MFE implementation).
 *
 * Minimal shell that renders the AppRouter for screen navigation.
 * No Layout wrapper is included when using --uikit none.
 * No StudioOverlay when --studio is false.
 *
 * HAI3Provider (in main.tsx) handles:
 * - Redux Provider setup
 * - HAI3 context (app instance)
 *
 * AppRouter handles:
 * - Screen lazy loading
 * - Navigation state
 *
 * Note: This template is for projects created with --uikit none.
 * User provides their own Layout components, UI kit, and theme system.
 */

import { AppRouter } from '@hai3/react';

function App() {
  return <AppRouter />;
}

export default App;
