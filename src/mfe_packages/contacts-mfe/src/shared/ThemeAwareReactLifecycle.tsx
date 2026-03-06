import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { MfeEntryLifecycle, ChildMfeBridge } from '@hai3/react';
import { HAI3Provider } from '@hai3/react';
import { mfeApp } from '../init';

export abstract class ThemeAwareReactLifecycle implements MfeEntryLifecycle<ChildMfeBridge> {
  private root: Root | null = null;

  mount(container: Element | ShadowRoot, bridge: ChildMfeBridge): void {
    if (container instanceof ShadowRoot) {
      this.adoptHostStylesIntoShadowRoot(container);
    }

    this.initializeStyles(container);

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

  protected abstract initializeStyles(container: Element | ShadowRoot): void;

  protected abstract renderContent(bridge: ChildMfeBridge): React.ReactNode;
}
