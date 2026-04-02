// @cpt-dod:cpt-frontx-dod-unit-test-generation-and-agent-verification-standard-test-convention:p1
//
// Shared Vitest test setup for the monorepo and every scaffolded standalone
// project. `renderStandaloneVitestSetupFile` in `vitest.shared.ts` reads this
// file verbatim at build time so scaffolded projects cannot drift away from
// the monorepo's cleanup surface.
//
// The afterEach block below clears every shared slot that tests in this repo
// have been observed to mutate: timers, mocks, DOM storage/cookies, fetch, and
// the Module Federation shared-scope global owned by the screensets MFE
// handler. New leak surfaces (e.g. IndexedDB, future runtime registries) can
// be added here once a concrete test relies on them; we deliberately do not
// ship speculative cleanup for globals no source or test references.
import { afterEach, vi } from 'vitest';
import { trim } from 'lodash';
import { cleanup as cleanupReactRendering } from '@testing-library/react';
import type { JsonValue } from '@cyberfabric/react';

const ORIGINAL_FETCH_DESCRIPTOR = Object.getOwnPropertyDescriptor(
  globalThis,
  'fetch',
);

// Federation shared-scope registry written by
// `packages/screensets/src/mfe/handler/mf-handler.ts`. Leaks across tests
// unless explicitly removed, because the handler caches a single scope object
// on globalThis for the lifetime of the runtime.
const FEDERATION_SHARED_KEY = '__federation_shared__';
const sharedTeardowns = new Map<string, () => void>();

function restoreFetch(): void {
  if (ORIGINAL_FETCH_DESCRIPTOR) {
    Object.defineProperty(globalThis, 'fetch', ORIGINAL_FETCH_DESCRIPTOR);
  } else if (Reflect.has(globalThis, 'fetch')) {
    Reflect.deleteProperty(globalThis, 'fetch');
  }
}

function clearDocumentCookies(doc: Document): void {
  const raw = doc.cookie;
  if (!raw) return;
  for (const entry of raw.split(';')) {
    const eq = entry.indexOf('=');
    const rawName = eq === -1 ? entry : entry.slice(0, eq);
    const name = trim(rawName);
    if (!name) continue;
    doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

function clearFederationSharedScope(): void {
  if (Reflect.has(globalThis, FEDERATION_SHARED_KEY)) {
    Reflect.deleteProperty(globalThis, FEDERATION_SHARED_KEY);
  }
}

/** In-memory Storage for tests when Node/jsdom exposes a broken Web Storage (e.g. `--localstorage-file` without a path). */
function createMemoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length(): number {
      return items.size;
    },
    clear(): void {
      items.clear();
    },
    getItem(key: string): string | null {
      return items.get(key) ?? null;
    },
    key(index: number): string | null {
      if (index < 0 || index >= items.size) return null;
      return [...items.keys()][index] ?? null;
    },
    removeItem(key: string): void {
      items.delete(key);
    },
    setItem(key: string, value: string): void {
      items.set(key, value);
    },
  } as Storage;
}

function isUsableStorage(candidate: Storage | null | undefined): candidate is Storage {
  return (
    Boolean(candidate) &&
    typeof candidate.clear === 'function' &&
    typeof candidate.setItem === 'function' &&
    typeof candidate.getItem === 'function'
  );
}

function ensureUsableWebStorage(target: Window & typeof globalThis): void {
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    if (isUsableStorage(target[name])) {
      continue;
    }
    const replacement = createMemoryStorage();
    try {
      Object.defineProperty(target, name, {
        value: replacement,
        configurable: true,
        writable: true,
      });
    } catch {
      try {
        Reflect.set(target, name, replacement);
      } catch {
        // Non-configurable storage + hostile runtime: leave as-is.
      }
    }
  }
}

function safeClearWebStorage(storage: Storage | null | undefined): void {
  if (!storage) {
    return;
  }
  const clear = storage.clear;
  if (typeof clear === 'function') {
    clear.call(storage);
  }
}

export function registerSharedTestTeardown(
  key: string,
  teardown: () => void,
): void {
  if (!sharedTeardowns.has(key)) {
    sharedTeardowns.set(key, teardown);
  }
}

type DescriptorRegistryLeaf =
  | JsonValue
  | ((...args: never[]) => void | Promise<void>);

type DescriptorRegistryValue =
  | DescriptorRegistryLeaf
  | DescriptorRegistryValue[]
  | {
      readonly [key: string]: DescriptorRegistryValue | DescriptorRegistryLeaf;
    };

export type DescriptorRegistryTarget =
  | Window
  | typeof globalThis
  | Record<string, DescriptorRegistryValue>;

export function registerSharedDescriptorTeardown(
  target: DescriptorRegistryTarget,
  property: PropertyKey,
  key = String(property),
): void {
  if (sharedTeardowns.has(key)) {
    return;
  }

  const originalDescriptor = Object.getOwnPropertyDescriptor(target, property);
  registerSharedTestTeardown(key, () => {
    if (originalDescriptor) {
      Object.defineProperty(target, property, originalDescriptor);
      return;
    }

    Reflect.deleteProperty(target, property);
  });
}

export function runSharedTestCleanup(): void {
  // React Testing Library auto-registers its own `afterEach(cleanup)` only
  // when `window` is defined at import time, and only in test files that
  // import it directly. Invoking it from this shared hook guarantees the
  // unmount runs for every jsdom-environment test regardless of how the
  // suite consumes the library, so individual tests can drop manual
  // `cleanup()` calls without risking cross-test DOM leaks. The call is a
  // safe no-op under `environment: 'node'`, where nothing has been rendered.
  if (globalThis.window !== undefined) {
    cleanupReactRendering();
  }

  vi.clearAllMocks();
  vi.restoreAllMocks();

  if (globalThis.window !== undefined) {
    safeClearWebStorage(globalThis.window.localStorage);
    safeClearWebStorage(globalThis.window.sessionStorage);
  }

  vi.unstubAllGlobals();
  vi.useRealTimers();

  restoreFetch();

  if (globalThis.window !== undefined) {
    ensureUsableWebStorage(globalThis.window);
    safeClearWebStorage(globalThis.window.localStorage);
    safeClearWebStorage(globalThis.window.sessionStorage);
    if (globalThis.window.document) {
      clearDocumentCookies(globalThis.window.document);
    }
  }

  clearFederationSharedScope();

  for (const teardown of sharedTeardowns.values()) {
    teardown();
  }
  sharedTeardowns.clear();
}

if (globalThis.window !== undefined) {
  ensureUsableWebStorage(globalThis.window);
}

afterEach(() => {
  runSharedTestCleanup();
});
