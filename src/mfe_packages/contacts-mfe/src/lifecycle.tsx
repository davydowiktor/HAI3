import React from 'react';
import type { ChildMfeBridge } from '@hai3/react';
import { ThemeAwareReactLifecycle } from './shared/ThemeAwareReactLifecycle';
import { ContactsScreen } from './screens/contacts/ContactsScreen';

class ContactsMfeLifecycle extends ThemeAwareReactLifecycle {
  protected initializeStyles(shadowRoot: Element | ShadowRoot): void {
    const styleElement = document.createElement('style');

    styleElement.textContent = `
      /* Tailwind base layer - reset and normalize */
      *, *::before, *::after {
        box-sizing: border-box;
        border-width: 0;
        border-style: solid;
        border-color: currentColor;
      }
      * { margin: 0; padding: 0; }

      /* Root element styles */
      :host {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: hsl(var(--foreground));
        background-color: hsl(var(--background));
      }

      /* Animation */
      @keyframes pulse {
        50% { opacity: .5; }
      }
      .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

      /* Layout */
      .p-8 { padding: 2rem; }
      .p-6 { padding: 1.5rem; }
      .p-4 { padding: 1rem; }
      .pt-0 { padding-top: 0; }
      .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .px-2\\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }
      .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
      .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
      .mb-1 { margin-bottom: 0.25rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-4 { margin-bottom: 1rem; }
      .mb-6 { margin-bottom: 1.5rem; }
      .mt-4 { margin-top: 1rem; }
      .w-full { width: 100%; }
      .w-48 { width: 12rem; }
      .w-72 { width: 18rem; }
      .h-4 { height: 1rem; }
      .h-8 { height: 2rem; }
      .h-9 { height: 2.25rem; }
      .h-16 { height: 4rem; }

      /* Flexbox & Grid */
      .flex { display: flex; }
      .inline-flex { display: inline-flex; }
      .grid { display: grid; }
      .items-center { align-items: center; }
      .justify-between { justify-content: space-between; }
      .justify-center { justify-content: center; }
      .gap-2 { gap: 0.5rem; }
      .gap-3 { gap: 0.75rem; }
      .space-y-1\\.5 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.375rem; }

      /* Borders & Radius */
      .border { border-width: 1px; }
      .rounded-xl { border-radius: 0.75rem; }
      .rounded-md { border-radius: calc(var(--radius-md, 0.375rem)); }

      /* Typography */
      .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .text-xs { font-size: 0.75rem; line-height: 1rem; }
      .text-base { font-size: 1rem; line-height: 1.5rem; }
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-medium { font-weight: 500; }
      .leading-none { line-height: 1; }
      .tracking-tight { letter-spacing: -0.025em; }
      .whitespace-nowrap { white-space: nowrap; }
      .text-center { text-align: center; }

      /* Colors (theme-aware via CSS custom properties) */
      .text-foreground { color: hsl(var(--foreground)); }
      .text-muted-foreground { color: hsl(var(--muted-foreground)); }
      .text-primary-foreground { color: hsl(var(--primary-foreground)); }
      .text-secondary-foreground { color: hsl(var(--secondary-foreground)); }
      .text-destructive-foreground { color: hsl(var(--destructive-foreground)); }
      .bg-background { background-color: hsl(var(--background)); }
      .bg-card { background-color: hsl(var(--card)); }
      .bg-primary { background-color: hsl(var(--primary)); }
      .bg-secondary { background-color: hsl(var(--secondary)); }
      .bg-destructive { background-color: hsl(var(--destructive)); }
      .bg-muted { background-color: hsl(var(--muted)); }
      .bg-transparent { background-color: transparent; }
      .bg-accent { background-color: hsl(var(--accent)); }
      .text-card-foreground { color: hsl(var(--card-foreground)); }
      .border-input { border-color: hsl(var(--input)); }
      .ring-ring { --tw-ring-color: hsl(var(--ring)); }

      /* Shadows */
      .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
      .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }

      /* Transitions */
      .transition-colors { transition-property: color, background-color, border-color; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

      /* Focus */
      .focus-visible\\:outline-none:focus-visible { outline: none; }
      .focus-visible\\:ring-1:focus-visible { box-shadow: 0 0 0 1px hsl(var(--ring)); }

      /* Placeholder */
      .placeholder\\:text-muted-foreground::placeholder { color: hsl(var(--muted-foreground)); }

      /* Disabled */
      .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
      .disabled\\:opacity-50:disabled { opacity: 0.5; }
      .disabled\\:pointer-events-none:disabled { pointer-events: none; }

      /* File input */
      .file\\:border-0::file-selector-button { border-width: 0; }
      .file\\:bg-transparent::file-selector-button { background-color: transparent; }
      .file\\:text-sm::file-selector-button { font-size: 0.875rem; }
      .file\\:font-medium::file-selector-button { font-weight: 500; }
      .file\\:text-foreground::file-selector-button { color: hsl(var(--foreground)); }

      /* Hover */
      .hover\\:bg-primary\\/90:hover { background-color: hsl(var(--primary) / 0.9); }
      .hover\\:bg-accent:hover { background-color: hsl(var(--accent)); }
      .hover\\:bg-secondary\\/80:hover { background-color: hsl(var(--secondary) / 0.8); }

      /* Responsive */
      @media (min-width: 768px) {
        .md\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      }
    `;

    shadowRoot.appendChild(styleElement);
  }

  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    return <ContactsScreen bridge={bridge} />;
  }
}

export default new ContactsMfeLifecycle();
