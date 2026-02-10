/**
 * Event Emitter
 *
 * Abstract event emitter interface and default implementation.
 * Manages event subscription and emission for the MFE runtime.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Abstract event emitter for registry events.
 *
 * This is the exportable abstraction that defines the contract for
 * event management. Concrete implementations encapsulate the storage
 * and notification mechanism.
 *
 * Key Benefits:
 * - Dependency Inversion: Components depend on abstraction, not concrete implementation
 * - Testability: Can inject mock emitters for testing
 * - Encapsulation: Storage mechanism is hidden in concrete class
 */
export abstract class EventEmitter {
  /**
   * Subscribe to an event.
   *
   * @param event - Event name
   * @param callback - Callback function
   */
  abstract on(event: string, callback: (data: Record<string, unknown>) => void): void;

  /**
   * Unsubscribe from an event.
   *
   * @param event - Event name
   * @param callback - Callback function
   */
  abstract off(event: string, callback: (data: Record<string, unknown>) => void): void;

  /**
   * Emit an event to all subscribers.
   *
   * @param event - Event name
   * @param data - Event data
   * @param errorHandler - Optional error handler for callback errors
   */
  abstract emit(
    event: string,
    data: Record<string, unknown>,
    errorHandler?: (error: Error, context: Record<string, unknown>) => void
  ): void;
}

/**
 * Default event emitter implementation.
 *
 * Uses a Map to store event listeners keyed by event name.
 * Each event has a Set of callback functions.
 *
 * @internal
 */
export class DefaultEventEmitter extends EventEmitter {
  /**
   * Event listeners keyed by event name.
   */
  private readonly eventListeners = new Map<string, Set<(data: Record<string, unknown>) => void>>();

  /**
   * Subscribe to an event.
   *
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: string, callback: (data: Record<string, unknown>) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from an event.
   *
   * @param event - Event name
   * @param callback - Callback function
   */
  off(event: string, callback: (data: Record<string, unknown>) => void): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Emit an event to all subscribers.
   *
   * @param event - Event name
   * @param data - Event data
   * @param errorHandler - Optional error handler for callback errors
   */
  emit(
    event: string,
    data: Record<string, unknown>,
    errorHandler?: (error: Error, context: Record<string, unknown>) => void
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          if (errorHandler) {
            errorHandler(error instanceof Error ? error : new Error(String(error)), { event, data });
          }
        }
      }
    }
  }

  /**
   * Clear all event listeners.
   * Called during disposal to cleanup internal state.
   */
  clear(): void {
    this.eventListeners.clear();
  }
}
