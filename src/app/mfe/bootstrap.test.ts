import { describeBootstrapMfeContract } from '@cyberfabric/react/testing';

describeBootstrapMfeContract({
  suiteName: 'bootstrapMFE',
  bootstrapModulePath: './bootstrap.ts',
  manifestsModulePath: './generated-mfe-manifests.ts',
  callerUrl: import.meta.url,
});
