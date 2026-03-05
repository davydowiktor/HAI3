## ADDED Requirements

### Requirement: Theme registry accepts CSS custom property maps

The framework theme registry SHALL accept themes as `Record<string, string>` where keys are CSS custom property names (including the `--` prefix) and values are raw CSS values. The typed `Theme` interface from `@hai3/uikit` SHALL NOT be accepted.

#### Scenario: Register a theme with CSS variable map

- **WHEN** registering a theme with the framework
- **THEN** the registry SHALL accept a theme name (`string`) and a CSS variable map (`Record<string, string>`)
- **AND** keys SHALL be CSS custom property names (e.g., `'--primary'`, `'--background'`)
- **AND** values SHALL be raw CSS values (e.g., `'221 83% 53%'`, `'0 0% 100%'`)
- **AND** the registry SHALL NOT accept a typed `Theme` object or `UikitTheme`

#### Scenario: Theme variable names are not enforced by the framework

- **WHEN** registering a theme
- **THEN** the framework SHALL NOT validate or restrict which CSS custom property names are used
- **AND** the framework SHALL treat the variable map as opaque data to be applied to the document root

### Requirement: Host applies active theme CSS variables to document root

The framework SHALL apply the active theme's CSS custom properties to `document.documentElement` on theme activation and on every theme change.

#### Scenario: Theme activation applies CSS variables

- **WHEN** a theme is activated (initial load or theme switch)
- **THEN** the framework SHALL iterate the theme's `Record<string, string>` and call `document.documentElement.style.setProperty(key, value)` for each entry
- **AND** all previously set theme variables SHALL be cleared before applying the new set

#### Scenario: Theme change updates CSS variables

- **WHEN** the active theme changes from one theme to another
- **THEN** the framework SHALL remove CSS custom properties from the previous theme that are not present in the new theme
- **AND** the framework SHALL set all CSS custom properties from the new theme

### Requirement: MountManager re-injects theme into non-inheriting isolation contexts

`MountManager` SHALL provide a `setTheme(cssVars: Record<string, string>): void` method. The framework SHALL call this method on initial mount and on every subsequent theme change. Each `MountManager` implementation SHALL handle theme delivery appropriate to its isolation context.

#### Scenario: Shadow DOM mount manager relies on CSS inheritance

- **WHEN** `setTheme` is called on `DefaultMountManager` (Shadow DOM)
- **THEN** the implementation MAY be a no-op because CSS custom properties inherit across Shadow DOM boundaries from `document.documentElement`

#### Scenario: Non-inheriting mount manager injects CSS variables

- **WHEN** `setTheme` is called on a mount manager for a non-inheriting context (e.g., iframe)
- **THEN** the implementation SHALL inject the CSS custom properties into the isolation context's own document root
- **AND** subsequent calls SHALL replace the previously injected properties

### Requirement: HAI3_SHARED_PROPERTY_THEME carries theme name as string

`HAI3_SHARED_PROPERTY_THEME` SHALL carry the active theme's name as a plain `string` value. It SHALL NOT carry a `Theme` object or structured theme data.

#### Scenario: MFE subscribes to theme name signal

- **WHEN** an MFE subscribes to `HAI3_SHARED_PROPERTY_THEME`
- **THEN** the property value SHALL be a `string` representing the theme name (e.g., `'default'`, `'dark'`)
- **AND** the MFE SHALL NOT receive a `Theme` object, CSS variable map, or any structured theme data through this property

#### Scenario: MFE ignores theme signal

- **WHEN** an MFE does not subscribe to `HAI3_SHARED_PROPERTY_THEME`
- **THEN** the MFE SHALL still receive theme CSS variables via CSS inheritance or mount manager injection
- **AND** the MFE's UI SHALL reflect the active theme without any theme-related code

### Requirement: Shadcn variable set as documented baseline

The framework documentation and blank-MFE template SHALL treat the standard shadcn/ui CSS variable set as the baseline theme contract. The framework itself SHALL NOT enforce these names.

#### Scenario: Default theme includes shadcn baseline variables

- **WHEN** the blank-MFE template or documentation defines a default theme
- **THEN** it SHALL include at minimum: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--radius`
- **AND** chart variables: `--chart-1` through `--chart-5`

#### Scenario: Host registers additional custom variables

- **WHEN** a host app registers a theme with variables beyond the shadcn baseline (e.g., `'--left-menu'`, `'--chat-input-bg'`)
- **THEN** the framework SHALL apply all variables without filtering or validation
- **AND** MFEs that reference these custom variables SHALL receive them through the same CSS inheritance / injection mechanism

### Requirement: Initialization sequence excludes uikitRegistry

The application initialization sequence SHALL NOT include the `uikitRegistry` step. The sequence SHALL begin with `themeRegistry`.

#### Scenario: Application initializes without uikit registry

- **WHEN** the application starts
- **THEN** the initialization sequence SHALL be: `themeRegistry → screensetsRegistryFactory.build() → domain registration → extension registration → HAI3Provider`
- **AND** no `uikitRegistry` initialization step SHALL occur
