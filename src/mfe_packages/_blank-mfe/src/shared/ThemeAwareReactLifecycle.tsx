import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { MfeEntryLifecycle, ChildMfeBridge } from '@hai3/react';
import { HAI3Provider } from '@hai3/react';
import { mfeApp } from '../init';

/**
 * Abstract base class for React-based MFE lifecycle implementations.
 *
 * Theme CSS variables are delivered automatically via CSS inheritance from :root
 * (Shadow DOM) or via MountManager injection (iframe). MFE lifecycles do NOT need
 * to subscribe to theme changes or call applyThemeToShadowRoot.
 *
 * Concrete subclasses must provide:
 * - `initializeStyles(container)` - screen-specific Tailwind utilities
 * - `renderContent(bridge)` - screen component rendering
 */
export abstract class ThemeAwareReactLifecycle implements MfeEntryLifecycle<ChildMfeBridge> {
  private root: Root | null = null;

  mount(container: Element | ShadowRoot, bridge: ChildMfeBridge): void {
    // Step 1: Adopt host document styles into shadow root so Tailwind CSS applies
    if (container instanceof ShadowRoot) {
      this.adoptHostStylesIntoShadowRoot(container);
    }

    // Step 2: Initialize base styles (Tailwind utilities)
    this.initializeStyles(container);

    // Step 3: Create React root and render
    this.root = createRoot(container);
    this.root.render(
      <HAI3Provider app={mfeApp}>
        {this.renderContent(bridge)}
      </HAI3Provider>
    );
  }

  unmount(_container: Element | ShadowRoot): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  /**
   * Copy all inline <style> and <link rel="stylesheet"> from the host document
   * into the shadow root so that Tailwind and component styles apply inside the MFE.
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
   */
  protected abstract initializeStyles(container: Element | ShadowRoot): void;

  /**
   * Return the screen-specific React component tree.
   */
  protected abstract renderContent(bridge: ChildMfeBridge): React.ReactNode;
}
