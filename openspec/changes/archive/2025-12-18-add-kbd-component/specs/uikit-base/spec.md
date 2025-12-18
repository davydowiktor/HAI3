## ADDED Requirements

### Requirement: Kbd Component

The UI kit SHALL provide Kbd and KbdGroup components in the `@hai3/uikit` package for displaying keyboard shortcuts and key combinations in a styled inline format.

#### Scenario: Kbd components are available

- **WHEN** importing Kbd from `@hai3/uikit`
- **THEN** Kbd and KbdGroup components are available
- **AND** the components support standard HTML kbd/div element props

#### Scenario: Kbd styling

- **WHEN** using Kbd component
- **THEN** the element displays with inline-flex layout and centered content
- **AND** the element has bg-muted and text-muted-foreground styling
- **AND** the element has h-5, min-w-5, rounded-sm, and px-1 sizing
- **AND** the element has text-xs, font-medium, and font-sans typography
- **AND** the element has pointer-events-none and select-none interaction styles
- **AND** icons within have consistent sizing (size-3)
- **AND** the element has data-slot="kbd" attribute

#### Scenario: Kbd in tooltip context

- **WHEN** Kbd is used inside a tooltip content (data-slot="tooltip-content")
- **THEN** the Kbd has bg-background/20 and text-background styling for contrast
- **AND** in dark mode, the Kbd has bg-background/10 styling

#### Scenario: KbdGroup container

- **WHEN** using KbdGroup to wrap multiple Kbd elements
- **THEN** the container displays with inline-flex layout
- **AND** the container has gap-1 spacing between items
- **AND** the container has data-slot="kbd-group" attribute

### Requirement: Kbd Demo Examples

The UI kit demo SHALL provide examples for the Kbd component in the Data Display category demonstrating basic usage, groups, buttons, tooltips, and input groups.

#### Scenario: Kbd section in DataDisplayElements

- **WHEN** viewing the Data Display category
- **THEN** a Kbd section is displayed with heading and examples
- **AND** the section includes data-element-id="element-kbd" for navigation

#### Scenario: Kbd examples use translations

- **WHEN** Kbd examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Kbd example content

- **WHEN** viewing the Kbd section
- **THEN** a basic Kbd example with single keys is shown
- **AND** a KbdGroup example with multiple key combinations is shown
- **AND** a Kbd in buttons example is shown
- **AND** a Kbd in tooltips example is shown
- **AND** a Kbd in input group example is shown

### Requirement: Kbd in Category System

The UI kit element registry SHALL include 'Kbd' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Data Display category.

#### Scenario: Category Menu Shows Kbd

- **WHEN** viewing the UIKit category menu
- **THEN** Kbd appears as an implemented element in Data Display category
- **AND** Kbd is positioned alphabetically among other data display elements

### Requirement: Kbd Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `kbd_heading` - Section heading
- `kbd_basic_label` - Basic example label
- `kbd_group_label` - Group example label
- `kbd_button_label` - Button example label
- `kbd_tooltip_label` - Tooltip example label
- `kbd_input_label` - Input group example label

#### Scenario: Translated Kbd Labels

- **WHEN** viewing the Kbd demo in a non-English language
- **THEN** all Kbd labels display in the selected language
- **AND** translations are contextually appropriate for keyboard shortcut terminology
