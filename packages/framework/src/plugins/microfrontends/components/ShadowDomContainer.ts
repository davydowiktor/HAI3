/**
 * Shadow DOM Container
 *
 * Vanilla DOM-based Shadow DOM container for MFE style isolation.
 * Framework-agnostic - no React dependencies.
 *
 * Uses Shadow DOM utilities from @hai3/screensets (Phase 16).
 *
 * NOTE: React-based ShadowDomContainer should be implemented in @hai3/react (Phase 14).
 */

import { createShadowRoot, injectCssVariables } from '@hai3/screensets';

/**
 * Shadow DOM Container configuration
 */
export interface ShadowDomContainerConfig {
  /** Host element to attach shadow root to */
  hostElement: HTMLElement;
  /** CSS mode for shadow DOM */
  mode?: 'open' | 'closed';
  /** CSS variables to inject (optional) */
  cssVariables?: Record<string, string>;
}

/**
 * Shadow DOM Container class.
 *
 * Creates and manages a shadow root for MFE rendering with style isolation.
 * Provides CSS variable passthrough for theme integration.
 * Uses Shadow DOM utilities from @hai3/screensets (Phase 16).
 *
 * @example
 * ```typescript
 * const container = new ShadowDomContainer({
 *   hostElement: document.getElementById('mfe-host'),
 *   mode: 'open',
 *   cssVariables: {
 *     '--primary-color': '#007bff',
 *     '--font-family': 'Arial, sans-serif'
 *   }
 * });
 *
 * container.create();
 *
 * // Render MFE content into shadow root
 * const shadowRoot = container.getShadowRoot();
 * shadowRoot.innerHTML = '<div>MFE Content</div>';
 *
 * // Later cleanup
 * container.destroy();
 * ```
 */
export class ShadowDomContainer {
  private hostElement: HTMLElement;
  private mode: 'open' | 'closed';
  private cssVariables: Record<string, string>;
  private shadowRoot: ShadowRoot | null = null;

  constructor(config: ShadowDomContainerConfig) {
    this.hostElement = config.hostElement;
    this.mode = config.mode ?? 'open';
    this.cssVariables = config.cssVariables ?? {};
  }

  /**
   * Create the shadow root and inject CSS variables.
   * Uses createShadowRoot() from @hai3/screensets.
   */
  public create(): ShadowRoot {
    if (this.shadowRoot) {
      return this.shadowRoot;
    }

    // Create shadow root using utility from @hai3/screensets
    this.shadowRoot = createShadowRoot(this.hostElement, { mode: this.mode });

    // Inject CSS variables
    this.injectCssVariablesInternal();

    return this.shadowRoot;
  }

  /**
   * Inject CSS variables into shadow root.
   * Uses injectCssVariables() from @hai3/screensets.
   */
  private injectCssVariablesInternal(): void {
    if (!this.shadowRoot) return;

    injectCssVariables(this.shadowRoot, this.cssVariables);
  }

  /**
   * Update CSS variables.
   * Useful for theme changes.
   * Uses injectCssVariables() from @hai3/screensets.
   */
  public updateCssVariables(cssVariables: Record<string, string>): void {
    this.cssVariables = { ...this.cssVariables, ...cssVariables };
    if (this.shadowRoot) {
      this.injectCssVariablesInternal();
    }
  }

  /**
   * Get the shadow root instance.
   * Returns null if not yet created.
   */
  public getShadowRoot(): ShadowRoot | null {
    return this.shadowRoot;
  }

  /**
   * Check if shadow root exists.
   */
  public isCreated(): boolean {
    return this.shadowRoot !== null;
  }

  /**
   * Clean up and remove shadow root.
   */
  public destroy(): void {
    if (this.shadowRoot && this.hostElement.shadowRoot === this.shadowRoot) {
      // Shadow roots cannot be removed, but we can clear content
      this.shadowRoot.innerHTML = '';
      this.shadowRoot = null;
    }
  }
}
