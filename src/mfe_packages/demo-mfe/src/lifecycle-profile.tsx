import React from 'react';
import type { ChildMfeBridge } from '@cyberfabric/react';
import { ThemeAwareReactLifecycle } from './shared/ThemeAwareReactLifecycle';
import { ProfileScreen } from './screens/profile/ProfileScreen';
import { fetchUser } from './actions/profileActions';
import { DEMO_ACTION_REFRESH_PROFILE } from './shared/extension-ids';

// @cpt-FEATURE:child-bridge-action-handler:p3

/**
 * Handles extension-targeted actions for the Profile screen.
 *
 * The mediator routes actions whose target matches the Profile extension ID to this
 * handler. Routing by extension ID (rather than domain ID) is what allows the host to
 * address a specific child MFE rather than the domain it happens to occupy.
 *
 * Implements the ActionHandler interface (from @cyberfabric/screensets) structurally —
 * the bridge's registerActionHandler() enforces the contract at the call site.
 */
// @cpt-begin:child-bridge-action-handler:p3:inst-1
class ProfileActionHandler {
  async handleAction(actionTypeId: string, _payload: Record<string, never> | undefined): Promise<void> {
    if (actionTypeId === DEMO_ACTION_REFRESH_PROFILE) {
      fetchUser();
      return;
    }
    // Unknown action types are intentionally ignored — the mediator should not
    // route actions here that this handler didn't advertise, but being lenient
    // avoids breaking an entire chain over an unexpected type ID.
    console.warn(`[ProfileActionHandler] Unhandled action type: ${actionTypeId}`);
  }
}
// @cpt-end:child-bridge-action-handler:p3:inst-1

class ProfileLifecycle extends ThemeAwareReactLifecycle {
  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    return <ProfileScreen bridge={bridge} />;
  }

  // @cpt-begin:child-bridge-action-handler:p3:inst-2
  override mount(container: Element | ShadowRoot, bridge: ChildMfeBridge): void {
    // Let the base class render the React tree first so the screen is visible
    // before any action can arrive.
    super.mount(container, bridge);
    // Register after rendering so that any synchronous action dispatched in the
    // chained next step finds the handler already in place.
    bridge.registerActionHandler(new ProfileActionHandler());
  }
  // @cpt-end:child-bridge-action-handler:p3:inst-2
}

/**
 * Export a singleton instance of the lifecycle class.
 * Module Federation expects a default export; the handler calls
 * moduleFactory() which returns this module, then validates it
 * has mount/unmount methods.
 */
export default new ProfileLifecycle();
