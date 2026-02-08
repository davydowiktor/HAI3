/**
 * Parent MFE Bridge Implementation
 *
 * Used by the parent runtime to manage child MFE instances.
 * Connects to ChildMfeBridge for bidirectional communication.
 *
 * @packageDocumentation
 */

import type { ParentMfeBridge } from '../handler/types';
import type { ActionsChain, SharedProperty } from '../types';
import type { ChainResult, ChainExecutionOptions } from '../mediator/types';
import type { ChildMfeBridgeImpl } from './ChildMfeBridge';

/**
 * Internal implementation of ParentMfeBridge.
 * Used by the host to manage a child MFE instance.
 */
export class ParentMfeBridgeImpl implements ParentMfeBridge {
  /**
   * Reference to the child bridge.
   */
  private readonly childBridge: ChildMfeBridgeImpl;

  /**
   * Handler for actions sent from child to parent.
   */
  private childActionHandler: ((chain: ActionsChain, options?: ChainExecutionOptions) => Promise<ChainResult>) | null = null;

  /**
   * Disposal state.
   */
  private disposed = false;

  /**
   * Property update subscribers - tracks callbacks registered in domain.propertySubscribers.
   * Maps propertyTypeId to the subscriber callback, so we can remove them on disposal.
   * INTERNAL: Set by bridge factory during creation.
   */
  private readonly propertySubscribers = new Map<string, (value: SharedProperty) => void>();

  constructor(childBridge: ChildMfeBridgeImpl) {
    this.childBridge = childBridge;
  }

  /**
   * Send an actions chain to the child MFE.
   * Used by the host to send actions to the MFE.
   *
   * Phase 19+ Implementation Required:
   * - Child MFE must register an action handler (currently not in MfeEntryLifecycle)
   * - Parent must have a way to deliver actions to child's handler
   * - This requires integration with the mediator or a new handler registration mechanism
   *
   * @param chain - Actions chain to send
   * @param _options - Optional execution options (reserved for future use)
   * @returns Promise resolving to chain result
   */
  async sendActionsChain(
    chain: ActionsChain,
    _options?: ChainExecutionOptions
  ): Promise<ChainResult> {
    if (this.disposed) {
      throw new Error('Bridge has been disposed');
    }
    // Phase 19+: Full implementation with action handler registration and delivery
    throw new Error(
      `ParentMfeBridge.sendActionsChain() is not yet implemented (Phase 19+). ` +
      `Action delivery to child MFE requires action handler registration mechanism. ` +
      `Action type: ${chain.action.type}`
    );
  }

  /**
   * Register a handler for actions sent from the child MFE to the host.
   * This is called by ScreensetsRegistry to connect the bridge to the mediator.
   *
   * @param callback - Handler for child actions
   */
  onChildAction(
    callback: (chain: ActionsChain, options?: ChainExecutionOptions) => Promise<ChainResult>
  ): void {
    if (this.disposed) {
      throw new Error('Bridge has been disposed');
    }
    this.childActionHandler = callback;
  }

  /**
   * Called by ScreensetsRegistry when a domain property is updated.
   * Forwards the update to the child bridge.
   *
   * @param propertyTypeId - Type ID of the property
   * @param value - New property value
   */
  receivePropertyUpdate(propertyTypeId: string, value: unknown): void {
    if (this.disposed) {
      return; // Silently ignore updates after disposal
    }
    const sharedProperty: SharedProperty = { id: propertyTypeId, value };
    this.childBridge.receivePropertyUpdate(propertyTypeId, sharedProperty);
  }

  /**
   * Register a property subscriber that was added to domain.propertySubscribers.
   * INTERNAL: Called by bridge factory during setup.
   * Tracked so we can remove it from domain.propertySubscribers on disposal.
   *
   * @param propertyTypeId - Property type ID
   * @param subscriber - Subscriber callback
   */
  registerPropertySubscriber(
    propertyTypeId: string,
    subscriber: (value: SharedProperty) => void
  ): void {
    this.propertySubscribers.set(propertyTypeId, subscriber);
  }

  /**
   * Get all registered property subscribers for cleanup.
   * INTERNAL: Called by bridge factory during disposal to remove subscribers from domain.
   *
   * @returns Map of propertyTypeId to subscriber callbacks
   */
  getPropertySubscribers(): Map<string, (value: SharedProperty) => void> {
    return this.propertySubscribers;
  }

  /**
   * Dispose the bridge and clean up resources.
   * NOTE: This does NOT remove property subscribers from domain.propertySubscribers.
   * The bridge factory must handle that cleanup using getPropertySubscribers().
   */
  dispose(): void {
    if (this.disposed) {
      return; // Idempotent
    }
    this.disposed = true;
    this.childActionHandler = null;
    this.propertySubscribers.clear();
    this.childBridge.cleanup();
  }

  /**
   * INTERNAL: Called by ChildMfeBridge.sendActionsChain.
   * Routes child actions to the registered handler (typically the mediator).
   *
   * @param chain - Actions chain from child
   * @param options - Optional execution options
   * @returns Promise resolving to chain result
   */
  handleChildAction(
    chain: ActionsChain,
    options?: ChainExecutionOptions
  ): Promise<ChainResult> {
    if (this.disposed) {
      return Promise.reject(new Error('Bridge has been disposed'));
    }
    if (!this.childActionHandler) {
      return Promise.reject(new Error('No child action handler registered'));
    }
    return this.childActionHandler(chain, options);
  }
}
