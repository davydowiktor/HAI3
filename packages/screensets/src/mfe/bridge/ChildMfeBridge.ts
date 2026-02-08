/**
 * Child MFE Bridge Implementation
 *
 * Provides the bridge interface given TO child MFEs for communication with the host.
 * This is the MFE's primary interface for accessing shared properties and sending actions.
 *
 * @packageDocumentation
 */

import type { ChildMfeBridge } from '../handler/types';
import type { SharedProperty, ActionsChain } from '../types';
import type { ChainResult, ChainExecutionOptions } from '../mediator/types';

/**
 * Internal implementation of ChildMfeBridge.
 * This class is given to child MFEs for host communication.
 */
export class ChildMfeBridgeImpl implements ChildMfeBridge {
  readonly domainId: string;
  readonly entryTypeId: string;
  readonly instanceId: string;

  /**
   * Internal: property subscriptions.
   * Maps propertyTypeId to callbacks.
   */
  private readonly propertySubscribers = new Map<string, Set<(value: SharedProperty) => void>>();

  /**
   * Internal: all-properties subscribers.
   */
  private readonly allPropertySubscribers = new Set<(propertyTypeId: string, value: SharedProperty) => void>();

  /**
   * Internal: current property values (populated from domain state).
   */
  private readonly properties = new Map<string, SharedProperty>();

  /**
   * Internal: reference to parent bridge for action chain forwarding.
   */
  private parentBridge: import('./ParentMfeBridge').ParentMfeBridgeImpl | null = null;

  constructor(
    domainId: string,
    entryTypeId: string,
    instanceId: string
  ) {
    this.domainId = domainId;
    this.entryTypeId = entryTypeId;
    this.instanceId = instanceId;
  }

  /**
   * Send an actions chain to the host domain.
   * Forwards to parent bridge's child action handler.
   *
   * @param chain - Actions chain to send
   * @param options - Optional execution options
   * @returns Promise resolving to chain result
   */
  async sendActionsChain(
    chain: ActionsChain,
    options?: ChainExecutionOptions
  ): Promise<ChainResult> {
    if (!this.parentBridge) {
      throw new Error(`Bridge not connected for instance '${this.instanceId}'`);
    }
    return this.parentBridge.handleChildAction(chain, options);
  }

  /**
   * Subscribe to a specific property's updates.
   *
   * @param propertyTypeId - Type ID of the property to subscribe to
   * @param callback - Callback to invoke when property updates
   * @returns Unsubscribe function
   */
  subscribeToProperty(
    propertyTypeId: string,
    callback: (value: SharedProperty) => void
  ): () => void {
    let subscribers = this.propertySubscribers.get(propertyTypeId);
    if (!subscribers) {
      subscribers = new Set();
      this.propertySubscribers.set(propertyTypeId, subscribers);
    }
    subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      subscribers?.delete(callback);
      if (subscribers && subscribers.size === 0) {
        this.propertySubscribers.delete(propertyTypeId);
      }
    };
  }

  /**
   * Get a property's current value synchronously.
   *
   * @param propertyTypeId - Type ID of the property to get
   * @returns Current property value, or undefined if not set
   */
  getProperty(propertyTypeId: string): SharedProperty | undefined {
    return this.properties.get(propertyTypeId);
  }

  /**
   * Subscribe to all property updates.
   *
   * @param callback - Callback to invoke for any property update
   * @returns Unsubscribe function
   */
  subscribeToAllProperties(
    callback: (propertyTypeId: string, value: SharedProperty) => void
  ): () => void {
    this.allPropertySubscribers.add(callback);
    return () => {
      this.allPropertySubscribers.delete(callback);
    };
  }

  /**
   * INTERNAL: Called by ParentMfeBridge when domain property changes.
   *
   * @param propertyTypeId - Type ID of the property that changed
   * @param value - New property value
   */
  receivePropertyUpdate(propertyTypeId: string, value: SharedProperty): void {
    this.properties.set(propertyTypeId, value);

    // Notify property-specific subscribers
    const propertySubscribers = this.propertySubscribers.get(propertyTypeId);
    if (propertySubscribers) {
      for (const callback of propertySubscribers) {
        try {
          callback(value);
        } catch (error) {
          // Swallow errors from subscribers - don't let them break the bridge
          console.error(`Error in property subscriber for '${propertyTypeId}':`, error);
        }
      }
    }

    // Notify all-property subscribers
    for (const callback of this.allPropertySubscribers) {
      try {
        callback(propertyTypeId, value);
      } catch (error) {
        console.error(`Error in all-property subscriber for '${propertyTypeId}':`, error);
      }
    }
  }

  /**
   * INTERNAL: Connect this child bridge to its parent bridge.
   *
   * @param parent - Parent bridge instance
   */
  setParentBridge(parent: import('./ParentMfeBridge').ParentMfeBridgeImpl): void {
    this.parentBridge = parent;
  }

  /**
   * INTERNAL: Cleanup method called by bridge factory.
   */
  cleanup(): void {
    this.propertySubscribers.clear();
    this.allPropertySubscribers.clear();
    this.properties.clear();
    this.parentBridge = null;
  }
}
