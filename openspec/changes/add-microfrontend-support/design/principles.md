# Design: MFE Principles

This document covers the core architectural principles for the MFE system.

**Related Documents:**
- [MFE API](./mfe-api.md) - MfeEntryLifecycle, MfeBridge interfaces
- [MFE Actions](./mfe-actions.md) - Action and ActionsChain types
- [Registry and Runtime](./registry-runtime.md) - Runtime isolation, dynamic registration
- [MFE Loading](./mfe-loading.md) - MfeHandler abstract class, handler registry

---

## Core Principles

1. **Thin Public Contracts** - The public interface is minimal and stable
2. **Instance-Level Runtime Isolation (Default)** - HAI3's default handler enforces instance-level isolation. See [Runtime Isolation](./overview.md#runtime-isolation-default-behavior) for details.
3. **Extensibility via Handlers** - Companies extend via custom handlers, not core changes
4. **MFE Independence (Default)** - Each MFE instance takes full responsibility for its own needs
5. **Hierarchical Composition** - Domains can exist at any level; MFEs can be both extensions and domain providers

---

## Extensibility via Handlers

Companies extend the MFE system by creating custom derived entry types, custom handlers, and custom bridge factories - NOT by modifying HAI3 core. This keeps the core thin and stable for 3rd-party vendors while allowing enterprises to add richness for internal MFEs.

See [MFE Loading - Decision 10](./mfe-loading.md#decision-10-mfehandler-abstraction-and-registry) for implementation details including MfeHandler, MfeBridgeFactory, and handler registry patterns.

---

## MFE Independence with Thin Public Contracts

**What**: Each MFE **instance** is maximally independent with a thin public contract. The public interface (MfeEntryLifecycle, ChildMfeBridge, actions) is the ONLY required coupling between parent and MFE instance.

**Why**:
- Easy to version and maintain compatibility
- Low coupling between host and MFEs
- MFE developers take full responsibility for their own needs
- Each MFE evolves independently

With HAI3's default handler, each MFE instance has its own API services, router, and state. See [Runtime Isolation](./overview.md#runtime-isolation-default-behavior) for the complete isolation model, architecture diagrams, and recommendations.

### The Trade-off and Solution

**Trade-off**: Duplicate API requests may occur if multiple MFE instances need the same data.

**Solution**: Optimizations happen through **optional private libraries**, NOT through public contracts:

| Layer | Contract Type | Example | Who Controls |
|-------|--------------|---------|--------------|
| Public | Thin | MfeBridge, Actions | HAI3 Architecture |
| Private | Optional | @hai3/api with cache sync | Library Maintainers |

### Private Optimization Layer

Libraries like `@hai3/api` can be used by MFEs to optimize performance:

```typescript
// MFE code - simple, independent API call
const api = createApiClient();  // MFE gets its own instance
const user = await api.get('/users/123');

// Under the hood (TRANSPARENT to MFE):
// - Library checks shared cache first
// - If another MFE already fetched this, returns cached value
// - Deduplicates in-flight requests across MFEs
// - MFE code doesn't know or care
```

**Key Characteristics:**
1. **Each MFE instance gets its own library instance** - No singleton, full isolation semantics
2. **Libraries sync cache implicitly** - Transparent to MFE code
3. **Opt-in optimization** - MFE can use axios instead; system still works, just no cache sharing
4. **No public contract changes** - Optimizations don't affect MfeBridge or action interfaces

### The Principle

```
PUBLIC (Architecture Level)     PRIVATE (Implementation Level)
+---------------------------+   +---------------------------+
| - MfeEntryLifecycle       |   | - @hai3/api cache sync    |
| - ChildMfeBridge          |   | - Request deduplication   |
| - Actions                 |   | - Shared worker pools     |
| - Shared Properties       |   | - Background prefetching  |
+---------------------------+   +---------------------------+
        THIN, STABLE                  OPT-IN, EVOLVABLE
```

**Applies to**:
- API services (each MFE instance has its own, library may optimize)
- Routers (each MFE instance has its own, no sharing needed)
- Any potential "singleton service" pattern (avoided in favor of per-instance isolation)

### Trade-offs

- **Memory**: Duplicate runtime instances (not bundles - MF handles code sharing). Acceptable for isolation benefits; private optimization layer can address if needed.
- **Cache Invalidation**: Equally complex for singleton or per-instance approaches.
- **Opt-in**: MFEs can use any HTTP client; `@hai3/api` optimization is optional. Optimization stays at library level to preserve MFE independence.

### Guarantees and Scope

- **Cross-Instance Consistency**: Guaranteed when using HAI3 tooling (`@hai3/api`); third-party HTTP clients opt out.
- **Platform-Level Data**: Auth, user context, feature flags shared via SharedProperty mechanism.
- **Tooling Implementation**: Private optimization layer (`@hai3/api` cache sync) is out of scope for this proposal.
