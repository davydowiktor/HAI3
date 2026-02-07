/**
 * MFE Error Handling Utilities
 *
 * Provides fallback UI rendering and error recovery mechanisms.
 *
 * @packageDocumentation
 */

import {
  MfeError,
  MfeLoadError,
  ContractValidationError,
  ChainExecutionError,
} from './index';

/**
 * Error handler configuration.
 */
export interface ErrorHandlerConfig {
  /** Whether to show detailed error messages (default: false in production) */
  showDetails?: boolean;
  /** Custom error renderer */
  customRenderer?: (error: MfeError, container: Element) => void;
}

/**
 * Error handler for MFE failures.
 * Renders fallback UI and logs errors with context.
 */
export class MfeErrorHandler {
  private readonly config: ErrorHandlerConfig;

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      showDetails: config.showDetails ?? false,
      customRenderer: config.customRenderer,
    };
  }

  /**
   * Render fallback UI for a load failure.
   */
  renderLoadFailure(error: MfeError, container: Element): void {
    if (this.config.customRenderer) {
      this.config.customRenderer(error, container);
      return;
    }

    const fallbackDiv = document.createElement('div');
    fallbackDiv.style.cssText = `
      padding: 16px;
      border: 1px solid #dc2626;
      border-radius: 4px;
      background-color: #fef2f2;
      color: #991b1b;
    `;

    if (error instanceof MfeLoadError) {
      fallbackDiv.innerHTML = `
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
          Failed to load extension
        </h3>
        <p style="margin: 0; font-size: 12px;">
          The requested extension could not be loaded.
          ${this.config.showDetails ? `<br/><br/>Type ID: ${error.entryTypeId}` : ''}
          ${this.config.showDetails && error.cause ? `<br/>Cause: ${error.cause.message}` : ''}
        </p>
      `;
    } else if (error instanceof ContractValidationError) {
      const errorsList = error.errors
        .map((e) => `<li>${e.type}: ${e.details}</li>`)
        .join('');
      fallbackDiv.innerHTML = `
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
          Contract validation failed
        </h3>
        <p style="margin: 0 0 8px 0; font-size: 12px;">
          The extension does not satisfy the required contract.
        </p>
        ${this.config.showDetails ? `<ul style="margin: 0; font-size: 11px; padding-left: 20px;">${errorsList}</ul>` : ''}
      `;
    } else {
      fallbackDiv.innerHTML = `
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
          An error occurred
        </h3>
        <p style="margin: 0; font-size: 12px;">
          ${this.config.showDetails ? error.message : 'Please try again later.'}
        </p>
      `;
    }

    container.innerHTML = '';
    container.appendChild(fallbackDiv);
  }

  /**
   * Log an action handler error with context.
   */
  logActionHandlerError(error: ChainExecutionError): void {
    console.error('[MFE Action Handler Error]', {
      code: error.code,
      failedAction: error.failedAction.type,
      executedPath: error.executedPath,
      message: error.message,
      cause: error.cause,
    });
  }

  /**
   * Log a contract validation error with type ID context.
   */
  logContractValidationError(error: ContractValidationError): void {
    console.error('[MFE Contract Validation Error]', {
      code: error.code,
      entryTypeId: error.entryTypeId,
      domainTypeId: error.domainTypeId,
      errors: error.errors,
    });
  }

  /**
   * Log a generic MFE error.
   */
  logError(error: MfeError): void {
    console.error('[MFE Error]', {
      code: error.code,
      name: error.name,
      message: error.message,
    });
  }
}

/**
 * Retry utility for MFE operations.
 */
export class RetryHandler {
  /**
   * Retry an async operation with exponential backoff.
   *
   * @param operation - Operation to retry
   * @param maxRetries - Maximum number of retries (default: 3)
   * @param initialDelay - Initial delay in ms (default: 1000)
   * @returns Result of the operation
   */
  async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          await this.delay(delay);
        }
      }
    }

    throw lastError ?? new Error('Operation failed after retries');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
