import React from 'react';
import type { ChildMfeBridge } from '@hai3/react';
import { ThemeAwareReactLifecycle } from './shared/ThemeAwareReactLifecycle';
import { DataTableScreen } from './screens/dataTable/DataTableScreen';

/**
 * Lifecycle implementation for the DataTable entry in the demo MFE.
 * Extends ThemeAwareReactLifecycle to inherit theme subscription logic.
 */
class DataTableLifecycle extends ThemeAwareReactLifecycle {
  protected initializeStyles(shadowRoot: Element | ShadowRoot): void {
    const styleElement = document.createElement('style');

    styleElement.textContent = `
      /* Tailwind base layer */
      *, *::before, *::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: currentColor; }
      * { margin: 0; padding: 0; }
      :host {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: hsl(var(--foreground));
        background-color: hsl(var(--background));
      }
      .p-8 { padding: 2rem; } .p-6 { padding: 1.5rem; } .p-4 { padding: 1rem; } .p-2 { padding: 0.5rem; }
      .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
      .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .mb-2 { margin-bottom: 0.5rem; } .mb-4 { margin-bottom: 1rem; } .mb-6 { margin-bottom: 1.5rem; }
      .ml-2 { margin-left: 0.5rem; } .ml-auto { margin-left: auto; } .-ml-3 { margin-left: -0.75rem; }
      .w-full { width: 100%; }
      .h-8 { height: 2rem; } .h-24 { height: 6rem; }
      .size-4 { width: 1rem; height: 1rem; } .size-8 { width: 2rem; height: 2rem; }
      .flex { display: flex; } .inline-flex { display: inline-flex; } .hidden { display: none; }
      .items-center { align-items: center; } .justify-between { justify-content: space-between; } .justify-center { justify-content: center; }
      .flex-1 { flex: 1 1 0%; }
      .gap-2 { gap: 0.5rem; } .gap-4 { gap: 1rem; }
      .space-y-4 > :not(:first-child) { margin-top: 1rem; }
      .space-y-3 > :not(:first-child) { margin-top: 0.75rem; }
      .space-x-2 > :not(:first-child) { margin-left: 0.5rem; }
      .space-x-6 > :not(:first-child) { margin-left: 1.5rem; }
      .border { border-width: 1px; }
      .rounded-md { border-radius: calc(var(--radius-md)); }
      .rounded-lg { border-radius: calc(var(--radius-lg)); }
      .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .text-xs { font-size: 0.75rem; line-height: 1rem; }
      .font-bold { font-weight: 700; } .font-semibold { font-weight: 600; } .font-medium { font-weight: 500; }
      .text-center { text-align: center; }
      .capitalize { text-transform: capitalize; }
      .text-muted-foreground { color: hsl(var(--muted-foreground)); }
      .text-foreground { color: hsl(var(--foreground)); }
      .bg-background { background-color: hsl(var(--background)); }
      .bg-muted { background-color: hsl(var(--muted)); }
      .border-border { border-color: hsl(var(--border)); }
      .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
      .overflow-hidden { overflow: hidden; }
      .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
      .cursor-pointer { cursor: pointer; }
      @media (min-width: 1024px) {
        .lg\\:flex { display: flex; }
        .lg\\:w-\\[250px\\] { width: 250px; }
        .lg\\:px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .lg\\:space-x-8 > :not(:first-child) { margin-left: 2rem; }
      }
    `;

    shadowRoot.appendChild(styleElement);
  }

  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    return <DataTableScreen bridge={bridge} />;
  }
}

export default new DataTableLifecycle();
