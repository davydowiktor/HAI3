/**
 * Lifecycle Manager
 *
 * Abstract lifecycle manager interface and default implementation.
 * Manages lifecycle stage triggering for extensions and domains.
 *
 * @packageDocumentation
 * @internal
 */

import type { ExtensionDomain, Extension, ActionsChain } from '../types';
import type { ExtensionManager } from './extension-manager';

/**
 * Action chain executor function type.
 * Used by LifecycleManager to execute lifecycle hook actions chains.
 */
export type ActionChainExecutor = (chain: ActionsChain) => Promise<void>;

/**
 * Error handler function type.
 * Used to handle errors during lifecycle execution.
 */
export type ErrorHandler = (error: Error, context: Record<string, unknown>) => void;

/**
 * Lifecycle stage internal trigger function type.
 * Used for testing compatibility - allows tests to spy on internal method calls.
 */
export type LifecycleStageInternalTrigger = (
  entity: Extension | ExtensionDomain,
  stageId: string
) => Promise<void>;

/**
 * Abstract lifecycle manager for lifecycle stage triggering.
 *
 * This is the exportable abstraction that defines the contract for
 * lifecycle management. Concrete implementations encapsulate the
 * execution logic for lifecycle hooks.
 *
 * Key Responsibilities:
 * - Trigger lifecycle stages for extensions
 * - Trigger lifecycle stages for domains (all extensions)
 * - Trigger lifecycle stages for domains themselves
 * - Execute lifecycle hook action chains
 *
 * Key Benefits:
 * - Dependency Inversion: ScreensetsRegistry depends on abstraction
 * - Testability: Can inject mock managers for testing
 * - Encapsulation: Execution logic is hidden in concrete class
 */
export abstract class LifecycleManager {
  /**
   * Trigger a lifecycle stage for a specific extension.
   * Executes all lifecycle hooks registered for the given stage.
   *
   * @param extensionId - ID of the extension
   * @param stageId - ID of the lifecycle stage to trigger
   * @returns Promise resolving when all hooks have executed
   */
  abstract triggerLifecycleStage(extensionId: string, stageId: string): Promise<void>;

  /**
   * Trigger a lifecycle stage for all extensions in a domain.
   * Useful for custom stages like "refresh" that affect all widgets.
   *
   * @param domainId - ID of the domain
   * @param stageId - ID of the lifecycle stage to trigger
   * @returns Promise resolving when all hooks have executed
   */
  abstract triggerDomainLifecycleStage(domainId: string, stageId: string): Promise<void>;

  /**
   * Trigger a lifecycle stage for a domain itself.
   * Executes hooks registered on the domain entity.
   *
   * @param domainId - ID of the domain
   * @param stageId - ID of the lifecycle stage to trigger
   * @returns Promise resolving when all hooks have executed
   */
  abstract triggerDomainOwnLifecycleStage(domainId: string, stageId: string): Promise<void>;

  /**
   * Internal helper for triggering lifecycle stages on entities directly.
   * INTERNAL: Used by ScreensetsRegistry for test compatibility.
   *
   * @param entity - Extension or ExtensionDomain entity
   * @param stageId - ID of the lifecycle stage to trigger
   * @param skipCallback - If true, skip the callback and execute directly (used when called from registry shim)
   * @returns Promise resolving when all hooks have executed
   * @internal
   */
  abstract triggerLifecycleStageInternal(
    entity: Extension | ExtensionDomain,
    stageId: string,
    skipCallback?: boolean
  ): Promise<void>;
}

/**
 * Default lifecycle manager implementation.
 *
 * Executes lifecycle hooks by delegating to the action chain executor.
 *
 * @internal
 */
export class DefaultLifecycleManager extends LifecycleManager {
  /**
   * Extension manager for accessing extension and domain state.
   */
  private readonly extensionManager: ExtensionManager;

  /**
   * Action chain executor for executing lifecycle hook action chains.
   */
  private readonly executeActionsChain: ActionChainExecutor;

  /**
   * Error handler for handling errors during lifecycle execution.
   */
  private readonly errorHandler: ErrorHandler;

  /**
   * Optional callback for internal lifecycle stage triggering.
   * Used for testing compatibility - allows tests to spy on internal method calls.
   */
  private readonly internalTriggerCallback?: LifecycleStageInternalTrigger;

  constructor(
    extensionManager: ExtensionManager,
    executeActionsChain: ActionChainExecutor,
    errorHandler: ErrorHandler,
    internalTriggerCallback?: LifecycleStageInternalTrigger
  ) {
    super();
    this.extensionManager = extensionManager;
    this.executeActionsChain = executeActionsChain;
    this.errorHandler = errorHandler;
    this.internalTriggerCallback = internalTriggerCallback;
  }

