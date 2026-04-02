/**
 * MfeHandlerMF Share Scope Tests (Blob URL Isolation)
 *
 * Tests for share scope construction via the public load() API.
 *
 * The blob URL isolation mechanism:
 *  - Dependencies WITH chunkPath get per-load blob URL get() functions
 *  - Dependencies WITHOUT chunkPath are omitted (MFE uses bundled copy)
 *  - Each load() call writes fresh entries to globalThis.__federation_shared__
 *  - Source text fetching is cached across loads (deduplication)
 *
 * Per project guidelines, private methods are tested through the public API only.
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MfeHandlerMF } from '../../../src/mfe/handler/mf-handler';
import { MfeLoadError } from '../../../src/mfe/errors';
import type { MfeEntryMF, MfManifest } from '../../../src/mfe/types';
import {
  setupBlobUrlLoaderMocks,
  createRemoteEntrySource,
  createExposeChunkSource,
  TEST_BASE_URL,
  clearFederationSharedScope,
  readFederationSharedScope,
  writeFederationSharedScope,
} from '../../../__test-utils__';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a test setup with manifest, source registration, and entry factory.
 */
function createTestSetup(
  remoteName: string,
  options: {
    exposedModules?: string[];
    sharedDeps?: MfManifest['sharedDependencies'];
  } = {}
) {
  const exposedModules = options.exposedModules ?? ['./Widget1'];
  const remoteEntryUrl = `${TEST_BASE_URL}/${remoteName}/remoteEntry.js`;
  const baseUrl = `${TEST_BASE_URL}/${remoteName}/`;

  const exposeMap: Record<string, string> = {};
  for (const mod of exposedModules) {
    const safeName = mod.replace('./', '').replace(/[^a-zA-Z0-9]/g, '-');
    exposeMap[mod] = `expose-${safeName}.js`;
  }

  const manifest: MfManifest = {
    id: `gts.hai3.mfes.mfe.mf_manifest.v1~test.${remoteName}.manifest.v1`,
    remoteEntry: remoteEntryUrl,
    remoteName,
    sharedDependencies: options.sharedDeps,
  };

  return {
    manifest,
    baseUrl,
    registerSources(reg: (url: string, src: string) => void): void {
      reg(remoteEntryUrl, createRemoteEntrySource(exposeMap));
      for (const chunk of Object.values(exposeMap)) {
        reg(`${baseUrl}${chunk}`, createExposeChunkSource());
      }
    },
    createEntry(exposedModule: string, suffix: string): MfeEntryMF {
      return {
        id: `gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~test.${suffix}.v1`,
        requiredProperties: [],
        optionalProperties: [],
        actions: [],
        domainActions: [],
        manifest,
        exposedModule,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MfeHandlerMF - share scope construction and blob URL isolation', () => {
  let handler: MfeHandlerMF;
  let mocks: ReturnType<typeof setupBlobUrlLoaderMocks>;

  beforeEach(() => {
    handler = new MfeHandlerMF('gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~', { timeout: 5000, retries: 0 });
    mocks = setupBlobUrlLoaderMocks();
    clearFederationSharedScope();
  });

  afterEach(() => {
    mocks.cleanup();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // buildShareScope — chunkPath present → blob URL get()
  // -------------------------------------------------------------------------
  describe('buildShareScope — chunkPath present', () => {
    it('writes a blob URL get() to globalThis for deps with chunkPath', async () => {
      const setup = createTestSetup('reactHost', {
        sharedDeps: [
          {
            name: 'react',
            requiredVersion: '^19.0.0',
            chunkPath: '__federation_shared_react.js',
          },
        ],
      });
      setup.registerSources(mocks.registerSource);
      mocks.registerSource(
        `${setup.baseUrl}__federation_shared_react.js`,
        'export default {};'
      );

      const entry = setup.createEntry('./Widget1', 'react.entry');
      await handler.load(entry);

      const shared = readFederationSharedScope();
      expect(shared).toBeDefined();
      expect(shared!['default']).toBeDefined();
      expect(shared!['default']['react']).toBeDefined();
      expect(shared!['default']['react']['*']).toBeDefined();
      expect(typeof shared!['default']['react']['*'].get).toBe('function');
    });

    it('creates blob URL get() regardless of existing global scope entries', async () => {
      // Pre-populate global scope with an existing entry
      const originalGet = async () => () => ({ __host: true }) as unknown;
      writeFederationSharedScope({
        default: {
          react: {
            '19.2.4': { get: originalGet, loaded: 1 },
          },
        },
      });

      const setup = createTestSetup('reactHost2', {
        sharedDeps: [
          {
            name: 'react',
            requiredVersion: '^19.0.0',
            chunkPath: '__federation_shared_react.js',
          },
        ],
      });
      setup.registerSources(mocks.registerSource);
      mocks.registerSource(
        `${setup.baseUrl}__federation_shared_react.js`,
        'export default {};'
      );

      const entry = setup.createEntry('./Widget1', 'react2.entry');
      await handler.load(entry);

      // The new entry is written under '*' key (always fresh blob URL get)
      const shared = readFederationSharedScope();
      expect(shared!['default']['react']['*']).toBeDefined();
      expect(shared!['default']['react']['*'].get).not.toBe(originalGet);
      // The pre-existing 19.2.4 entry is preserved
      expect(shared!['default']['react']['19.2.4']).toBeDefined();
    });

    it('handles multiple shared deps with chunkPaths', async () => {
      const setup = createTestSetup('multiDepsHost', {
        sharedDeps: [
          {
            name: 'react',
            requiredVersion: '^19.0.0',
            chunkPath: '__federation_shared_react.js',
          },
          {
            name: 'react-dom',
            requiredVersion: '^19.0.0',
            chunkPath: '__federation_shared_react-dom.js',
          },
        ],
      });
      setup.registerSources(mocks.registerSource);
      mocks.registerSource(
        `${setup.baseUrl}__federation_shared_react.js`,
        'export default {};'
      );
      mocks.registerSource(
        `${setup.baseUrl}__federation_shared_react-dom.js`,
        'export default {};'
      );

      const entry = setup.createEntry('./Widget1', 'multideps.entry');
      await handler.load(entry);

      const shared = readFederationSharedScope();
      expect(shared!['default']['react']).toBeDefined();
      expect(shared!['default']['react-dom']).toBeDefined();
      expect(typeof shared!['default']['react']['*'].get).toBe('function');
      expect(typeof shared!['default']['react-dom']['*'].get).toBe('function');
    });
  });

  // -------------------------------------------------------------------------
  // buildShareScope — no chunkPath → omitted
  // -------------------------------------------------------------------------
  describe('buildShareScope — no chunkPath', () => {
    it('omits dependencies without chunkPath from the share scope', async () => {
      const setup = createTestSetup('noChunkRemote', {
        sharedDeps: [
          // No chunkPath → omitted from share scope
          { name: 'react', requiredVersion: '^19.0.0' },
        ],
      });
      setup.registerSources(mocks.registerSource);

      const entry = setup.createEntry('./Widget1', 'nochunk.entry');
      await handler.load(entry);

      const shared = readFederationSharedScope();
      expect(shared).toEqual({});
      expect(shared?.['default']).toBeUndefined();
    });

    it('creates get() only for deps WITH chunkPath in a mixed list', async () => {
      const setup = createTestSetup('mixedRemote', {
        sharedDeps: [
          { name: 'react', chunkPath: '__federation_shared_react.js' },
          { name: 'lodash' }, // No chunkPath
        ],
      });
      setup.registerSources(mocks.registerSource);
      mocks.registerSource(
        `${setup.baseUrl}__federation_shared_react.js`,
        'export default {};'
      );

      const entry = setup.createEntry('./Widget1', 'mixed.entry');
      await handler.load(entry);

      const shared = readFederationSharedScope();
      // react has chunkPath → present
      expect(shared!['default']['react']).toBeDefined();
      // lodash has no chunkPath → absent
      expect(shared!['default']['lodash']).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // buildShareScope — no sharedDependencies → empty
  // -------------------------------------------------------------------------
  describe('buildShareScope — no sharedDependencies', () => {
    it('does not throw when manifest has no sharedDependencies', async () => {
      const setup = createTestSetup('noDepsRemote', {});
      setup.registerSources(mocks.registerSource);

      const entry = setup.createEntry('./Widget1', 'nodeps.entry');
      await expect(handler.load(entry)).resolves.toBeDefined();
    });

    it('does not write package entries when sharedDependencies is empty', async () => {
      const setup = createTestSetup('emptyDepsRemote', { sharedDeps: [] });
      setup.registerSources(mocks.registerSource);

      const entry = setup.createEntry('./Widget1', 'emptydeps.entry');
      await handler.load(entry);

      const shared = readFederationSharedScope();
      expect(shared).toEqual({});
      expect(Object.keys(shared?.['default'] ?? {})).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Per-load isolation — each load() gets fresh get() functions
  // -------------------------------------------------------------------------
  describe('per-load isolation', () => {
    it('each load() produces different get() function references', async () => {
      const setup = createTestSetup('isolationRemote', {
        exposedModules: ['./Widget1', './Widget2'],
        sharedDeps: [
          { name: 'react', chunkPath: '__federation_shared_react.js' },
        ],
      });
      setup.registerSources(mocks.registerSource);
      mocks.registerSource(
        `${setup.baseUrl}__federation_shared_react.js`,
        'export default {};'
      );

      // Load first entry
      const entry1 = setup.createEntry('./Widget1', 'iso1.entry');
      await handler.load(entry1);

      const shared1 = readFederationSharedScope();
      const get1 = shared1!['default']['react']['*'].get;

      // Load second entry (same manifest, different exposed module)
      const entry2 = setup.createEntry('./Widget2', 'iso2.entry');
      await handler.load(entry2);

      const shared2 = readFederationSharedScope();
      const get2 = shared2!['default']['react']['*'].get;

      // Each load() creates a NEW get() function (per-load isolation)
      expect(get1).not.toBe(get2);
    });
  });

  // -------------------------------------------------------------------------
  // Source text cache — deduplicates fetches
  // -------------------------------------------------------------------------
  describe('source text cache', () => {
    it('prevents duplicate network fetches for shared dep chunks', async () => {
      const setup = createTestSetup('cacheRemote', {
        exposedModules: ['./Widget1', './Widget2'],
        sharedDeps: [
          { name: 'react', chunkPath: '__federation_shared_react.js' },
        ],
      });
      setup.registerSources(mocks.registerSource);
      const sharedChunkUrl = `${setup.baseUrl}__federation_shared_react.js`;
      mocks.registerSource(sharedChunkUrl, 'export default {};');

      // Load two entries from the same manifest
      const entry1 = setup.createEntry('./Widget1', 'cache1.entry');
      const entry2 = setup.createEntry('./Widget2', 'cache2.entry');

      await handler.load(entry1);

      // Extract get() from first load and invoke it
      const shared1 = readFederationSharedScope();
      const get1 = shared1!['default']['react']['*'].get;
      await get1();

      await handler.load(entry2);

      // Extract get() from second load and invoke it
      const shared2 = readFederationSharedScope();
      const get2 = shared2!['default']['react']['*'].get;
      await get2();

      // Shared chunk URL fetched only once despite two get() invocations
      const chunkFetches = mocks.mockFetch.mock.calls.filter(
        (call: unknown[]) => call[0] === sharedChunkUrl
      );
      expect(chunkFetches).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------
  describe('error handling', () => {
    it('throws MfeLoadError when shared dep chunk fetch fails (404)', async () => {
      const setup = createTestSetup('errorRemote', {
        sharedDeps: [
          { name: 'react', chunkPath: '__federation_shared_react.js' },
        ],
      });
      setup.registerSources(mocks.registerSource);
      // NOTE: NOT registering the shared dep chunk → fetch returns 404

      const entry = setup.createEntry('./Widget1', 'error.entry');
      await handler.load(entry);

      // The get() was stored but not invoked yet
      const shared = readFederationSharedScope();
      const blobGet = shared!['default']['react']['*'].get;

      // Invoking get() triggers fetch of the chunk → 404 → MfeLoadError
      await expect(blobGet()).rejects.toBeInstanceOf(MfeLoadError);
    });

    it('throws MfeLoadError when expose metadata cannot be resolved from remoteEntry', async () => {
      const remoteName = 'missingExposeRemote';
      const remoteEntryUrl = `${TEST_BASE_URL}/${remoteName}/remoteEntry.js`;

      // Register a remote entry that does NOT contain './NonExistent'
      mocks.registerSource(
        remoteEntryUrl,
        createRemoteEntrySource({ './Widget1': 'expose-Widget1.js' })
      );

      const manifest: MfManifest = {
        id: `gts.hai3.mfes.mfe.mf_manifest.v1~test.${remoteName}.manifest.v1`,
        remoteEntry: remoteEntryUrl,
        remoteName,
      };

      const entry: MfeEntryMF = {
        id: 'gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~test.missingexpose.v1',
        requiredProperties: [],
        optionalProperties: [],
        actions: [],
        domainActions: [],
        manifest,
        exposedModule: './NonExistent',
      };

      const error = await handler.load(entry).catch((loadError: unknown) => loadError);
      expect(error).toBeInstanceOf(MfeLoadError);
      expect((error as Error).message).toContain('Cannot resolve expose metadata');
    });
  });
});
