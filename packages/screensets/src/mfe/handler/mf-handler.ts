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
  ChildMfeBridge,
  MfeEntryLifecycle,
} from './types';
import { MfeLoadError } from '../errors';
import { RetryHandler } from '../errors/error-handler';
import { MfeBridgeFactoryDefault } from './mfe-bridge-factory-default';

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
   * @returns Promise resolving to MFE lifecycle interface with ChildMfeBridge
   */
  async load(entry: MfeEntryMF): Promise<MfeEntryLifecycle<ChildMfeBridge>> {
    return this.retryHandler.retry(
      () => this.loadInternal(entry),
      this.config.retries ?? 0,
      1000
    );
  }

  /**
   * Internal load implementation.
   */
  private async loadInternal(entry: MfeEntryMF): Promise<MfeEntryLifecycle<ChildMfeBridge>> {
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

    // Validate the module implements MfeEntryLifecycle using type guard
    if (!this.isValidLifecycleModule(loadedModule)) {
      throw new MfeLoadError(
        `Module '${entry.exposedModule}' must implement MfeEntryLifecycle interface (mount/unmount)`,
        entry.id
      );
    }

    return loadedModule;
  }

  /**
   * Type guard to validate MfeEntryLifecycle interface.
   */
  private isValidLifecycleModule(
    module: unknown
  ): module is MfeEntryLifecycle<ChildMfeBridge> {
    if (typeof module !== 'object' || module === null) {
      return false;
    }
    const candidate = module as Record<string, unknown>;
    return (
      typeof candidate.mount === 'function' &&
      typeof candidate.unmount === 'function'
    );
  }

  /**
   * Resolve manifest from reference.
   * Supports both inline manifest objects and type ID references.
   */
  private async resolveManifest(manifestRef: string | MfManifest): Promise<MfManifest> {
    // If manifestRef is an object (inline manifest), validate and use it
    if (typeof manifestRef === 'object' && manifestRef !== null) {
      // TypeScript knows manifestRef is MfManifest after the type guard above
      // Validate required fields using typed properties
      if (typeof manifestRef.id !== 'string') {
        throw new MfeLoadError(
          'Inline manifest must have a valid "id" field',
          'inline-manifest'
        );
      }
      if (typeof manifestRef.remoteEntry !== 'string') {
        throw new MfeLoadError(
          `Inline manifest '${manifestRef.id}' must have a valid "remoteEntry" field`,
          manifestRef.id
        );
      }
      if (typeof manifestRef.remoteName !== 'string') {
        throw new MfeLoadError(
          `Inline manifest '${manifestRef.id}' must have a valid "remoteName" field`,
          manifestRef.id
        );
      }

      // After validation, manifestRef is already correctly typed as MfManifest
      // Cache the inline manifest for reuse
      this.manifestCache.cacheManifest(manifestRef);
      return manifestRef;
    }

    // If manifestRef is a string (type ID), check cache
    if (typeof manifestRef === 'string') {
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

    // Invalid manifest reference type
    throw new MfeLoadError(
      'Manifest reference must be a string (type ID) or MfManifest object',
      'invalid-manifest-ref'
    );
  }

  /**
   * Load a Module Federation remote container.
   * Uses ESM dynamic import to load remoteEntry.js.
   *
   * @originjs/vite-plugin-federation produces ESM-format remoteEntry.js files
   * with named exports (get/init), NOT UMD globals. We use ESM dynamic import
   * instead of script injection + window lookup.
   */
  private async loadRemoteContainer(manifest: MfManifest): Promise<ModuleFederationContainer> {
    // Check if already loaded
    const cached = this.manifestCache.getContainer(manifest.remoteName);
    if (cached) {
      return cached;
    }

    // Dynamically import the remote entry ESM module
    // @vite-ignore directive prevents Vite from trying to analyze the dynamic import
    const remoteModule = await this.loadRemoteModuleESM(
      manifest.remoteEntry,
      this.config.timeout ?? 30000
    );

    // Validate the imported module has required get/init methods
    if (!this.isModuleFederationContainer(remoteModule)) {
      throw new MfeLoadError(
        `Remote module '${manifest.remoteEntry}' does not export required get/init functions. ` +
        `Ensure the remote is built with Module Federation ESM format.`,
        manifest.id
      );
    }

    // Initialize the container with shared dependencies
    await remoteModule.init({});

    // Cache the container
    this.manifestCache.cacheContainer(manifest.remoteName, remoteModule);

    return remoteModule;
  }

  /**
   * Load a remote ESM module dynamically.
   * Uses dynamic import() with timeout protection.
   */
  private async loadRemoteModuleESM(url: string, timeout: number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new MfeLoadError(
          `Timeout loading remote module: ${url} (${timeout}ms)`,
          url
        ));
      }, timeout);

      // Dynamic import with @vite-ignore to prevent Vite analysis
      // The imported module IS the container (exports get/init)
      import(/* @vite-ignore */ url)
        .then((module) => {
          clearTimeout(timer);
          resolve(module);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(new MfeLoadError(
            `Failed to load remote module: ${url}`,
            url,
            error instanceof Error ? error : undefined
          ));
        });
    });
  }

  /**
   * Type guard for Module Federation container.
   * Validates that value has required get/init methods.
   */
  private isModuleFederationContainer(value: unknown): value is ModuleFederationContainer {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as Record<string, unknown>).get === 'function' &&
      typeof (value as Record<string, unknown>).init === 'function'
    );
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

export { MfeHandlerMF };
