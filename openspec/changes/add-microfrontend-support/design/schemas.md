# Design: GTS Schema Definitions

This document contains the JSON Schema definitions for all MFE system types. These schemas are registered with the TypeSystemPlugin for runtime validation.

**Related Documents:**
- [GTS Specification](https://github.com/GlobalTypeSystem/gts-spec) - Global Type System specification
- [Type System](./type-system.md) - TypeSystemPlugin interface, GTS implementation, contract validation
- [MFE Entry](./mfe-entry-mf.md) - MfeEntry and MfeEntryMF type details
- [MFE Manifest](./mfe-manifest.md) - MfManifest type details
- [MFE Actions](./mfe-actions.md) - Action and ActionsChain type details
- [MFE API](./mfe-api.md) - SharedProperty usage, bridge interfaces

---

## GTS Package Organization

The MFE type system is organized into two GTS packages:

### `hai3.mfes` Package (Core Infrastructure)
Core infrastructure schemas hardcoded in `@hai3/screensets`. These define the fundamental building blocks of the MFE system. Organized into namespaces:
- `mfe` namespace: entry, mf_manifest, entry_mf
- `ext` namespace: domain, extension
- `comm` namespace: shared_property, action, actions_chain
- `lifecycle` namespace: stage, hook

### `hai3.screensets` Package (Layout Implementation)
Layout-specific domain instances that use the core `hai3.mfes` schemas. These are framework-level implementations.

---

## Overview

The MFE type system consists of **8 core types** plus **2 MF-specific types**. See [Type System - Decision 2](./type-system.md#decision-2-gts-type-id-format-and-registration) for the complete GTS Type ID table and layout domain instances.

---

## Core Type Schemas

### MFE Entry Schema (Abstract Base)

The base contract type for all MFE entries. Derived types add loader-specific fields.

```json
{
  "$id": "gts://gts.hai3.mfes.mfe.entry.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "x-gts-ref": "/$id"
    },
    "requiredProperties": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.comm.shared_property.v1~*" },
      "$comment": "SharedProperty type IDs REQUIRED by the MFE"
    },
    "optionalProperties": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.comm.shared_property.v1~*" }
    },
    "actions": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.comm.action.v1~*" },
      "$comment": "Actions MFE can send to its domain"
    },
    "domainActions": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.comm.action.v1~*" },
      "$comment": "Actions MFE can receive"
    }
  },
  "required": ["id", "requiredProperties", "actions", "domainActions"]
}
```

### Extension Domain Schema

Defines an extension point where MFEs can be mounted.

```json
{
  "$id": "gts://gts.hai3.mfes.ext.domain.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "x-gts-ref": "/$id",
      "$comment": "The GTS type ID for this instance"
    },
    "sharedProperties": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.comm.shared_property.v1~*" }
    },
    "actions": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.comm.action.v1~*" },
      "$comment": "Action type IDs that can target extensions in this domain"
    },
    "extensionsActions": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.comm.action.v1~*" },
      "$comment": "Action type IDs extensions can send when targeting this domain"
    },
    "extensionsTypeId": {
      "type": "string",
      "x-gts-ref": "gts.hai3.mfes.ext.extension.v1~*",
      "$comment": "Optional reference to a derived Extension type ID. If specified, extensions must use types that derive from this type."
    },
    "defaultActionTimeout": {
      "type": "number",
      "minimum": 1,
      "$comment": "Default timeout in milliseconds for actions targeting this domain. REQUIRED."
    },
    "lifecycleStages": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.lifecycle.stage.v1~*" },
      "$comment": "Lifecycle stage type IDs supported for the domain itself. Hooks referencing unsupported stages are rejected during validation."
    },
    "extensionsLifecycleStages": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.lifecycle.stage.v1~*" },
      "$comment": "Lifecycle stage type IDs supported for extensions in this domain. Extension hooks referencing unsupported stages are rejected during validation."
    },
    "lifecycle": {
      "type": "array",
      "items": { "type": "object", "$ref": "gts://gts.hai3.mfes.lifecycle.hook.v1~" },
      "$comment": "Optional lifecycle hooks - explicitly declared actions for each stage"
    }
  },
  "required": ["id", "sharedProperties", "actions", "extensionsActions", "defaultActionTimeout", "lifecycleStages", "extensionsLifecycleStages"]
}
```

### Extension Schema

Binds an MFE entry to a domain. Domain-specific fields are defined in derived Extension schemas. The base schema includes an optional `presentation` object for host UI integration (menu items, navigation).

```json
{
  "$id": "gts://gts.hai3.mfes.ext.extension.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "x-gts-ref": "/$id",
      "$comment": "The GTS type ID for this instance"
    },
    "domain": {
      "x-gts-ref": "gts.hai3.mfes.ext.domain.v1~*",
      "$comment": "ExtensionDomain type ID to mount into"
    },
    "entry": {
      "x-gts-ref": "gts.hai3.mfes.mfe.entry.v1~*",
      "$comment": "MfeEntry type ID to mount"
    },
    "presentation": {
      "type": "object",
      "properties": {
        "label": {
          "type": "string",
          "$comment": "Display label for the extension in host UI (e.g., nav menu item text)"
        },
        "icon": {
          "type": "string",
          "$comment": "Icon identifier for the extension in host UI (e.g., icon name from UIKit)"
        },
        "route": {
          "type": "string",
          "$comment": "Route path for the extension (e.g., '/hello-world'). Used by navigation."
        },
        "order": {
          "type": "number",
          "$comment": "Sort order for the extension in host UI lists (lower = higher priority)"
        }
      },
      "required": ["label", "route"],
      "$comment": "Presentation metadata for host UI integration. Defines how this extension appears in navigation menus and other host UI elements. The same entry could mount in different domains with different presentation."
    },
    "lifecycle": {
      "type": "array",
      "items": { "type": "object", "$ref": "gts://gts.hai3.mfes.lifecycle.hook.v1~" },
      "$comment": "Optional lifecycle hooks - explicitly declared actions for each stage"
    }
  },
  "required": ["id", "domain", "entry"],
  "$comment": "Domain-specific fields are defined in derived Extension schemas. Domains may specify extensionsTypeId to require extensions use a derived type."
}
```

### Shared Property Schema

Represents a shared property contract defining which values consumers must support. Runtime values are set via `updateDomainProperty()`, not stored in the GTS instance.

```json
{
  "$id": "gts://gts.hai3.mfes.comm.shared_property.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "x-gts-ref": "/$id"
    },
    "supportedValues": {
      "type": "array",
      "items": { "type": "string" },
      "$comment": "Enum contract: the set of values that consumers of this property must support"
    }
  },
  "required": ["id", "supportedValues"]
}
```

### Action Schema

A typed message with target and optional payload.

```json
{
  "$id": "gts://gts.hai3.mfes.comm.action.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "type": {
      "x-gts-ref": "/$id",
      "$comment": "Self-reference to this action's type ID"
    },
    "target": {
      "type": "string",
      "oneOf": [
        { "x-gts-ref": "gts.hai3.mfes.ext.domain.v1~*" },
        { "x-gts-ref": "gts.hai3.mfes.ext.extension.v1~*" }
      ],
      "$comment": "Type ID of the target ExtensionDomain or Extension"
    },
    "payload": {
      "type": "object",
      "$comment": "Optional action payload"
    },
    "timeout": {
      "type": "number",
      "minimum": 1,
      "$comment": "Optional timeout override in milliseconds"
    }
  },
  "required": ["type", "target"]
}
```

### Actions Chain Schema

A linked structure of actions with success/failure branches.

```json
{
  "$id": "gts://gts.hai3.mfes.comm.actions_chain.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "action": {
      "type": "object",
      "$ref": "gts://gts.hai3.mfes.comm.action.v1~"
    },
    "next": {
      "type": "object",
      "$ref": "gts://gts.hai3.mfes.comm.actions_chain.v1~"
    },
    "fallback": {
      "type": "object",
      "$ref": "gts://gts.hai3.mfes.comm.actions_chain.v1~"
    }
  },
  "required": ["action"]
}
```

### Lifecycle Stage Schema

Represents a lifecycle event that can trigger actions chains.

```json
{
  "$id": "gts://gts.hai3.mfes.lifecycle.stage.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "x-gts-ref": "/$id"
    },
    "description": {
      "type": "string"
    }
  },
  "required": ["id"]
}
```

### Lifecycle Hook Schema

Binds a lifecycle stage to an actions chain.

```json
{
  "$id": "gts://gts.hai3.mfes.lifecycle.hook.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "stage": {
      "x-gts-ref": "gts.hai3.mfes.lifecycle.stage.v1~*",
      "$comment": "The lifecycle stage that triggers this hook"
    },
    "actions_chain": {
      "type": "object",
      "$ref": "gts://gts.hai3.mfes.comm.actions_chain.v1~",
      "$comment": "The actions chain to execute when the stage triggers"
    }
  },
  "required": ["stage", "actions_chain"]
}
```

---

## MF-Specific Type Schemas

### MF Manifest Schema

Module Federation configuration for loading MFE bundles.

```json
{
  "$id": "gts://gts.hai3.mfes.mfe.mf_manifest.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {
      "x-gts-ref": "/$id"
    },
    "remoteEntry": {
      "type": "string",
      "format": "uri"
    },
    "remoteName": {
      "type": "string",
      "minLength": 1
    },
    "sharedDependencies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "requiredVersion": { "type": "string" },
          "singleton": {
            "type": "boolean",
            "default": false,
            "$comment": "Default false = isolated instances per MFE"
          }
        },
        "required": ["name"]
      }
    },
    "entries": {
      "type": "array",
      "items": { "x-gts-ref": "gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~*" }
    }
  },
  "required": ["id", "remoteEntry", "remoteName"]
}
```

### MFE Entry MF Schema (Derived)

Module Federation implementation extending the base MfeEntry.

```json
{
  "$id": "gts://gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "allOf": [
    { "$ref": "gts://gts.hai3.mfes.mfe.entry.v1~" }
  ],
  "properties": {
    "manifest": {
      "x-gts-ref": "gts.hai3.mfes.mfe.mf_manifest.v1~*",
      "$comment": "Reference to MfManifest type ID containing Module Federation config"
    },
    "exposedModule": {
      "type": "string",
      "minLength": 1,
      "$comment": "Module Federation exposed module name (e.g., './ChartWidget')"
    }
  },
  "required": ["manifest", "exposedModule"]
}
```

**Design note (JSON schema vs TypeScript):** The JSON schema defines `manifest` as an `x-gts-ref` (string reference only) because it validates the persisted/serialized form where manifests are always stored as string references. The TypeScript runtime interface (`MfeEntryMF.manifest: string | MfManifest`) accepts both string references and inline MfManifest objects for convenience. Inline objects are resolved at load time by `MfeHandlerMF.resolveManifest()`. See [mfe-entry-mf.md](./mfe-entry-mf.md#typescript-interface-definitions) for the TypeScript interface.

---

## GTS Entity Storage Format

### JSON as Native GTS Format

GTS entities (schemas, instances, domains, extensions, etc.) are natively represented as JSON. **All GTS entities MUST be stored in `.json` files**, not hardcoded as TypeScript objects.

**Two-Package Organization**:

| Package | Purpose | Location | Loaded By |
|---------|---------|----------|-----------|
| `hai3.mfes` | Core MFE infrastructure schemas and base instances | `packages/screensets/src/mfe/gts/hai3.mfes/` | GTS plugin (hardcoded in @hai3/screensets) |
| `hai3.screensets` | Layout-specific domain instances | `packages/framework/src/plugins/microfrontends/gts/hai3.screensets/` | Framework level (added at runtime) |

**Complete Directory Structure**:
```
packages/screensets/src/mfe/gts/
  hai3.mfes/                         # Core MFE GTS package
    schemas/
      mfe/
        entry.v1.json                # MfeEntry schema (gts.hai3.mfes.mfe.entry.v1~)
        mf_manifest.v1.json          # MfManifest schema (gts.hai3.mfes.mfe.mf_manifest.v1~)
        entry_mf.v1.json             # MfeEntryMF schema (gts.hai3.mfes.mfe.entry.v1~hai3.mfes.mfe.entry_mf.v1~)
      ext/
        domain.v1.json               # ExtensionDomain schema (gts.hai3.mfes.ext.domain.v1~)
        extension.v1.json            # Extension schema (gts.hai3.mfes.ext.extension.v1~)
      comm/
        shared_property.v1.json      # SharedProperty schema (gts.hai3.mfes.comm.shared_property.v1~)
        action.v1.json               # Action schema (gts.hai3.mfes.comm.action.v1~)
        actions_chain.v1.json        # ActionsChain schema (gts.hai3.mfes.comm.actions_chain.v1~)
      lifecycle/
        stage.v1.json                # LifecycleStage schema (gts.hai3.mfes.lifecycle.stage.v1~)
        hook.v1.json                 # LifecycleHook schema (gts.hai3.mfes.lifecycle.hook.v1~)
    instances/
      lifecycle/
        init.v1.json                 # gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.init.v1
        activated.v1.json            # gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.activated.v1
        deactivated.v1.json          # gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.deactivated.v1
        destroyed.v1.json            # gts.hai3.mfes.lifecycle.stage.v1~hai3.mfes.lifecycle.destroyed.v1
      ext/
        load_ext.v1.json             # gts.hai3.mfes.comm.action.v1~hai3.mfes.ext.load_ext.v1
        mount_ext.v1.json            # gts.hai3.mfes.comm.action.v1~hai3.mfes.ext.mount_ext.v1
        unmount_ext.v1.json          # gts.hai3.mfes.comm.action.v1~hai3.mfes.ext.unmount_ext.v1
      comm/
        theme.v1.json                # gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.theme.v1
        language.v1.json             # gts.hai3.mfes.comm.shared_property.v1~hai3.mfes.comm.language.v1
packages/framework/src/plugins/microfrontends/gts/
  hai3.screensets/                   # Screensets layout GTS package (L2 - runtime config)
    instances/
      domains/
        sidebar.v1.json              # gts.hai3.mfes.ext.domain.v1~hai3.screensets.layout.sidebar.v1
        popup.v1.json                # gts.hai3.mfes.ext.domain.v1~hai3.screensets.layout.popup.v1
        screen.v1.json               # gts.hai3.mfes.ext.domain.v1~hai3.screensets.layout.screen.v1
        overlay.v1.json              # gts.hai3.mfes.ext.domain.v1~hai3.screensets.layout.overlay.v1
```

---

## Schema Registration

First-class citizen schemas are built into the GTS plugin (no explicit registration needed). Vendors register derived type schemas using `registerSchema(schema)`. See [Type System - Decision 4](./type-system.md#decision-4-built-in-first-class-citizen-schemas) for rationale and [Type System - Decision 5](./type-system.md#decision-5-vendor-type-registration) for vendor registration examples.
