## ADDED Requirements

### Requirement: Item Component

The UI kit SHALL provide Item, ItemGroup, ItemSeparator, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader, and ItemFooter components for displaying structured content with media, title, description, and actions.

#### Scenario: Item component is available

- **WHEN** importing Item from `@hai3/uikit`
- **THEN** all Item sub-components are available: Item, ItemGroup, ItemSeparator, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader, ItemFooter
- **AND** components support all standard React component props

#### Scenario: Item with variant prop

- **WHEN** using Item with variant="default"
- **THEN** the item has transparent background and transparent border
- **WHEN** using Item with variant="outline"
- **THEN** the item has visible border using border-border token
- **WHEN** using Item with variant="muted"
- **THEN** the item has muted background using bg-muted/50 token

#### Scenario: Item with size prop

- **WHEN** using Item with size="default"
- **THEN** the item has padding p-4 and gap-4
- **WHEN** using Item with size="sm"
- **THEN** the item has padding py-3 px-4 and gap-2.5

#### Scenario: Item with asChild prop

- **WHEN** using Item with asChild={true}
- **THEN** the Item uses Slot component to merge props with child element
- **WHEN** using Item with asChild={false} or omitted
- **THEN** the Item renders as a div element

#### Scenario: ItemGroup container

- **WHEN** using ItemGroup to wrap multiple Item components
- **THEN** items are grouped in a flex column layout
- **AND** the container has role="list" and data-slot="item-group" attributes

#### Scenario: ItemSeparator between items

- **WHEN** using ItemSeparator between Item components
- **THEN** a horizontal separator is rendered
- **AND** the separator uses the Separator component with horizontal orientation
- **AND** the separator has my-0 margin

#### Scenario: ItemMedia with variant

- **WHEN** using ItemMedia with variant="default"
- **THEN** the media container has transparent background
- **WHEN** using ItemMedia with variant="icon"
- **THEN** the media container has size-8, border, rounded-sm, and bg-muted styling
- **WHEN** using ItemMedia with variant="image"
- **THEN** the media container has size-10, rounded-sm, and overflow-hidden styling

#### Scenario: ItemContent wrapper

- **WHEN** using ItemContent to wrap ItemTitle and ItemDescription
- **THEN** the content is displayed in a flex column with gap-1
- **AND** the content takes flex-1 to fill available space

#### Scenario: ItemTitle display

- **WHEN** using ItemTitle component
- **THEN** the title is displayed with text-sm, leading-snug, and font-medium styling
- **AND** the title has w-fit and items-center gap-2 layout

#### Scenario: ItemDescription display

- **WHEN** using ItemDescription component
- **THEN** the description is displayed with text-muted-foreground, line-clamp-2, and text-sm styling
- **AND** links within description have hover:text-primary and underline styling

#### Scenario: ItemActions container

- **WHEN** using ItemActions to wrap action buttons
- **THEN** actions are displayed in a flex row with gap-2
- **AND** actions are aligned with items-center

#### Scenario: ItemHeader and ItemFooter

- **WHEN** using ItemHeader or ItemFooter
- **THEN** the header/footer spans full width with basis-full
- **AND** content is arranged with flex items-center justify-between gap-2

#### Scenario: Item focus and hover states

- **WHEN** Item is rendered as a link (via asChild)
- **THEN** hovering shows bg-accent/50 background
- **AND** focus-visible shows border-ring and ring-ring/50 ring-[3px] styling

### Requirement: Item Demo Examples

The UI kit demo SHALL provide examples for the Item component in the Data Display category demonstrating basic item, variants, sizes, groups, and different media types, using `tk()` for translations.

#### Scenario: Item section in DataDisplayElements

- **WHEN** viewing the Data Display category
- **THEN** an Item section is displayed with heading and examples
- **AND** the section includes data-element-id="element-item" for navigation

#### Scenario: Item examples use translations

- **WHEN** Item examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple Item examples

- **WHEN** viewing the Item section
- **THEN** examples demonstrate:
  - Basic item with media, title, description, and actions
  - Item with different variants (default, outline, muted)
  - Item with different sizes (default, sm)
  - ItemGroup with multiple items and separators
  - Item with header and footer sections
  - Item with icon media variant
  - Item with image media variant

### Requirement: Item in Category System

The UI kit element registry SHALL include 'Item' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Data Display category.

#### Scenario: Category Menu Shows Item

- **WHEN** viewing the UIKit category menu
- **THEN** Item appears as an implemented element in Data Display category
- **AND** Item is positioned appropriately among other data display elements

### Requirement: Item Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `item_heading` - Section heading
- `item_basic_label` - Basic example label
- `item_variant_default_label` - Default variant example label
- `item_variant_outline_label` - Outline variant example label
- `item_variant_muted_label` - Muted variant example label
- `item_size_default_label` - Default size example label
- `item_size_sm_label` - Small size example label
- `item_group_label` - Item group example label
- `item_with_header_footer_label` - Header/footer example label
- `item_icon_media_label` - Icon media example label
- `item_image_media_label` - Image media example label
- Additional keys for example content (titles, descriptions, action labels)

#### Scenario: Translated Item Labels

- **WHEN** viewing the Item demo in a non-English language
- **THEN** all Item labels, titles, descriptions, and action text display in the selected language
- **AND** translations are contextually appropriate for content display conventions


