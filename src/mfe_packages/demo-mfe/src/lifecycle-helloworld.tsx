import { createRoot, type Root } from 'react-dom/client';
import type { MfeEntryLifecycle, ChildMfeBridge } from '@hai3/react';
import { HelloWorldScreen } from './screens/helloworld/HelloWorldScreen';

/**
 * Lifecycle implementation for the HelloWorld entry in the demo MFE.
 * Implements MfeEntryLifecycle with React rendering.
 *
 * This class manages a React root internally and delegates rendering
 * to HelloWorldScreen. The bridge is passed through as a prop for
 * communication with the host application.
 *
 * The container parameter is a Shadow DOM root (created by DefaultMountManager).
 * This lifecycle initializes Tailwind/UIKit styles inside the shadow root.
 */
class HelloWorldLifecycle implements MfeEntryLifecycle<ChildMfeBridge> {
  private root: Root | null = null;

  mount(container: Element, bridge: ChildMfeBridge): void {
    // Initialize styles in Shadow DOM
    this.initializeStyles(container);

    // Create React root and render
    this.root = createRoot(container);
    this.root.render(<HelloWorldScreen bridge={bridge} />);
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
      }

      /* CSS Custom Properties (theme variables) */
      /* These match UIKit theme system and will be updated via domain properties */
      :host {
        --background: 0 0% 100%;
        --foreground: 0 0% 3.9%;
        --card: 0 0% 100%;
        --card-foreground: 0 0% 3.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 0 0% 3.9%;
        --primary: 0 0% 9%;
        --primary-foreground: 0 0% 98%;
        --secondary: 0 0% 96.1%;
        --secondary-foreground: 0 0% 9%;
        --muted: 0 0% 96.1%;
        --muted-foreground: 0 0% 45.1%;
        --accent: 0 0% 96.1%;
        --accent-foreground: 0 0% 9%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 0 0% 98%;
        --border: 0 0% 89.8%;
        --input: 0 0% 89.8%;
        --ring: 0 0% 3.9%;
        --radius-sm: 0.125rem;
        --radius-md: 0.25rem;
        --radius-lg: 0.5rem;
        --radius-xl: 1rem;
      }

      /* Tailwind utilities - layout */
      .p-8 { padding: 2rem; }
      .p-4 { padding: 1rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .mb-3 { margin-bottom: 0.75rem; }
      .mb-4 { margin-bottom: 1rem; }
      .mb-6 { margin-bottom: 1.5rem; }
      .max-w-2xl { max-width: 42rem; }

      /* Tailwind utilities - display */
      .grid { display: grid; }
      .flex { display: flex; }
      .gap-2 { gap: 0.5rem; }

      /* Tailwind utilities - borders */
      .border { border-width: 1px; }
      .border-gray-200 { border-color: rgb(229 231 235); }
      .rounded-lg { border-radius: calc(var(--radius-lg)); }
      .rounded { border-radius: calc(var(--radius-md)); }

      /* Tailwind utilities - typography */
      .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-medium { font-weight: 500; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

      /* Tailwind utilities - colors (theme-aware) */
      .text-gray-600 { color: hsl(var(--muted-foreground)); }
      .bg-background { background-color: hsl(var(--background)); }
      .text-foreground { color: hsl(var(--foreground)); }
      .border-border { border-color: hsl(var(--border)); }
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
export default new HelloWorldLifecycle();
