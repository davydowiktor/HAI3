# Glossary

This document defines key terms used throughout the MFE system design documents.

---

## Core Concepts

### Microfrontend (MFE)
A Microfrontend (MFE) is an independently developed, deployed, and versioned UI component that can be loaded into a parent application at runtime. Communication happens only through defined contracts via the ChildMfeBridge. Throughout these documents, "MFE" is used as the standard abbreviation after the first occurrence. See [Runtime Isolation in overview.md](./overview.md#runtime-isolation-default-behavior) for isolation model details.

### Domain (ExtensionDomain)
An extension point where MFE instances can be mounted. Domains can exist at **any level of the hierarchy** - the host application can define domains, and MFEs themselves can define their own domains for nested extensions. This enables hierarchical composition where an MFE acts as both an extension (to its parent's domain) and a domain provider (for its own child extensions). Domains define the contract with extensions by declaring shared properties, supported action types, and UI metadata schemas. See [schemas.md - Extension Domain Schema](./schemas.md#extension-domain-schema) for the type definition and [type-system.md - Decision 3](./type-system.md#decision-3-internal-typescript-type-definitions) for TypeScript interface references.

All 4 base extension domains declare `theme` and `language` as shared properties, enabling MFEs to receive and react to UI state changes from the host.

**Note**: The framework defines 7 layout domains total: 4 are **extension domains** (screen, sidebar, popup, overlay) where MFE entries mount; 3 are **configuration domains** (header, footer, menu) that are store-slice-driven layout areas, not MFE mount targets. Configuration domains are a conceptual categorization, NOT GTS `ExtensionDomain` instances, and are NOT registered with `ScreensetsRegistry`. The menu configuration domain is populated dynamically from the `presentation` metadata on registered screen extensions. See [mfe-ext-lifecycle-actions.md - Extension Domains vs Configuration Domains](./mfe-ext-lifecycle-actions.md#extension-domains-vs-configuration-domains) for the complete table.

### Extension
A binding that connects an MFE entry to a specific domain, creating a concrete MFE instance. Extensions carry optional `presentation` metadata (label, icon, route, order) that drives host UI elements like the navigation menu. Domain-specific fields are defined in derived Extension types, validated natively by GTS. Extensions are registered dynamically at runtime. See [schemas.md - Extension Schema](./schemas.md#extension-schema) for the type definition and [type-system.md - Decision 9](./type-system.md#decision-9-domain-specific-extension-validation-via-derived-types) for derived type validation. For isolation model, see [Runtime Isolation in overview.md](./overview.md#runtime-isolation-default-behavior).

### ExtensionPresentation
Presentation metadata on an Extension that describes how it appears in the host UI. Fields: `label` (display text), `icon` (icon identifier), `route` (URL path), `order` (sort priority). The host builds navigation menus dynamically from presentation metadata of registered screen extensions. See [schemas.md - Extension Schema](./schemas.md#extension-schema).

### Entry (MfeEntry)
The contract that an MFE declares with its parent domain. Specifies required/optional properties and bidirectional action capabilities. MfeEntry is abstract; derived types (like MfeEntryMF) add loader-specific fields. See [mfe-entry-mf.md](./mfe-entry-mf.md).

### ChildMfeBridge
The communication channel exposed to MFE instance (child) code for interacting with its parent domain. Provides `executeActionsChain()` (pass-through to the registry) and methods for subscribing to shared properties. See [mfe-api.md](./mfe-api.md). For isolation model, see [Runtime Isolation in overview.md](./overview.md#runtime-isolation-default-behavior).

### ParentMfeBridge
The parent-side bridge interface for managing a mounted MFE instance. Provides `instanceId` for identifying the child and `dispose()` for cleanup. The parent uses `registry.executeActionsChain()` directly for action chain execution. See [mfe-api.md](./mfe-api.md).

---

## Communication

### Action
A typed message with a target (domain or extension), self-identifying type ID, optional payload, and optional timeout override. Actions are the units of communication in action chains. See [mfe-actions.md](./mfe-actions.md).

**Terminology Note - Domain vs Extension Actions:**
- **`actions`** (on ExtensionDomain): Action type IDs the domain can send TO extensions in this domain
- **`extensionsActions`** (on ExtensionDomain): Action type IDs extensions can send TO this domain
- **`actions`** (on MfeEntry): Action type IDs the MFE can send TO its domain
- **`domainActions`** (on MfeEntry): Action type IDs the MFE can receive FROM its domain

### ActionsChain
A linked structure of actions with `next` (on success) and `fallback` (on failure) branches. Enables declarative action workflows where the outcome of one action determines which action executes next. See [mfe-actions.md](./mfe-actions.md).

### SharedProperty
A typed value passed from the parent to mounted MFEs (one-way: parent to MFE). Domains declare which properties they provide; entries declare which properties they require. MFEs subscribe to property updates via the bridge. HAI3 provides two built-in shared property instances: **theme** (`HAI3_SHARED_PROPERTY_THEME`) and **language** (`HAI3_SHARED_PROPERTY_LANGUAGE`). All 4 base extension domains declare both. See [schemas.md - Shared Property Schema](./schemas.md#shared-property-schema) for the type definition, [mfe-shared-property.md](./mfe-shared-property.md) for the built-in instances, and [mfe-api.md - Domain-Level Property Updates](./mfe-api.md#domain-level-property-updates) for the update mechanism.

---

## Lifecycle

### LifecycleStage
A GTS type representing a lifecycle event that can trigger actions chains. HAI3 provides four default stages (`init`, `activated`, `deactivated`, `destroyed`), and projects can define custom stages. See [schemas.md - Lifecycle Stage Schema](./schemas.md#lifecycle-stage-schema) for the type definition and [mfe-ext-lifecycle-actions.md](./mfe-ext-lifecycle-actions.md) for how lifecycle actions work.

### LifecycleHook
A binding between a lifecycle stage and an actions chain. When the stage triggers, the system executes the associated actions chain. See [schemas.md - Lifecycle Hook Schema](./schemas.md#lifecycle-hook-schema) for the type definition and [mfe-ext-lifecycle-actions.md](./mfe-ext-lifecycle-actions.md) for the complete lifecycle actions design.

---

## Runtime Components

### Handler (MfeHandler)
An abstract class that handles loading MFE bundles for specific entry types. Handlers use type hierarchy matching to determine which entries they can handle. HAI3 provides MfeHandlerMF for Module Federation; companies can register custom handlers. See [mfe-loading.md](./mfe-loading.md).

### MfeBridgeFactory
An abstract factory that creates bridge instances for specific entry types. Each handler has an associated bridge factory. This is the **handler-level** factory for custom bridge implementations. See [mfe-loading.md](./mfe-loading.md).

### RuntimeBridgeFactory
An `@internal` abstract class for internal bridge wiring between host and child MFEs. This is a **different concern** from `MfeBridgeFactory` (handler-level) -- `RuntimeBridgeFactory` handles the runtime wiring, while `MfeBridgeFactory` creates custom bridge instances for handler implementations. See [registry-runtime.md - Runtime Bridge Factory](./registry-runtime.md#runtime-bridge-factory-class-based).

### ActionsChainsMediator
The runtime component that routes action chains to their targets and handles success/failure branching. The public API is `registry.executeActionsChain()`, which delegates to the ActionsChainsMediator internally. See [mfe-actions.md](./mfe-actions.md).

### ChildDomainForwardingHandler
An `@internal` class that forwards actions targeting a child domain through the bridge transport to a child runtime. See [mfe-api.md - Cross-Runtime Action Chain Routing](./mfe-api.md#cross-runtime-action-chain-routing-hierarchical-composition).

---

## Type System

### TypeSystemPlugin
An interface that abstracts type system operations for MFE contracts. Provides methods for schema registration, instance validation, and type hierarchy checking. The screensets package treats type IDs as opaque strings. See [type-system.md](./type-system.md).

### GTS (Global Type System)
HAI3's default implementation of TypeSystemPlugin. Uses the `@globaltypesystem/gts-ts` package. GTS type IDs follow the format: `gts.<vendor>.<package>.<namespace>.<type>.v<MAJOR>[.<MINOR>]~`. See [type-system.md](./type-system.md).

### Contract
The agreement between an MFE entry and a domain, defining:
- Which shared properties the domain provides and the entry requires
- Which action types the entry can send to the domain
- Which action types can target the entry from the domain

Contract matching is validated at extension registration time. See [type-system.md](./type-system.md#decision-8-contract-matching-rules).

---

## Module Federation

### MfManifest
A GTS type containing Module Federation 2.0 configuration: remote entry URL, container name, and shared dependency settings. Referenced by MfeEntryMF instances. Multiple entries can share one manifest when exposed from the same federated container. See [mfe-manifest.md](./mfe-manifest.md).

### MfeEntryMF
HAI3's default derived entry type extending MfeEntry with Module Federation fields. References an MfManifest and specifies the exposed module path. This is the thin contract suitable for third-party vendors. See [mfe-entry-mf.md](./mfe-entry-mf.md).