  /**
   * Trigger a lifecycle stage for a specific extension.
   * Executes all lifecycle hooks registered for the given stage.
   *
   * @param extensionId - ID of the extension
   * @param stageId - ID of the lifecycle stage to trigger
   * @returns Promise resolving when all hooks have executed
   */
  async triggerLifecycleStage(extensionId: string, stageId: string): Promise<void> {
    const extensionState = this.extensionManager.getExtensionState(extensionId);
    if (!extensionState) {
      throw new Error(`Cannot trigger lifecycle stage: extension '${extensionId}' is not registered`);
    }

    // Call through callback if provided (for test compatibility)
    if (this.internalTriggerCallback) {
      await this.internalTriggerCallback(extensionState.extension, stageId);
    } else {
      await this.triggerLifecycleStageInternal(extensionState.extension, stageId);
    }
  }

  /**
   * Trigger a lifecycle stage for all extensions in a domain.
   * Useful for custom stages like "refresh" that affect all widgets.
   *
   * @param domainId - ID of the domain
   * @param stageId - ID of the lifecycle stage to trigger
   * @returns Promise resolving when all hooks have executed
   */
  async triggerDomainLifecycleStage(domainId: string, stageId: string): Promise<void> {
    const domainState = this.extensionManager.getDomainState(domainId);
    if (!domainState) {
      throw new Error(`Cannot trigger lifecycle stage: domain '${domainId}' is not registered`);
    }

    const extensionStates = this.extensionManager.getExtensionStatesForDomain(domainId);
    for (const extensionState of extensionStates) {
      // Call through callback if provided (for test compatibility)
      if (this.internalTriggerCallback) {
        await this.internalTriggerCallback(extensionState.extension, stageId);
      } else {
        await this.triggerLifecycleStageInternal(extensionState.extension, stageId);
      }
    }
  }

  /**
   * Trigger a lifecycle stage for a domain itself.
   * Executes hooks registered on the domain entity.
   *
   * @param domainId - ID of the domain
   * @param stageId - ID of the lifecycle stage to trigger
   * @returns Promise resolving when all hooks have executed
   */
  async triggerDomainOwnLifecycleStage(domainId: string, stageId: string): Promise<void> {
    const domainState = this.extensionManager.getDomainState(domainId);
    if (!domainState) {
      throw new Error(`Cannot trigger lifecycle stage: domain '${domainId}' is not registered`);
    }

    // Call through callback if provided (for test compatibility)
    if (this.internalTriggerCallback) {
      await this.internalTriggerCallback(domainState.domain, stageId);
    } else {
      await this.triggerLifecycleStageInternal(domainState.domain, stageId);
    }
  }

  /**
   * Internal helper for triggering lifecycle stages.
   * Collects hooks matching the stage and executes their actions chains in declaration order.
   *
   * INTERNAL: Made public for direct access from registry's test compatibility shim.
   *
   * @param entity - Extension or ExtensionDomain entity
   * @param stageId - ID of the lifecycle stage to trigger
   * @param skipCallback - If true, skip the callback and execute directly (used when called from registry shim)
   * @returns Promise resolving when all hooks have executed
   * @internal
   */
  async triggerLifecycleStageInternal(
    entity: Extension | ExtensionDomain,
    stageId: string,
    skipCallback = false
  ): Promise<void> {
    // If callback is set and we're not skipping it, use the callback for test compatibility
    if (!skipCallback && this.internalTriggerCallback) {
      return this.internalTriggerCallback(entity, stageId);
    }

    // Otherwise, execute the actual implementation
    return this.triggerLifecycleStageInternalImpl(entity, stageId);
  }

  /**
   * Actual implementation of lifecycle stage triggering.
   * This is the real logic, separated to avoid circular calls.
   * @private
   */
  private async triggerLifecycleStageInternalImpl(
    entity: Extension | ExtensionDomain,
    stageId: string
  ): Promise<void> {
    if (!entity.lifecycle) {
      return; // No hooks to execute
    }

    // Collect hooks matching the stage
    const hooks = entity.lifecycle.filter(hook => hook.stage === stageId);
    if (hooks.length === 0) {
      return; // No hooks for this stage
    }

    // Execute actions chains in declaration order
    for (const hook of hooks) {
      try {
        await this.executeActionsChain(hook.actions_chain);
      } catch (error) {
        // Log error but don't stop execution of remaining hooks
        this.errorHandler(
          error instanceof Error ? error : new Error(String(error)),
          { entityId: entity.id, stageId, hookStage: hook.stage }
        );
      }
    }
  }
}
