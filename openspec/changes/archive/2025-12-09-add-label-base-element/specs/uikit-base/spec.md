## ADDED Requirements

### Requirement: Label Component

The UI kit SHALL provide a `Label` component built on `@radix-ui/react-label` for associating text labels with form controls, with proper ARIA accessibility and styling that responds to form control states.

#### Scenario: Label component is available

- **WHEN** importing Label from `@hai3/uikit`
- **THEN** the Label component is available for use
- **AND** component supports all standard Radix label props including htmlFor for form control association

#### Scenario: Label with form control association

- **WHEN** a Label is associated with an input using htmlFor prop
- **THEN** clicking the label focuses the associated form control
- **AND** screen readers announce the label when the control is focused

#### Scenario: Label disabled state handling

- **WHEN** a Label is associated with a disabled form control
- **THEN** the label shows disabled styling (opacity, cursor)
- **AND** the label respects the peer-disabled state classes

#### Scenario: Label with group disabled state

- **WHEN** a Label is within a disabled form group
- **THEN** the label shows disabled styling via group-data-[disabled] classes
- **AND** pointer events are disabled appropriately

### Requirement: Label Demo Examples

The UI kit demo SHALL provide examples for the Label component in the Forms & Inputs category demonstrating default label usage, required indicators, description text, disabled states, and error states, using `tk()` for translations.

#### Scenario: Demo Example Display

- **WHEN** viewing the Forms & Inputs category in UIKitElementsScreen
- **THEN** a Label section is displayed with heading and examples
- **AND** the section includes `data-element-id="element-label"` for navigation
- **AND** examples show labels paired with various form controls (Input, Select, Checkbox, etc.)

#### Scenario: Label examples showcase different states

- **WHEN** viewing the Label demo section
- **THEN** examples demonstrate:
  - Default label with input field
  - Label with required indicator (asterisk or text)
  - Label with description/helper text
  - Label with disabled form control
  - Label with error/invalid state

### Requirement: Label in Category System

The UI kit element registry SHALL include 'Label' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Label

- **WHEN** viewing the UIKit category menu
- **THEN** Label appears as an implemented element in Forms & Inputs category
- **AND** Label is positioned appropriately among other form elements

### Requirement: Label Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `label_heading` - Section heading
- `label_default_label` - Default example label
- `label_required_label` - Required example label
- `label_with_description_label` - Example with description label
- `label_disabled_label` - Disabled example label
- `label_error_label` - Error state example label
- `label_required_indicator` - Required indicator text/asterisk
- `label_description_text` - Helper/description text example
- `label_error_message` - Error message example

#### Scenario: Translated Label Text

- **WHEN** viewing the label demo in a non-English language
- **THEN** all label text, descriptions, and error messages display in the selected language
- **AND** translations are contextually appropriate for form labeling conventions
