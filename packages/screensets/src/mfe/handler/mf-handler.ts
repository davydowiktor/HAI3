/**
 * Module Federation MFE Handler Implementation
 *
 * Implements MFE loading using Webpack/Rspack Module Federation 2.0.
 * This is HAI3's default handler for loading remote MFE bundles.
 *
 * @packageDocumentation
 */

import type { TypeSystemPlugin } from '../plugins/types';
import type { MfeEntryMF, MfManifest } from '../types';
import {
  MfeHandler,
  MfeBridgeFactory,
  ChildMfeBridge,
  MfeEntryLifecycle,
} from './types';
import { MfeLoadError } from '../errors';
import { RetryHandler } from '../errors/error-handler';
import { ChildMfeBridgeImpl } from '../bridge/ChildMfeBridge';

/**
 * Module Federation container interface.
 * Represents a loaded remote container from Module Federation.
 */
interface ModuleFederationContainer {
  get(module: string): Promise<() => unknown>;
  init(shared: unknown): Promise<void>;
}

/**
 * Internal cache for Module Federation manifests.
 * Used only by MfeHandlerMF - not exposed publicly.
 */
class ManifestCache {
  private readonly manifests = new Map<string, MfManifest>();
  private readonly containers = new Map<string, ModuleFederationContainer>();

  /**
   * Cache a manifest for reuse.
   */
  cacheManifest(manifest: MfManifest): void {
    this.manifests.set(manifest.id, manifest);
  }

  /**
   * Get a cached manifest by ID.
   */
  getManifest(manifestId: string): MfManifest | undefined {
    return this.manifests.get(manifestId);
  }

  /**
   * Cache a loaded container.
   */
  cacheContainer(remoteName: string, container: ModuleFederationContainer): void {
    this.containers.set(remoteName, container);
  }

  /**
   * Get a cached container.
   */
  getContainer(remoteName: string): ModuleFederationContainer | undefined {
    return this.containers.get(remoteName);
  }
}

/**
 * Default bridge factory - creates ChildMfeBridgeImpl instances.
 * Uses the concrete ChildMfeBridgeImpl class to avoid unsafe casts.
 */
class MfeBridgeFactoryDefault extends MfeBridgeFactory<ChildMfeBridgeImpl> {
  create(domainId: string, entryTypeId: string, instanceId: string): ChildMfeBridgeImpl {
    return new ChildMfeBridgeImpl(domainId, entryTypeId, instanceId);
  }

  dispose(bridge: ChildMfeBridgeImpl): void {
    bridge.cleanup();
  }
}

/**
 * Configuration for MFE loading behavior.
 */
interface MfeLoaderConfig {
  /** Timeout in milliseconds for loading operations (default: 30000) */
  timeout?: number;
  /** Number of retry attempts on failure (default: 2) */
  retries?: number;
}

/**
 * Module Federation handler for loading MFE bundles.
 * Implements HAI3's default loading strategy with Module Federation 2.0.
 */
class MfeHandlerMF extends MfeHandler<MfeEntryMF, ChildMfeBridge> {
  readonly bridgeFactory: MfeBridgeFactoryDefault;
  private readonly manifestCache: ManifestCache;
  private readonly config: MfeLoaderConfig;
  private readonly retryHandler: RetryHandler;

  constructor(
    typeSystem: TypeSystemPlugin,
    config: MfeLoaderConfig = {}
  ) {
    // Pass the base type ID this handler handles
    super(
      typeSystem,
      'gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~',
      0
    );
    this.bridgeFactory = new MfeBridgeFactoryDefault();
    this.manifestCache = new ManifestCache();
    this.retryHandler = new RetryHandler();
    this.config = {
      timeout: config.timeout ?? 30000,
      retries: config.retries ?? 2,
    };
  }

  /**
   * Load an MFE bundle using Module Federation.
   *
   * @param entry - MfeEntryMF to load
   * @returns Promise resolving to MFE lifecycle interface
   */
  async load(entry: MfeEntryMF): Promise<MfeEntryLifecycle> {
    return this.retryHandler.retry(
      () => this.loadInternal(entry),
      this.config.retries ?? 0,
      1000
    );
  }

  /**
   * Preload MFE bundles for faster mounting.
   * Batches container preloading by grouping entries by manifest.
   *
   * @param entries - MfeEntryMF entries to preload
   */
  async preload(entries: MfeEntryMF[]): Promise<void> {
    for (const entry of entries) {
      const manifest = await this.resolveManifest(entry.manifest);
      await this.loadRemoteContainer(manifest);
    }
  }

