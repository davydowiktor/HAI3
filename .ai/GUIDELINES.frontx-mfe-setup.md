# FrontX MFE Setup Guidelines

## Overview

This document describes the FrontX Microfrontend (MFE) architecture and setup requirements for creating and managing MFE packages in a monorepo environment.

## Architecture

### Directory Structure
```
src/mfe_packages/
├── demo-mfe/              (Demo/example MFE)
└── {name}-mfe/            (New MFEs follow this pattern)
```

### Port Assignment
- **3001**: demo-mfe (Module Federation dev server)
- **3010+**: Reserved for additional MFEs (3010, 3020, 3030, ...)
- **5173**: Main application (Vite dev server)

## MFE Package Structure

### Required Files

Each MFE package must contain:

```
{screenset}-mfe/
├── package.json              # NPM package definition
├── vite.config.ts            # Vite + Module Federation config
├── tsconfig.json             # TypeScript configuration
├── src/
│   ├── lifecycle.tsx          # MFE lifecycle & entry point
│   ├── screens/
│   │   ├── home/
│   │   ├── list/
│   │   └── details/
│   └── components/            # Shared UI components
├── mfe.json                   # Module Federation manifest
└── index.html                 # Entry HTML
```

## Key Configuration

### ✅ CORRECT: dev script for hot reload

```json
// package.json
"scripts": {
  "dev": "vite --port {{port}}"
}
```

**Benefits:**
- ⚡ Hot Module Replacement (HMR) enabled
- 🔄 Changes auto-reload without full rebuild
- ⏱️ Faster startup time
- 🐛 Better debugging experience

### ❌ WRONG: Avoid this pattern

```json
"dev": "vite build && vite preview --port {{port}}"
```

**Problems:**
- ❌ Full build required on every run
- ❌ No hot reload capability
- ❌ Slow development experience
- ❌ Hides live changes

## Development Workflow

### Running All Servers

```bash
npm run dev:all
```

This starts:
1. All enabled MFE servers (demo-mfe on port 3001, etc.)
2. Main app Vite server (port 5173+)

### Adding a New MFE

1. **Create package from template:**
   ```bash
   cp -r packages/cli/template-sources/mfe-package/ \
     src/mfe_packages/{screensetName}-mfe/
   ```

2. **Update variables in package.json and vite.config.ts:**
   - Replace `{{mfeName}}` with screenset name (camelCase)
   - Replace `{{port}}` with available port

3. **Add dev script to root package.json:**
   ```json
   "dev:mfe:{screensetName}": "cd src/mfe_packages/{screensetName}-mfe && npm run dev"
   ```

4. **Update dev:all command:**
   ```json
   "dev:all": "npm run generate:mfe-manifests && npx tsx scripts/dev-all.ts"
   ```

## MFE Implementation Best Practices

### ✅ DO

- **Bootstrap via shared `init.ts`** with `createHAI3().use(effects()).use(queryCacheShared()).use(mock()).build()` (see `src/mfe_packages/_blank-mfe/src/init.ts`)
- **Register slices via `registerSlice`** from `@cyberfabric/react`, augmenting `RootState` per slice file
- **Augment `EventPayloadMap`** in each MFE domain events file (on `@cyberfabric/react`, not `@cyberfabric/state`)
- **Subscribe to host state via the bridge** (`bridge.subscribeToProperty`, `bridge.getProperty`) — never reach into host slices
- **Cross-runtime coordination via actions chains** (`bridge.executeActionsChain`), not events
- **Isolate MFE logic** - keep it simple and focused
- **Own UI components locally** in `components/ui/` — no shared UI kit required
- **Test with Chrome DevTools MCP** before submission

### ❌ DON'T

- **Import Redux directly** from `react-redux`, `redux`, or `@reduxjs/toolkit` (use `@cyberfabric/react` slice + hooks)
- **Add `queryCache()`, `createHAI3App()`, or `QueryClientProvider`** inside an MFE — the host owns the shared QueryClient; MFEs join via `queryCacheShared()`
- **Use `useScreenTranslations` from `@cyberfabric/react`** in MFEs — it depends on the host i18n registry. Use the bridge-based `useScreenTranslations` from the MFE's own `shared/` directory.
- **Add complex coordinator effects** — split events/effects per domain, no barrel exports
- **Hardcode configuration** - use environment variables
- **Use `vite build && preview`** in dev script
- **Ignore TypeScript errors** - run type-check regularly

## State Management in MFEs

