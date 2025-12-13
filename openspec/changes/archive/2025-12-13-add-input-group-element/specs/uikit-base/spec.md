## ADDED Requirements

### Requirement: Input Group Component

The UI kit SHALL provide InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, and InputGroupTextarea components for composing enhanced input fields with addons, buttons, and labels.

#### Scenario: Input Group component is available

- **WHEN** importing InputGroup from `@hai3/uikit`
- **THEN** all Input Group sub-components are available: InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea
- **AND** components support all standard React component props

#### Scenario: InputGroup container

- **WHEN** using InputGroup to wrap input and addon components
- **THEN** the container displays with border, rounded corners, and shadow
- **AND** the container has role="group" for accessibility
- **AND** the container adapts height for textarea (h-auto)
- **AND** the container responds to focus states on child inputs
- **AND** the container shows error state when child has aria-invalid="true"

#### Scenario: InputGroupAddon with alignment variants

- **WHEN** using InputGroupAddon with align="inline-start"
- **THEN** the addon appears on the left side of the input
- **AND** the addon has order-first and pl-3 padding
- **WHEN** using InputGroupAddon with align="inline-end"
- **THEN** the addon appears on the right side of the input
- **AND** the addon has order-last and pr-3 padding
- **WHEN** using InputGroupAddon with align="block-start"
- **THEN** the addon appears above the input
- **AND** the container becomes flex-col with h-auto
- **AND** the addon has w-full and pt-3 padding
- **WHEN** using InputGroupAddon with align="block-end"
- **THEN** the addon appears below the input
- **AND** the container becomes flex-col with h-auto
- **AND** the addon has w-full and pb-3 padding

#### Scenario: InputGroupButton with size variants

- **WHEN** using InputGroupButton with size="xs"
- **THEN** the button displays with h-6 and compact padding
- **WHEN** using InputGroupButton with size="sm"
- **THEN** the button displays with h-8 and standard padding
- **WHEN** using InputGroupButton with size="icon-xs"
- **THEN** the button displays as size-6 square icon button
- **WHEN** using InputGroupButton with size="icon-sm"
- **THEN** the button displays as size-8 square icon button
- **AND** the button supports all Button variants (ghost, secondary, default, etc.)

#### Scenario: InputGroupText component

- **WHEN** using InputGroupText component
- **THEN** the text displays with text-muted-foreground styling
- **AND** the text has text-sm font size
- **AND** icons within text have proper sizing and pointer-events-none

#### Scenario: InputGroupInput component

- **WHEN** using InputGroupInput component
- **THEN** the input integrates with InputGroup container
- **AND** the input has no border (border-0)
- **AND** the input has transparent background
- **AND** the input has no shadow
- **AND** the input has no focus ring (focus-visible:ring-0)
- **AND** the input takes flex-1 to fill available space
- **AND** the input has data-slot="input-group-control" for focus state management

#### Scenario: InputGroupTextarea component

- **WHEN** using InputGroupTextarea component
- **THEN** the textarea integrates with InputGroup container
- **AND** the textarea has no border (border-0)
- **AND** the textarea has transparent background
- **AND** the textarea has no shadow
- **AND** the textarea has no focus ring (focus-visible:ring-0)
- **AND** the textarea has resize-none
- **AND** the textarea takes flex-1 to fill available space
- **AND** the textarea has data-slot="input-group-control" for focus state management

#### Scenario: InputGroup focus state

- **WHEN** a child input with data-slot="input-group-control" receives focus
- **THEN** the InputGroup container shows focus ring (border-ring, ring-ring/50, ring-[3px])
- **AND** the focus state is visually distinct

#### Scenario: InputGroup error state

- **WHEN** a child component has aria-invalid="true"
- **THEN** the InputGroup container shows error styling (ring-destructive/20, border-destructive)
- **AND** dark mode shows ring-destructive/40

#### Scenario: InputGroupAddon click behavior

- **WHEN** clicking on InputGroupAddon that doesn't contain a button
- **THEN** the associated input receives focus
- **AND** clicking on a button within addon does not trigger input focus

### Requirement: Input Group Demo Examples

The UI kit demo SHALL provide examples for the Input Group component in the Forms & Inputs category demonstrating button addons, icon buttons, label addons, and textarea with addons, using `tk()` for translations.

#### Scenario: Input Group section in FormElements

- **WHEN** viewing the Forms & Inputs category
- **THEN** an Input Group section is displayed with heading and examples
- **AND** the section includes data-element-id="element-input-group" for navigation

#### Scenario: Input Group examples use translations

- **WHEN** Input Group examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple Input Group examples

- **WHEN** viewing the Input Group section
- **THEN** examples demonstrate:
  - Input with button addon (copy, search)
  - Input with icon button addon (info, favorite)
  - Input with label addon (inline and block alignment)
  - Textarea with addons (code editor style with multiple addons)

### Requirement: Input Group in Category System

The UI kit element registry SHALL include 'Input Group' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Input Group

- **WHEN** viewing the UIKit category menu
- **THEN** Input Group appears as an implemented element in Forms & Inputs category
- **AND** Input Group is positioned appropriately among other form elements

### Requirement: Input Group Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `input_group_heading` - Section heading
- `input_group_button_label` - Button addon example label
- `input_group_icon_label` - Icon button addon example label
- `input_group_label_label` - Label addon example label
- `input_group_textarea_label` - Textarea example label
- Additional keys for example content (placeholders, button labels, tooltips)

#### Scenario: Translated Input Group Labels

- **WHEN** viewing the Input Group demo in a non-English language
- **THEN** all Input Group labels, placeholders, button text, and tooltips display in the selected language
- **AND** translations are contextually appropriate for form conventions