  /**
   * Internal load implementation.
   */
  private async loadInternal(entry: MfeEntryMF): Promise<MfeEntryLifecycle> {
    // Resolve manifest from entry
    const manifest = await this.resolveManifest(entry.manifest);

    // Cache manifest for reuse by other entries from same remote
    this.manifestCache.cacheManifest(manifest);

    // Load the remote container
    const container = await this.loadRemoteContainer(manifest);

    // Get the exposed module
    const moduleFactory = await this.getModuleFactory(container, entry.exposedModule, entry.id);

    // Execute the factory to get the module
    const loadedModule = moduleFactory();

    // Validate the module implements MfeEntryLifecycle
    if (
      typeof loadedModule !== 'object' ||
      loadedModule === null ||
      typeof (loadedModule as { mount?: unknown }).mount !== 'function' ||
      typeof (loadedModule as { unmount?: unknown }).unmount !== 'function'
    ) {
      throw new MfeLoadError(
        `Module '${entry.exposedModule}' must implement MfeEntryLifecycle interface (mount/unmount)`,
        entry.id
      );
    }

    return loadedModule as MfeEntryLifecycle;
  }

  /**
   * Resolve manifest from reference.
   * Checks cache first, then throws if not found.
   */
  private async resolveManifest(manifestRef: string): Promise<MfManifest> {
    // Check cache first
    const cached = this.manifestCache.getManifest(manifestRef);
    if (cached) {
      return cached;
    }

    // Manifest must be provided inline or already cached from previous entry
    throw new MfeLoadError(
      `Manifest '${manifestRef}' not found. Provide manifest inline in MfeEntryMF or ensure another entry from the same remote was loaded first.`,
      manifestRef
    );
  }

  /**
   * Load a Module Federation remote container.
   * Uses script injection to load remoteEntry.js.
   */
  private async loadRemoteContainer(manifest: MfManifest): Promise<ModuleFederationContainer> {
    // Check if already loaded
    const cached = this.manifestCache.getContainer(manifest.remoteName);
    if (cached) {
      return cached;
    }

    // Load the remote entry script
    await this.loadScript(manifest.remoteEntry, this.config.timeout ?? 30000);

    // Get the container from the global scope
    const container = this.getContainerFromWindow(manifest.remoteName);

    // Initialize the container with shared dependencies
    await container.init({});

    // Cache the container
    this.manifestCache.cacheContainer(manifest.remoteName, container);

    return container;
  }

  /**
   * Load a remote script dynamically.
   */
  private async loadScript(url: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Script load timeout: ${url}`));
      }, timeout);

      const cleanup = (): void => {
        clearTimeout(timer);
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
      };

      const onLoad = (): void => {
        cleanup();
        resolve();
      };

      const onError = (): void => {
        cleanup();
        reject(new Error(`Failed to load script: ${url}`));
      };

      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);

      document.head.appendChild(script);
    });
  }

  /**
   * Get the Module Federation container from the window object.
   * Validates the container implements the required get/init interface.
   */
  private getContainerFromWindow(remoteName: string): ModuleFederationContainer {
    const globalScope = globalThis as Record<string, unknown>;
    const container = globalScope[remoteName];

    if (!container || typeof container !== 'object') {
      throw new Error(`Module Federation container '${remoteName}' not found on window`);
    }

    const candidate = container as Record<string, unknown>;
    if (typeof candidate['get'] !== 'function' || typeof candidate['init'] !== 'function') {
      throw new Error(
        `Module Federation container '${remoteName}' does not implement required get/init interface`
      );
    }

    return candidate as unknown as ModuleFederationContainer;
  }

  /**
   * Get a module factory from the container.
   */
  private async getModuleFactory(
    container: ModuleFederationContainer,
    exposedModule: string,
    entryId: string
  ): Promise<() => unknown> {
    try {
      return await container.get(exposedModule);
    } catch (error) {
      throw new MfeLoadError(
        `Failed to get module '${exposedModule}' from container: ${error instanceof Error ? error.message : String(error)}`,
        entryId,
        error instanceof Error ? error : undefined
      );
    }
  }
}

export { MfeHandlerMF, MfeBridgeFactoryDefault };
