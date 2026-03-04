import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { MfeEntryLifecycle, ChildMfeBridge, SharedProperty } from '@hai3/react';
import { HAI3_SHARED_PROPERTY_THEME, HAI3Provider } from '@hai3/react';
import { applyThemeToShadowRoot } from '@hai3/uikit';
import { resolveTheme } from './themes';
import { mfeApp } from '../init';

/**
 * Abstract base class for React-based MFE lifecycle implementations with theme awareness.
 *
 * This class implements the common pattern shared by all theme-aware MFE lifecycles:
 * - Shadow root detection
 * - Initial theme application
 * - Theme change subscription
 * - React root creation and rendering (wrapped in HAI3Provider)
 * - Cleanup on unmount
 *
 * Concrete subclasses must provide:
 * - `initializeStyles(container)` - screen-specific Tailwind utilities
 * - `renderContent(bridge)` - returns the React content to render (without calling root.render directly)
 *
 * The mount sequence prevents FOUC (Flash of Unstyled Content) by ensuring
 * theme CSS variables exist before React renders the first time.
 *
 * @packageDocumentation
 */
export abstract class ThemeAwareReactLifecycle implements MfeEntryLifecycle<ChildMfeBridge> {
  private root: Root | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private unsubscribeTheme: (() => void) | null = null;

  mount(container: Element | ShadowRoot, bridge: ChildMfeBridge): void {
    // Step 1: Store shadow root reference safely
    this.shadowRoot = container instanceof ShadowRoot ? container : null;

    // Step 2: Adopt host document styles into shadow root so Tailwind + uikit CSS apply
    if (this.shadowRoot) {
      this.adoptHostStylesIntoShadowRoot(this.shadowRoot);
    }

    // Step 3: Initialize base styles (Tailwind utilities, NO CSS variables)
    this.initializeStyles(container);

    // Step 4: Read initial theme ID from bridge
    const initialProperty = bridge.getProperty(HAI3_SHARED_PROPERTY_THEME);

    // Step 5: Apply initial theme via applyThemeToShadowRoot
    if (initialProperty && typeof initialProperty.value === 'string' && this.shadowRoot) {
      const theme = resolveTheme(initialProperty.value);
      if (theme) {
        applyThemeToShadowRoot(this.shadowRoot, theme, initialProperty.value);
      }
    }

    // Step 6: Subscribe to future theme changes
    this.unsubscribeTheme = bridge.subscribeToProperty(
      HAI3_SHARED_PROPERTY_THEME,
      (property: SharedProperty) => {
        if (this.shadowRoot && typeof property.value === 'string') {
          const theme = resolveTheme(property.value);
          if (theme) {
            applyThemeToShadowRoot(this.shadowRoot, theme, property.value);
          }
        }
      }
    );

    // Step 7: Create React root AFTER theme vars exist
    this.root = createRoot(container);

    // Step 8: Render with HAI3Provider wrapping
    this.root.render(
      <HAI3Provider app={mfeApp}>
        {this.renderContent(bridge)}
      </HAI3Provider>
    );
  }

  unmount(_container: Element | ShadowRoot): void {
    // Unsubscribe from theme changes
    if (this.unsubscribeTheme) {
      this.unsubscribeTheme();
      this.unsubscribeTheme = null;
    }

    // Clear shadow root reference
    this.shadowRoot = null;

    // Unmount React root
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  /**
   * Copy all inline &lt;style&gt; and &lt;link rel="stylesheet"&gt; from the host document
   * into the shadow root so that Tailwind and @hai3/uikit styles apply inside the MFE.
   * Called automatically when mounting into a ShadowRoot.
   */
  protected adoptHostStylesIntoShadowRoot(shadowRoot: ShadowRoot): void {
    const styleElements = document.head.querySelectorAll('style');
    for (const el of styleElements) {
      const clone = document.createElement('style');
      clone.textContent = el.textContent ?? '';
      shadowRoot.appendChild(clone);
    }
    const linkElements = document.head.querySelectorAll('link[rel="stylesheet"]');
    for (const el of linkElements) {
      const clone = el.cloneNode(true) as HTMLLinkElement;
      shadowRoot.appendChild(clone);
    }
  }

  /**
   * Initialize screen-specific Tailwind utilities inside the Shadow DOM.
   *
   * CSS variables and styles do NOT penetrate Shadow DOM, so we must
   * initialize them inside the shadow root. Each concrete lifecycle
   * provides its own set of Tailwind utility classes needed for its screen.
   *
   * @param container - The Shadow DOM root or element to append styles to
   */
  protected abstract initializeStyles(container: Element | ShadowRoot): void;

  /**
   * Returns the React content to render for this screen.
   *
   * Each concrete lifecycle returns its own screen component
   * (e.g., `return <HelloWorldScreen bridge={bridge} />`).
   * The base class wraps the returned content in HAI3Provider.
   *
   * @param bridge - The child MFE bridge for communication with the host
   * @returns The React node to render inside HAI3Provider
   */
  protected abstract renderContent(bridge: ChildMfeBridge): React.ReactNode;
}