MFEs run their **own** FrontX app instance with its own Redux store. The host app's store is unreachable from MFE code by design — communication crosses the runtime boundary via the bridge.

### Bootstrap (per-MFE `src/init.ts`)

Canonical template lives in `.ai/commands/user/frontx-new-mfe.md` § INIT TEMPLATE. Required shape:

```typescript
// register API services BEFORE build (mock plugin syncs during build())
apiRegistry.register(MyApiService);
apiRegistry.initialize();

const mfeApp = createHAI3().use(effects()).use(queryCacheShared()).use(mock()).build();

// register slices AFTER build (registerSlice needs the store)
registerSlice(homeSlice, initHomeEffects);
```

Order is load-bearing: API registry before `.build()`, `registerSlice` after.

### Slice + RootState augmentation
```typescript
// src/slices/homeSlice.ts
import { createSlice } from '@cyberfabric/react';

const { slice } = createSlice({
  name: '_blank/home',
  initialState: { items: [] as Item[] },
  reducers: {
    setItems(state, { payload }: { payload: Item[] }) { state.items = payload; },
  },
});

export const homeSlice = slice;

declare module '@cyberfabric/react' {
  interface RootState {
    '_blank/home': { items: Item[] };
  }
}
```

### Events + EventPayloadMap augmentation
```typescript
// src/events/homeEvents.ts
declare module '@cyberfabric/react' {
  interface EventPayloadMap {
    'mfe/home/data-fetched': { items: Item[] };
  }
}
```

### Component (typed selectors via `@cyberfabric/react`)
```tsx
import { useAppSelector } from '@cyberfabric/react';

export const ItemList = () => {
  const items = useAppSelector(s => s['_blank/home'].items);
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
};
```

## CLI Commands

### Create New Screenset
```bash
frontx add-mfe {name}
```

### Create New MFE (use template)
See `frontx-new-mfe.md` in `.ai/commands/user/`

### Validate Setup
```bash
npm run type-check
npm run arch:check
npm run lint
```

## Troubleshooting

### MFE not loading in screenset
1. Check `mfe.json` manifest has correct extension definitions
2. Verify port numbers match in `mfe.json` and `package.json`
3. Check browser console for Module Federation errors
4. Ensure `remoteEntry.js` is accessible at configured URL

### Redux context errors
1. Confirm `init.ts` calls `createHAI3().…build()` and `<HAI3Provider app={mfeApp}>` wraps the React tree
2. Confirm `registerSlice(slice, initEffects)` runs after `.build()`
3. Confirm `RootState` is augmented on `@cyberfabric/react` (not `@cyberfabric/state`)
4. Use `useAppSelector` / `useAppDispatch` from `@cyberfabric/react`

### Hot reload not working
1. Verify dev script: `vite --port {{port}}` (not `vite build && preview`)
2. Check port is not already in use
3. Restart dev server: `npm run dev:all`

### Module Federation errors
1. Check `vite.config.ts` exposes configuration
2. Verify Federation name matches across configs
3. Ensure shared dependencies are declared correctly

## References

- **Template location**: `/packages/cli/template-sources/mfe-package/`
- **Commands**: `.ai/commands/user/frontx-new-mfe.md`, `frontx-dev-all.md`
- **Architecture**: `.ai/GUIDELINES.md`
- **Implementation examples**: `src/mfe_packages/`

## Implementation Checklist

When creating a new MFE:

- [ ] Create package from template
- [ ] Update all `{{variable}}` placeholders
- [ ] Install dependencies
- [ ] Create `src/init.ts` with `createHAI3().use(effects()).use(queryCacheShared()).use(mock()).build()`
- [ ] Create `src/lifecycle.tsx` extending `ThemeAwareReactLifecycle` and exporting a singleton instance
- [ ] Add screens in `src/screens/`
- [ ] Per-domain `slices/`, `events/`, `effects/`, `actions/` folders (no barrels); augment `RootState` and `EventPayloadMap` on `@cyberfabric/react`
- [ ] Subscribe to host state via `bridge.subscribeToProperty(...)`; cross-runtime calls via `bridge.executeActionsChain(...)`
- [ ] Add `dev:mfe:{name}` script to root package.json
- [ ] Update `dev:all` command
- [ ] Run `npm run type-check`
- [ ] Run `npm run arch:check`
- [ ] Test with `npm run dev:all`
- [ ] Verify in Studio Overlay (Ctrl+`)

---

**Last Updated:** 2026-03-04
**Version:** 1.0.0
**Status:** Active
