import type { FederationSharedMap } from '../src/mfe/handler/federation-types';

// @cpt-dod:cpt-frontx-dod-screenset-registry-handler-injection:p1

const FEDERATION_KEY = '__federation_shared__' as const;

type GlobalWithFederation = typeof globalThis & {
  [FEDERATION_KEY]?: FederationSharedMap;
};

// @cpt-begin:cpt-frontx-dod-screenset-registry-handler-injection:p1:inst-federation-shared-scope
function accessFederationSharedScope(
  value?: FederationSharedMap
): FederationSharedMap | undefined {
  const federationHost = globalThis as GlobalWithFederation;

  if (arguments.length === 1) {
    federationHost[FEDERATION_KEY] = value;
  }

  return federationHost[FEDERATION_KEY];
}

export function readFederationSharedScope(): FederationSharedMap | undefined {
  return accessFederationSharedScope();
}

export function writeFederationSharedScope(value: FederationSharedMap): void {
  accessFederationSharedScope(value);
}

export function clearFederationSharedScope(): void {
  const federationHost = globalThis as GlobalWithFederation;
  delete federationHost[FEDERATION_KEY];
}
// @cpt-end:cpt-frontx-dod-screenset-registry-handler-injection:p1:inst-federation-shared-scope
