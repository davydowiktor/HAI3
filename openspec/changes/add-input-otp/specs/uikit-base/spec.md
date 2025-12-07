# Input OTP Spec Delta

## ADDED Requirements

### Requirement: Input OTP Component

The system SHALL provide an Input OTP component in the `@hai3/uikit` package for one-time password and verification code inputs, built on the input-otp library.

#### Scenario: Input OTP component is available

- **WHEN** importing InputOTP from `@hai3/uikit`
- **THEN** the InputOTP component and its sub-components are available
- **AND** components include: InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator

#### Scenario: Input OTP slot rendering

- **WHEN** using InputOTPSlot with an index
- **THEN** each slot displays a single character input area
- **AND** active slots show focus ring styling
- **AND** slots support fake caret animation when focused

#### Scenario: Input OTP group rendering

- **WHEN** using InputOTPGroup to wrap slots
- **THEN** slots are visually grouped together
- **AND** first slot has left rounded corners, last slot has right rounded corners

#### Scenario: Input OTP separator rendering

- **WHEN** using InputOTPSeparator between groups
- **THEN** a visual separator (minus icon) is displayed
- **AND** the separator uses the internal MinusIcon component

#### Scenario: Input OTP pattern support

- **WHEN** using InputOTP with pattern prop (e.g., REGEXP_ONLY_DIGITS_AND_CHARS)
- **THEN** input is restricted to matching characters
- **AND** invalid characters are rejected

#### Scenario: Input OTP controlled mode

- **WHEN** using InputOTP with value and onChange props
- **THEN** the component operates in controlled mode
- **AND** parent component can read and update the OTP value

### Requirement: Input OTP Demo Examples

The system SHALL provide Input OTP examples in the Forms & Inputs category of the UI Kit demo.

#### Scenario: Input OTP section in FormElements

- **WHEN** viewing the Forms & Inputs category
- **THEN** an Input OTP section is displayed with heading and examples
- **AND** the section includes data-element-id="element-input-otp" for navigation

#### Scenario: Input OTP examples use translations

- **WHEN** Input OTP examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple Input OTP examples

- **WHEN** viewing the Input OTP section
- **THEN** at least 3 examples are shown: basic pattern, with separator, controlled
- **AND** each example has a descriptive label
- **AND** controlled example shows current input value

### Requirement: Input OTP in Category System

The system SHALL include Input OTP as an implemented element in the Forms & Inputs category.

#### Scenario: Input OTP in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Input OTP' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Input OTP appears in the Forms & Inputs category navigation menu

### Requirement: Input OTP Translations

The system SHALL provide Input OTP translations across all supported languages (36 languages).

#### Scenario: Input OTP translation keys

- **WHEN** Input OTP component is used in the demo
- **THEN** translation keys exist for all Input OTP elements
- **AND** keys include: input_otp_heading, input_otp_basic_label, input_otp_separator_label, input_otp_controlled_label, input_otp_enter_code, input_otp_entered

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Input OTP translation keys
