## ADDED Requirements

### Requirement: MFEs are not required to use a specific UI library

MFEs SHALL NOT be required to depend on `@hai3/uikit` or any specific UI component library. MFEs MAY use any combination of locally owned components, npm UI libraries, or no UI library at all.

#### Scenario: MFE uses locally owned shadcn components

- **WHEN** an MFE includes a local `components/ui/` directory with shadcn component files
- **THEN** the MFE SHALL function correctly without `@hai3/uikit` as a dependency
- **AND** the local components SHALL use CSS custom properties inherited from the host theme

#### Scenario: MFE uses a third-party npm UI library

- **WHEN** an MFE imports UI components from a third-party npm package (e.g., Mantine, Chakra)
- **THEN** the MFE SHALL function correctly without `@hai3/uikit` as a dependency
- **AND** the MFE developer SHALL be responsible for mapping host CSS variables to the library's theming mechanism

#### Scenario: MFE uses no UI library

- **WHEN** an MFE renders raw HTML elements styled with Tailwind or custom CSS
- **THEN** the MFE SHALL function correctly without any UI library dependency
- **AND** the MFE SHALL have access to host theme CSS custom properties via inheritance or mount manager injection

### Requirement: @hai3/uikit is not a shared MFE federation dependency

`@hai3/uikit` SHALL NOT be listed as a required shared dependency in MFE federation configuration. MFEs SHALL NOT rely on `@hai3/uikit` being available at runtime via the federation shared scope.

#### Scenario: New MFE federation configuration omits @hai3/uikit

- **WHEN** configuring shared dependencies for a new MFE
- **THEN** `@hai3/uikit` SHALL NOT be included in the shared dependencies list
- **AND** the MFE SHALL function correctly without it

#### Scenario: Existing MFE removes @hai3/uikit from shared dependencies

- **WHEN** migrating an existing MFE to the new model
- **THEN** removing `@hai3/uikit` from the shared dependencies list SHALL NOT break the MFE's federation loading
- **AND** the MFE SHALL bundle any UI components it uses locally or resolve them from its own `node_modules`

### Requirement: UiKitComponent enum and UiKitComponentMap are not enforced

The framework SHALL NOT enforce the `UiKitComponent` enum, `UiKitComponentMap`, or any component contract types from `@hai3/uikit`. MFE components are free to use any props and types.

#### Scenario: MFE defines its own component types

- **WHEN** an MFE creates or imports UI components
- **THEN** the components SHALL NOT be required to match `UiKitComponent` enum values
- **AND** the components SHALL NOT be required to implement props defined by `UiKitComponentMap`
- **AND** the framework SHALL not validate component types at registration or runtime

### Requirement: Blank-MFE template provides starter shadcn components

The blank-MFE template SHALL include a `components/ui/` directory with a representative set of locally owned shadcn components as a starting point.

#### Scenario: New MFE from blank template includes local components

- **WHEN** creating a new MFE from the blank-MFE template
- **THEN** the template SHALL include a `components/ui/` directory
- **AND** it SHALL contain at minimum: `button.tsx`, `card.tsx`, `skeleton.tsx`
- **AND** each component file SHALL be a self-contained shadcn component using `class-variance-authority` and the `cn()` utility
- **AND** the template SHALL include a `lib/utils.ts` file with the `cn()` utility function

#### Scenario: Blank-MFE template has no @hai3/uikit dependency

- **WHEN** inspecting the blank-MFE template's package.json
- **THEN** `@hai3/uikit` SHALL NOT appear in `dependencies` or `peerDependencies`
- **AND** no import statements in the template SHALL reference `@hai3/uikit`

### Requirement: Blank-MFE template has no ThemeAwareReactLifecycle or themes.ts

The blank-MFE template SHALL NOT include `ThemeAwareReactLifecycle`, `themes.ts`, or any MFE-side theme resolution logic. Theme delivery is handled by the host and mount manager.

#### Scenario: Template lifecycle has no theme subscription boilerplate

- **WHEN** inspecting the blank-MFE template's lifecycle class
- **THEN** it SHALL NOT subscribe to `HAI3_SHARED_PROPERTY_THEME` for CSS variable injection
- **AND** it SHALL NOT call `applyThemeToShadowRoot` or any theme injection utility
- **AND** no `themes.ts` or theme resolution module SHALL exist in the template

### Requirement: Demo-MFE migrates to locally owned components

The demo-MFE SHALL replace all `@hai3/uikit` imports with locally owned shadcn component files. The demo-MFE SHALL be fully functional without `@hai3/uikit` as a dependency.

#### Scenario: Demo-MFE imports resolve to local components

- **WHEN** inspecting the demo-MFE source
- **THEN** no import statements SHALL reference `@hai3/uikit`
- **AND** all UI components SHALL be imported from local paths within the MFE
- **AND** the demo-MFE SHALL build and render correctly
