## ADDED Requirements

### Requirement: MountManager handles theme CSS variable delivery

`MountManager` SHALL provide a `setTheme(cssVars: Record<string, string>): void` method that the framework calls on initial extension mount and on every subsequent theme change. Each concrete `MountManager` implementation SHALL handle theme delivery appropriate to its isolation context.

#### Scenario: Framework calls setTheme on mount

- **WHEN** an MFE extension is mounted via `mountExtension()`
- **THEN** the framework SHALL call `setTheme()` on the mount manager with the currently active theme's CSS variable map
- **AND** this SHALL occur after the container is created but before the MFE lifecycle's `mount()` is invoked

#### Scenario: Framework calls setTheme on theme change

- **WHEN** the active theme changes while MFE extensions are mounted
- **THEN** the framework SHALL call `setTheme()` on every active mount manager with the new theme's CSS variable map

#### Scenario: DefaultMountManager relies on CSS inheritance for Shadow DOM

- **WHEN** `setTheme()` is called on `DefaultMountManager`
- **THEN** the implementation MAY be a no-op because CSS custom properties set on `document.documentElement` inherit across Shadow DOM boundaries
- **AND** MFE components referencing `var(--primary)` etc. inside the shadow root SHALL resolve to the values set on `document.documentElement`

#### Scenario: Future iframe mount manager injects CSS variables explicitly

- **WHEN** `setTheme()` is called on a mount manager for an iframe isolation context
- **THEN** the implementation SHALL inject the CSS custom properties into the iframe's `document.documentElement`
- **AND** subsequent calls SHALL replace previously injected properties
- **AND** MFE components inside the iframe SHALL resolve CSS custom properties from the iframe's own document root
