import { createRoot, type Root } from 'react-dom/client';
import type { MfeEntryLifecycle, ChildMfeBridge } from '@hai3/react';
import { ProfileScreen } from './screens/profile/ProfileScreen';

/**
 * Lifecycle implementation for the Profile entry in the demo MFE.
 * Implements MfeEntryLifecycle with React rendering.
 *
 * This class manages a React root internally and delegates rendering
 * to ProfileScreen. The bridge is passed through as a prop for
 * communication with the host application.
 *
 * The container parameter is a Shadow DOM root (created by DefaultMountManager).
 * This lifecycle initializes Tailwind/UIKit styles inside the shadow root.
 */
class ProfileLifecycle implements MfeEntryLifecycle<ChildMfeBridge> {
  private root: Root | null = null;

  mount(container: Element, bridge: ChildMfeBridge): void {
    // Initialize styles in Shadow DOM
    this.initializeStyles(container);

    // Create React root and render
    this.root = createRoot(container);
    this.root.render(<ProfileScreen bridge={bridge} />);
  }

  unmount(_container: Element): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  /**
   * Initialize Tailwind CSS and UIKit styles inside the Shadow DOM.
   * CSS variables and styles do NOT penetrate Shadow DOM, so we must
   * initialize them inside the shadow root.
   *
   * This implementation injects Tailwind utility classes and CSS variables
   * that MFE components need. The styles are scoped to the shadow root.
   */
  private initializeStyles(shadowRoot: Element): void {
    const styleElement = document.createElement('style');

    // Include Tailwind base, components, and utilities
    // Plus CSS custom properties from UIKit theme system
    styleElement.textContent = `
      /* Tailwind base layer */
      *, *::before, *::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: currentColor; }
      * { margin: 0; padding: 0; }
      :host {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      :host {
        --background: 0 0% 100%; --foreground: 0 0% 3.9%; --card: 0 0% 100%; --card-foreground: 0 0% 3.9%;
        --popover: 0 0% 100%; --popover-foreground: 0 0% 3.9%; --primary: 0 0% 9%; --primary-foreground: 0 0% 98%;
        --secondary: 0 0% 96.1%; --secondary-foreground: 0 0% 9%; --muted: 0 0% 96.1%; --muted-foreground: 0 0% 45.1%;
        --accent: 0 0% 96.1%; --accent-foreground: 0 0% 9%; --destructive: 0 84.2% 60.2%; --destructive-foreground: 0 0% 98%;
        --border: 0 0% 89.8%; --input: 0 0% 89.8%; --ring: 0 0% 3.9%;
        --radius-sm: 0.125rem; --radius-md: 0.25rem; --radius-lg: 0.5rem; --radius-xl: 1rem;
      }
      .p-8 { padding: 2rem; } .p-4 { padding: 1rem; } .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .mb-2 { margin-bottom: 0.5rem; } .mb-3 { margin-bottom: 0.75rem; } .mb-4 { margin-bottom: 1rem; } .mb-6 { margin-bottom: 1.5rem; }
      .mt-4 { margin-top: 1rem; }
      .max-w-2xl { max-width: 42rem; } .max-w-4xl { max-width: 56rem; }
      .w-full { width: 100%; }
      .grid { display: grid; } .flex { display: flex; } .inline-flex { display: inline-flex; }
      .items-center { align-items: center; } .justify-between { justify-content: space-between; }
      .gap-2 { gap: 0.5rem; } .gap-3 { gap: 0.75rem; } .gap-4 { gap: 1rem; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .border { border-width: 1px; } .border-gray-200 { border-color: rgb(229 231 235); }
      .rounded-lg { border-radius: calc(var(--radius-lg)); } .rounded { border-radius: calc(var(--radius-md)); }
      .rounded-md { border-radius: calc(var(--radius-md)); }
      .text-3xl { font-size: 1.875rem; line-height: 2.25rem; } .text-2xl { font-size: 1.5rem; line-height: 2rem; }
      .text-xl { font-size: 1.25rem; line-height: 1.75rem; } .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; } .text-xs { font-size: 0.75rem; line-height: 1rem; }
      .font-bold { font-weight: 700; } .font-semibold { font-weight: 600; } .font-medium { font-weight: 500; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .text-gray-600 { color: hsl(var(--muted-foreground)); }
      .text-gray-500 { color: hsl(var(--muted-foreground)); }
      .bg-background { background-color: hsl(var(--background)); }
      .bg-muted { background-color: hsl(var(--muted)); }
      .bg-primary { background-color: hsl(var(--primary)); }
      .text-foreground { color: hsl(var(--foreground)); }
      .text-primary { color: hsl(var(--primary)); }
      .text-primary-foreground { color: hsl(var(--primary-foreground)); }
      .border-border { border-color: hsl(var(--border)); }
      .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
      .overflow-hidden { overflow: hidden; }
      .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .space-y-2 > :not(:first-child) { margin-top: 0.5rem; }
      .space-y-4 > :not(:first-child) { margin-top: 1rem; }
    `;

    shadowRoot.appendChild(styleElement);
  }
}

/**
 * Export a singleton instance of the lifecycle class.
 * Module Federation expects a default export; the handler calls
 * moduleFactory() which returns this module, then validates it
 * has mount/unmount methods.
 */
export default new ProfileLifecycle();
