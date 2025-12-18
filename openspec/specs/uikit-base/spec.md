# UI Kit Base Components

## Purpose

Provides a collection of base UI components for the @hai3/uikit package, including data visualization with charts built on Recharts library.
## Requirements
### Requirement: Chart Component

The system SHALL provide a Chart component in the `@hai3/uikit` package for data visualization, built on Recharts library.

#### Scenario: Chart component is available

- **WHEN** importing Chart from `@hai3/uikit`
- **THEN** the Chart component and its sub-components are available
- **AND** components include: ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent

#### Scenario: Line chart rendering

- **WHEN** using Chart with LineChart and Line components from Recharts
- **THEN** a line chart is rendered with customizable colors and data points
- **AND** the chart is responsive and adapts to container width

#### Scenario: Bar chart rendering

- **WHEN** using Chart with BarChart and Bar components from Recharts
- **THEN** a bar chart is rendered with customizable colors and data
- **AND** the chart supports multiple bars per data point

#### Scenario: Area chart rendering

- **WHEN** using Chart with AreaChart and Area components from Recharts
- **THEN** an area chart is rendered with gradient fills
- **AND** the chart displays smooth curves

#### Scenario: Pie chart rendering

- **WHEN** using Chart with PieChart and Pie components from Recharts
- **THEN** a pie chart is rendered with color-coded segments
- **AND** the chart displays labels and percentages

### Requirement: Chart Demo Examples

The system SHALL provide Chart examples in the Data Display Elements section of the UI Kit demo.

#### Scenario: Chart section in DataDisplayElements

- **WHEN** viewing the Data Display category
- **THEN** a Chart section is displayed with heading and examples
- **AND** the section includes data-element-id="element-chart" for navigation

#### Scenario: Chart examples use translations

- **WHEN** Chart examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component
- **AND** no translation keys are displayed (values are shown)

#### Scenario: Multiple chart type examples

- **WHEN** viewing the Chart section
- **THEN** at least 4 chart type examples are shown: Line, Bar, Area, and Pie
- **AND** each example has a descriptive label
- **AND** each chart displays sample data appropriately

### Requirement: Chart in Category System

The system SHALL include Chart as an implemented element in the Data Display category.

#### Scenario: Chart in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Chart' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Chart appears in the Data Display category navigation menu

#### Scenario: Chart element ordering

- **WHEN** viewing the Data Display category
- **THEN** Chart is positioned appropriately among other data display elements
- **AND** the navigation menu reflects the correct order

### Requirement: Chart Translations

The system SHALL provide Chart translations across all supported languages (36 languages).

#### Scenario: Chart translation keys

- **WHEN** Chart component is used in the demo
- **THEN** translation keys exist for all Chart elements
- **AND** keys include: chart_heading, chart_line_label, chart_bar_label, chart_area_label, chart_pie_label

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Chart translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Drawer Component

The system SHALL provide a Drawer component in the `@hai3/uikit` package for mobile-friendly overlay panels, built on the vaul library.

#### Scenario: Drawer component is available

- **WHEN** importing Drawer from `@hai3/uikit`
- **THEN** the Drawer component and its sub-components are available
- **AND** components include: Drawer, DrawerTrigger, DrawerPortal, DrawerOverlay, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription

#### Scenario: Drawer supports multiple directions

- **WHEN** using DrawerContent with direction prop
- **THEN** the drawer can slide from bottom, top, left, or right
- **AND** each direction has appropriate styling and animations

#### Scenario: Drawer has touch gesture support

- **WHEN** using Drawer on touch devices
- **THEN** the drawer supports drag-to-dismiss gestures
- **AND** the drawer shows a visual drag handle for bottom direction

#### Scenario: Drawer styling follows theme

- **WHEN** rendering Drawer components
- **THEN** the overlay uses theme-aware background opacity
- **AND** the content uses bg-background, border-border, and text-foreground tokens
- **AND** all animations are smooth (animate-in/animate-out)

### Requirement: Drawer Demo Examples

The system SHALL provide Drawer examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: Drawer section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** a Drawer section is displayed with heading and examples
- **AND** the section includes data-element-id="element-drawer" for navigation

#### Scenario: Drawer section ordering

- **WHEN** viewing the Layout & Structure category
- **THEN** the Drawer section appears after Dialog and before Sheet
- **AND** the order matches the category elements order: Card, Dialog, Drawer, Sheet

#### Scenario: Drawer examples use translations

- **WHEN** Drawer examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple drawer direction examples

- **WHEN** viewing the Drawer section
- **THEN** at least one example demonstrating drawer functionality is shown
- **AND** the example includes a trigger button and content with header/footer

### Requirement: Drawer in Category System

The system SHALL include Drawer as an implemented element in the Layout & Structure category.

#### Scenario: Drawer in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Drawer' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Drawer appears in the Layout & Structure category navigation menu

### Requirement: Drawer Translations

The system SHALL provide Drawer translations across all supported languages (36 languages).

#### Scenario: Drawer translation keys

- **WHEN** Drawer component is used in the demo
- **THEN** translation keys exist for all Drawer elements
- **AND** keys include: drawer_heading, drawer_open, drawer_title, drawer_description, drawer_close

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Drawer translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Aspect Ratio Component

The system SHALL provide an AspectRatio component in the `@hai3/uikit` package for maintaining consistent width-to-height ratios, built on @radix-ui/react-aspect-ratio.

#### Scenario: AspectRatio component is available

- **WHEN** importing AspectRatio from `@hai3/uikit`
- **THEN** the AspectRatio component is available for use

#### Scenario: AspectRatio accepts ratio prop

- **WHEN** using AspectRatio with a ratio prop (e.g., 16/9, 4/3, 1)
- **THEN** the container maintains the specified aspect ratio
- **AND** child content fills the container proportionally

#### Scenario: AspectRatio with images

- **WHEN** placing an image inside AspectRatio
- **THEN** the image is constrained to the specified ratio
- **AND** the image can use object-fit for positioning

### Requirement: Aspect Ratio Demo Examples

The system SHALL provide AspectRatio examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: AspectRatio section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** an Aspect Ratio section is displayed with heading and examples
- **AND** the section includes data-element-id="element-aspect-ratio" for navigation

#### Scenario: AspectRatio section ordering

- **WHEN** viewing the Layout & Structure category
- **THEN** the Aspect Ratio section appears first (before Card)
- **AND** the order matches the category elements order

#### Scenario: AspectRatio examples use translations

- **WHEN** AspectRatio examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple aspect ratio examples

- **WHEN** viewing the Aspect Ratio section
- **THEN** examples demonstrate common ratios (16:9, 1:1)
- **AND** each example shows visual content within the ratio container

### Requirement: Aspect Ratio in Category System

The system SHALL include Aspect Ratio as an implemented element in the Layout & Structure category.

#### Scenario: Aspect Ratio in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Aspect Ratio' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Aspect Ratio appears in the Layout & Structure category navigation menu

### Requirement: Aspect Ratio Translations

The system SHALL provide Aspect Ratio translations across all supported languages (36 languages).

#### Scenario: Aspect Ratio translation keys

- **WHEN** AspectRatio component is used in the demo
- **THEN** translation keys exist for all AspectRatio elements
- **AND** keys include: aspect_ratio_heading, aspect_ratio_16_9_label, aspect_ratio_1_1_label

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Aspect Ratio translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Resizable Component

The system SHALL provide a Resizable component in the `@hai3/uikit` package for creating resizable panel layouts, built on react-resizable-panels library.

#### Scenario: Resizable component is available

- **WHEN** importing Resizable from `@hai3/uikit`
- **THEN** the Resizable component and its sub-components are available
- **AND** components include: ResizablePanelGroup, ResizablePanel, ResizableHandle

#### Scenario: Horizontal resizable layout

- **WHEN** using ResizablePanelGroup with direction="horizontal"
- **THEN** panels are arranged horizontally
- **AND** ResizableHandle allows resizing panels by dragging

#### Scenario: Vertical resizable layout

- **WHEN** using ResizablePanelGroup with direction="vertical"
- **THEN** panels are arranged vertically
- **AND** ResizableHandle allows resizing panels by dragging

#### Scenario: ResizableHandle with visible grip

- **WHEN** using ResizableHandle with withHandle prop set to true
- **THEN** a visible grip icon is displayed on the handle
- **AND** the grip rotates 90 degrees for vertical layouts

#### Scenario: Resizable styling follows theme

- **WHEN** rendering Resizable components
- **THEN** the handle uses bg-border for the divider line
- **AND** the grip uses bg-border and border-border tokens
- **AND** focus states use ring-ring for accessibility

### Requirement: Resizable Demo Examples

The system SHALL provide Resizable examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: Resizable section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** a Resizable section is displayed with heading and examples
- **AND** the section includes data-element-id="element-resizable" for navigation

#### Scenario: Resizable section ordering

- **WHEN** viewing the Layout & Structure category
- **THEN** the Resizable section appears after Drawer and before Sheet
- **AND** the order matches the category elements order

#### Scenario: Resizable examples use translations

- **WHEN** Resizable examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple resizable examples

- **WHEN** viewing the Resizable section
- **THEN** three examples are shown: horizontal with grip handle, vertical without handle, and nested layout
- **AND** nested layout demonstrates horizontal panel containing vertical panels

### Requirement: Resizable in Category System

The system SHALL include Resizable as an implemented element in the Layout & Structure category.

#### Scenario: Resizable in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Resizable' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Resizable appears in the Layout & Structure category navigation menu

### Requirement: Resizable Translations

The system SHALL provide Resizable translations across all supported languages (36 languages).

#### Scenario: Resizable translation keys

- **WHEN** Resizable component is used in the demo
- **THEN** translation keys exist for all Resizable elements
- **AND** keys include: resizable_heading, resizable_horizontal_label, resizable_vertical_label, resizable_nested_label, resizable_panel_one, resizable_panel_two, resizable_panel_three

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Resizable translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Scroll Area Component

The system SHALL provide a Scroll Area component in the `@hai3/uikit` package for creating custom scrollable containers with styled scrollbars, built on @radix-ui/react-scroll-area.

#### Scenario: Scroll Area component is available

- **WHEN** importing ScrollArea from `@hai3/uikit`
- **THEN** the ScrollArea and ScrollBar components are available
- **AND** ScrollArea provides a custom scrollable viewport
- **AND** ScrollBar provides styled scrollbar with configurable orientation

#### Scenario: Vertical scroll support

- **WHEN** using ScrollArea with content taller than the container
- **THEN** a vertical scrollbar appears automatically
- **AND** the scrollbar uses theme-aware styling with bg-border token

#### Scenario: Horizontal scroll support

- **WHEN** using ScrollArea with ScrollBar orientation="horizontal"
- **THEN** a horizontal scrollbar appears for wide content
- **AND** the scrollbar is styled consistently with vertical scrollbars

#### Scenario: Scroll Area styling follows theme

- **WHEN** rendering ScrollArea components
- **THEN** the scrollbar thumb uses bg-border token
- **AND** the viewport supports focus-visible ring styling
- **AND** all animations are smooth transitions

### Requirement: Scroll Area Demo Examples

The system SHALL provide Scroll Area examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: Scroll Area section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** a Scroll Area section is displayed with heading and examples
- **AND** the section includes data-element-id="element-scroll-area" for navigation

#### Scenario: Scroll Area examples use translations

- **WHEN** Scroll Area examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple scroll area examples

- **WHEN** viewing the Scroll Area section
- **THEN** two examples are shown: vertical scroll and horizontal scroll
- **AND** vertical example shows a list of items in a bounded height container
- **AND** horizontal example shows horizontally scrolling content with images

### Requirement: Scroll Area in Category System

The system SHALL include Scroll Area as an implemented element in the Layout & Structure category.

#### Scenario: Scroll Area in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Scroll Area' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Scroll Area appears in the Layout & Structure category navigation menu

### Requirement: Scroll Area Translations

The system SHALL provide Scroll Area translations across all supported languages (36 languages).

#### Scenario: Scroll Area translation keys

- **WHEN** Scroll Area component is used in the demo
- **THEN** translation keys exist for all Scroll Area elements
- **AND** keys include: scroll_area_heading, scroll_area_vertical_label, scroll_area_horizontal_label, scroll_area_tags_title, scroll_area_photo_by

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Scroll Area translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Separator Component

The system SHALL provide a Separator component in the `@hai3/uikit` package for visually dividing content sections, built on @radix-ui/react-separator.

#### Scenario: Separator component is available

- **WHEN** importing Separator from `@hai3/uikit`
- **THEN** the Separator component is available
- **AND** it supports horizontal and vertical orientations

#### Scenario: Horizontal separator

- **WHEN** using Separator with default or orientation="horizontal"
- **THEN** a horizontal line is rendered spanning the full width
- **AND** the line uses bg-border token for consistent theming

#### Scenario: Vertical separator

- **WHEN** using Separator with orientation="vertical"
- **THEN** a vertical line is rendered spanning the full height
- **AND** the component uses h-full and w-px styling

#### Scenario: Separator accessibility

- **WHEN** rendering Separator with decorative=true (default)
- **THEN** the separator is marked as decorative for screen readers
- **AND** when decorative=false, it has proper semantic role

### Requirement: Separator Demo Examples

The system SHALL provide Separator examples in the Layout & Structure category of the UI Kit demo.

#### Scenario: Separator section in LayoutElements

- **WHEN** viewing the Layout & Structure category
- **THEN** a Separator section is displayed with heading and examples
- **AND** the section includes data-element-id="element-separator" for navigation

#### Scenario: Separator examples use translations

- **WHEN** Separator examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Separator example content

- **WHEN** viewing the Separator section
- **THEN** the example shows both horizontal and vertical separators
- **AND** horizontal separator divides content blocks
- **AND** vertical separators divide inline items

### Requirement: Separator in Category System

The system SHALL include Separator as an implemented element in the Layout & Structure category.

#### Scenario: Separator in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Separator' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Separator appears in the Layout & Structure category navigation menu

### Requirement: Separator Translations

The system SHALL provide Separator translations across all supported languages (36 languages).

#### Scenario: Separator translation keys

- **WHEN** Separator component is used in the demo
- **THEN** translation keys exist for all Separator elements
- **AND** keys include: separator_heading, separator_title, separator_description, separator_blog, separator_docs, separator_source

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Separator translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Breadcrumb Component
The UI kit SHALL provide Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, and BreadcrumbEllipsis components for building accessible navigation breadcrumbs with customizable separators, aria labels, and slot support for custom link components.

#### Scenario: Basic Breadcrumb Navigation
Given a user viewing a deeply nested page
When the breadcrumb component is rendered
Then the breadcrumb displays the navigation hierarchy with proper ARIA attributes

### Requirement: Breadcrumb Demo Examples
The UI kit demo SHALL provide examples for the Breadcrumb component in the Navigation category including:
- Default breadcrumb with custom separator (slash instead of chevron)
- Dropdown breadcrumb showing collapsed items in a dropdown menu

All examples SHALL use the `tk()` helper for translations.

#### Scenario: Demo Examples Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Breadcrumb examples are rendered
Then two distinct breadcrumb variations are displayed with appropriate labels

### Requirement: Breadcrumb in Category System
The UI kit element registry SHALL include 'Breadcrumb' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Breadcrumb
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Breadcrumb' appears as an implemented element

### Requirement: Breadcrumb Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `breadcrumb_heading` - Section heading
- `breadcrumb_custom_separator_label` - Custom separator example label
- `breadcrumb_dropdown_label` - Dropdown example label
- `breadcrumb_home` - Home link text
- `breadcrumb_components` - Components link text
- `breadcrumb_breadcrumb` - Breadcrumb page text
- `breadcrumb_documentation` - Documentation link text
- `breadcrumb_themes` - Themes link text
- `breadcrumb_github` - GitHub link text

#### Scenario: Translated Breadcrumb Labels
Given a user viewing the breadcrumb demo in a non-English language
When translations are loaded
Then all breadcrumb labels display in the selected language

### Requirement: Pagination Component
The UI kit SHALL provide Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, and PaginationEllipsis components for building accessible pagination controls with page links, navigation arrows, and ellipsis for truncated page ranges.

#### Scenario: Basic Pagination Navigation
Given a user viewing paginated content
When the pagination component is rendered
Then the pagination displays previous/next controls and page number links with proper ARIA labels

### Requirement: Pagination Demo Example
The UI kit demo SHALL provide an example for the Pagination component in the Navigation category demonstrating previous/next navigation, numbered page links with active state, and ellipsis for truncated ranges, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Pagination example is rendered
Then a functional pagination with numbered pages and navigation controls is displayed

### Requirement: Pagination in Category System
The UI kit element registry SHALL include 'Pagination' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Pagination
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Pagination' appears as an implemented element

### Requirement: Pagination Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `pagination_heading` - Section heading
- `pagination_previous` - Previous button label
- `pagination_next` - Next button label

#### Scenario: Translated Pagination Labels
Given a user viewing the pagination demo in a non-English language
When translations are loaded
Then all pagination labels display in the selected language

### Requirement: Navigation Menu Demo Example
The UI kit demo SHALL provide an example for the Navigation Menu component in the Navigation category demonstrating a horizontal navigation bar with dropdown menus containing links and descriptions, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Navigation Menu example is rendered
Then a functional navigation menu with expandable dropdown sections is displayed

### Requirement: Navigation Menu in Category System
The UI kit element registry SHALL include 'Navigation Menu' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Navigation Menu
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Navigation Menu' appears as an implemented element

### Requirement: Navigation Menu Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `navigation_menu_heading` - Section heading
- `navigation_menu_getting_started` - Getting Started menu trigger
- `navigation_menu_components` - Components menu trigger
- `navigation_menu_documentation` - Documentation link
- `navigation_menu_hai3_desc` - HAI3 description
- `navigation_menu_introduction` - Introduction link title
- `navigation_menu_introduction_desc` - Introduction link description
- `navigation_menu_installation` - Installation link title
- `navigation_menu_installation_desc` - Installation link description
- `navigation_menu_typography` - Typography link title
- `navigation_menu_typography_desc` - Typography link description
- `navigation_menu_alert_dialog` - Alert Dialog link title
- `navigation_menu_alert_dialog_desc` - Alert Dialog link description
- `navigation_menu_hover_card` - Hover Card link title
- `navigation_menu_hover_card_desc` - Hover Card link description
- `navigation_menu_progress` - Progress link title
- `navigation_menu_progress_desc` - Progress link description
- `navigation_menu_scroll_area` - Scroll Area link title
- `navigation_menu_scroll_area_desc` - Scroll Area link description

#### Scenario: Translated Navigation Menu Labels
Given a user viewing the navigation menu demo in a non-English language
When translations are loaded
Then all navigation menu labels display in the selected language

### Requirement: Menubar Component
The UI kit SHALL provide Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent, MenubarShortcut, MenubarGroup, and MenubarPortal components for building desktop-style menu bar interfaces with support for submenus, checkbox items, radio groups, and keyboard navigation.

#### Scenario: Desktop Menu Interface
Given a user viewing an application with a menubar
When the menubar component is rendered
Then the menubar displays menu triggers with accessible dropdown menus and keyboard navigation

### Requirement: Menubar Demo Example
The UI kit demo SHALL provide an example for the Menubar component in the Navigation category demonstrating a complete menu bar with File, Edit, and View menus including submenus, checkboxes, radio items, and keyboard shortcuts using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Menubar example is rendered
Then a functional menu bar with multiple menus and interactive items is displayed

### Requirement: Menubar in Category System
The UI kit element registry SHALL include 'Menubar' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Menubar
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Menubar' appears as an implemented element

### Requirement: Menubar Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `menubar_heading` - Section heading
- `menubar_file` - File menu
- `menubar_edit` - Edit menu
- `menubar_view` - View menu
- `menubar_profiles` - Profiles menu
- `menubar_new_tab` - New Tab item
- `menubar_new_window` - New Window item
- `menubar_new_incognito` - New Incognito Window item (disabled)
- `menubar_share` - Share submenu
- `menubar_email` - Email item
- `menubar_messages` - Messages item
- `menubar_notes` - Notes item
- `menubar_print` - Print item
- `menubar_undo` - Undo item
- `menubar_redo` - Redo item
- `menubar_find` - Find submenu
- `menubar_search_web` - Search the web item
- `menubar_find_file` - Find... item
- `menubar_find_next` - Find Next item
- `menubar_find_previous` - Find Previous item
- `menubar_cut` - Cut item
- `menubar_copy` - Copy item
- `menubar_paste` - Paste item
- `menubar_always_show_bookmarks` - Always Show Bookmarks Bar checkbox
- `menubar_always_show_full_urls` - Always Show Full URLs checkbox
- `menubar_reload` - Reload item
- `menubar_force_reload` - Force Reload item (disabled)
- `menubar_toggle_fullscreen` - Toggle Fullscreen item
- `menubar_hide_sidebar` - Hide Sidebar item
- `menubar_edit_profile` - Edit profile item
- `menubar_add_profile` - Add Profile item

#### Scenario: Translated Menubar Labels
Given a user viewing the menubar demo in a non-English language
When translations are loaded
Then all menubar labels display in the selected language

### Requirement: Tabs Component
The UI kit SHALL provide Tabs, TabsList, TabsTrigger, and TabsContent components built on @radix-ui/react-tabs for organizing content into switchable tabbed panels with proper ARIA accessibility.

#### Scenario: Tab Panel Navigation
Given a user viewing tabbed content
When the user clicks on a tab trigger
Then the corresponding tab content panel is displayed and the trigger shows active state

### Requirement: Tabs Demo Example
The UI kit demo SHALL provide an example for the Tabs component in the Navigation category demonstrating multiple tab panels with form content (Account/Password tabs) using Card, Input, and Button components, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Navigation category in UIKitElementsScreen
When the Tabs example is rendered
Then functional tab panels with form inputs are displayed and switchable

### Requirement: Tabs in Category System
The UI kit element registry SHALL include 'Tabs' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Navigation category.

#### Scenario: Category Menu Shows Tabs
Given a user viewing the UIKit category menu
When the Navigation category is selected
Then 'Tabs' appears as an implemented element

### Requirement: Tabs Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `tabs_heading` - Section heading
- `tabs_account` - Account tab label
- `tabs_password` - Password tab label
- `tabs_account_title` - Account card title
- `tabs_account_description` - Account card description
- `tabs_password_title` - Password card title
- `tabs_password_description` - Password card description
- `tabs_name` - Name field label
- `tabs_username` - Username field label
- `tabs_current_password` - Current password field label
- `tabs_new_password` - New password field label
- `tabs_save_changes` - Save changes button
- `tabs_save_password` - Save password button

#### Scenario: Translated Tabs Labels
Given a user viewing the tabs demo in a non-English language
When translations are loaded
Then all tabs labels and form fields display in the selected language

### Requirement: Input Demo Examples
The UI kit demo SHALL provide examples for the Input component in the Forms & Inputs category demonstrating basic email input, file input, disabled state, and input with label, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Forms & Inputs category in UIKitElementsScreen
When the Input examples are rendered
Then four input variants are displayed: email, file, disabled, and labeled

### Requirement: Input in Category System
The UI kit element registry SHALL include 'Input' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Input
Given a user viewing the UIKit category menu
When the Forms & Inputs category is selected
Then 'Input' appears as an implemented element

### Requirement: Input Demo Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `input_heading` - Section heading
- `input_default_label` - Default input label
- `input_file_label` - File input label
- `input_disabled_label` - Disabled input label
- `input_with_label_label` - Input with label example label
- `input_email_placeholder` - Email placeholder text
- `input_email_label` - Email label text

#### Scenario: Translated Input Labels
Given a user viewing the input demo in a non-English language
When translations are loaded
Then all input labels and placeholders display in the selected language

### Requirement: Textarea Demo Examples
The UI kit demo SHALL provide examples for the Textarea component in the Forms & Inputs category demonstrating default textarea with placeholder and disabled state, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Forms & Inputs category in UIKitElementsScreen
When the Textarea examples are rendered
Then two textarea variants are displayed: default and disabled

### Requirement: Textarea in Category System
The UI kit element registry SHALL include 'Textarea' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Textarea
Given a user viewing the UIKit category menu
When the Forms & Inputs category is selected
Then 'Textarea' appears as an implemented element

### Requirement: Textarea Demo Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `textarea_heading` - Section heading
- `textarea_default_label` - Default textarea label
- `textarea_disabled_label` - Disabled textarea label
- `textarea_placeholder` - Placeholder text

#### Scenario: Translated Textarea Labels
Given a user viewing the textarea demo in a non-English language
When translations are loaded
Then all textarea labels and placeholders display in the selected language

### Requirement: Checkbox Component
The UI kit SHALL provide a Checkbox component built on @radix-ui/react-checkbox for boolean input selection with proper accessibility, checked/unchecked states, and disabled state support.

#### Scenario: Checkbox Toggle
Given a user viewing a form with checkboxes
When the user clicks on a checkbox
Then the checkbox toggles between checked and unchecked states with visual indicator

### Requirement: Checkbox Demo Examples
The UI kit demo SHALL provide examples for the Checkbox component in the Forms & Inputs category demonstrating basic checkbox with label, checked checkbox with description, disabled checkbox, and card-style checkbox with custom styling, using `tk()` for translations.

#### Scenario: Demo Example Display
Given a user viewing the Forms & Inputs category in UIKitElementsScreen
When the Checkbox examples are rendered
Then four checkbox variants are displayed showing different use cases

### Requirement: Checkbox in Category System
The UI kit element registry SHALL include 'Checkbox' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Checkbox
Given a user viewing the UIKit category menu
When the Forms & Inputs category is selected
Then 'Checkbox' appears as an implemented element

### Requirement: Checkbox Translations
The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `checkbox_heading` - Section heading
- `checkbox_basic_label` - Basic example label
- `checkbox_with_text_label` - With text example label
- `checkbox_disabled_label` - Disabled example label
- `checkbox_card_label` - Card style example label
- `checkbox_terms` - Accept terms text
- `checkbox_terms_description` - Terms description text
- `checkbox_notifications` - Enable notifications text
- `checkbox_notifications_description` - Notifications description text

#### Scenario: Translated Checkbox Labels
Given a user viewing the checkbox demo in a non-English language
When translations are loaded
Then all checkbox labels and descriptions display in the selected language

### Requirement: Theme Chart Colors

The Theme contract SHALL include a `chart` color palette for data visualization components.

#### Scenario: Chart colors defined in theme

- **GIVEN** a Theme object
- **WHEN** accessing `theme.colors.chart`
- **THEN** five chart colors are available as `chart.1` through `chart.5`
- **AND** colors use OKLCH format (modern standard for perceptual uniformity)
- **AND** colors are semantically neutral (not tied to success/error/warning semantics)
- **AND** colors are optimized for contrast on the theme's background

#### Scenario: Chart colors available as CSS variables

- **GIVEN** a theme is applied to the application
- **WHEN** reading CSS variables from document root
- **THEN** `--chart-1` through `--chart-5` are available
- **AND** values update when theme changes

#### Scenario: Chart colors adapt to theme changes

- **GIVEN** a chart component using theme chart colors via CSS variables
- **WHEN** the user switches from light to dark theme
- **THEN** chart colors update to the new theme's chart palette
- **AND** chart maintains visual distinction between data series

### Requirement: Radio Group Component

The UI kit SHALL provide `RadioGroup` and `RadioGroupItem` components built on `@radix-ui/react-radio-group` for single-selection from multiple options with proper ARIA accessibility.

#### Scenario: Radio Group component is available

- **WHEN** importing RadioGroup from `@hai3/uikit`
- **THEN** the RadioGroup and RadioGroupItem components are available for use
- **AND** components support all standard Radix radio group props

#### Scenario: Radio item selection

- **WHEN** a user clicks on a RadioGroupItem
- **THEN** that item becomes selected with visual indicator
- **AND** any previously selected item becomes deselected

#### Scenario: Radio Group disabled state

- **WHEN** RadioGroupItem has disabled prop
- **THEN** the item shows disabled styling (opacity, cursor)
- **AND** the item cannot be selected

### Requirement: Radio Group Demo Examples

The UI kit demo SHALL provide examples for the Radio Group component in the Forms & Inputs category demonstrating default radio group, disabled items, and radio items with description text, using `tk()` for translations.

#### Scenario: Demo Example Display

- **WHEN** viewing the Forms & Inputs category in UIKitElementsScreen
- **THEN** a Radio Group section is displayed with heading and examples
- **AND** the section includes `data-element-id="element-radio-group"` for navigation

### Requirement: Radio Group in Category System

The UI kit element registry SHALL include 'Radio Group' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Radio Group

- **WHEN** viewing the UIKit category menu
- **THEN** Radio Group appears as an implemented element in Forms & Inputs category

### Requirement: Radio Group Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `radio_group_heading` - Section heading
- `radio_group_default_label` - Default example label
- `radio_group_disabled_label` - Disabled example label
- `radio_group_with_description_label` - Example with description label
- `radio_group_option_default` - Default option text
- `radio_group_option_comfortable` - Comfortable option text
- `radio_group_option_compact` - Compact option text

#### Scenario: Translated Radio Group Labels

- **WHEN** viewing the radio group demo in a non-English language
- **THEN** all radio group labels and options display in the selected language

### Requirement: Native Select Component

The UI kit SHALL provide `NativeSelect`, `NativeSelectOption`, and `NativeSelectOptGroup` components using native HTML select elements for lightweight dropdown selection with proper styling and accessibility.

#### Scenario: Native Select component is available

- **WHEN** importing NativeSelect from `@hai3/uikit`
- **THEN** the NativeSelect, NativeSelectOption, and NativeSelectOptGroup components are available
- **AND** components support all standard HTML select/option/optgroup props

#### Scenario: Native Select styling

- **WHEN** NativeSelect is rendered
- **THEN** the select has consistent styling with other form inputs
- **AND** a chevron down icon is displayed on the right side
- **AND** native browser appearance is hidden

#### Scenario: Native Select disabled state

- **WHEN** NativeSelect has disabled prop
- **THEN** the select shows disabled styling (opacity, cursor)
- **AND** the select cannot be interacted with

#### Scenario: Native Select invalid state

- **WHEN** NativeSelect has aria-invalid="true"
- **THEN** destructive ring styling is applied
- **AND** the border shows destructive color

### Requirement: Native Select Demo Examples

The UI kit demo SHALL provide examples for the Native Select component in the Forms & Inputs category demonstrating default select, option groups, disabled state, and invalid state, using `tk()` for translations.

#### Scenario: Demo Example Display

- **WHEN** viewing the Forms & Inputs category in UIKitElementsScreen
- **THEN** a Native Select section is displayed with heading and examples
- **AND** the section includes `data-element-id="element-native-select"` for navigation

#### Scenario: Multiple native select examples

- **WHEN** viewing the Native Select section
- **THEN** examples demonstrate: default with options, option groups, disabled, and invalid states
- **AND** each example has a descriptive label using translations

### Requirement: Native Select in Category System

The UI kit element registry SHALL include 'Native Select' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Native Select

- **WHEN** viewing the UIKit category menu
- **THEN** Native Select appears as an implemented element in Forms & Inputs category

### Requirement: Native Select Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `native_select_heading` - Section heading
- `native_select_default_label` - Default example label
- `native_select_groups_label` - Option groups example label
- `native_select_disabled_label` - Disabled example label
- `native_select_invalid_label` - Invalid example label
- `native_select_placeholder` - Placeholder text
- `native_select_department_*` - Department options

#### Scenario: Translated Native Select Labels

- **WHEN** viewing the native select demo in a non-English language
- **THEN** all native select labels and options display in the selected language

### Requirement: Calendar Component

The system SHALL provide a Calendar component in the `@hai3/uikit` package for date selection, built on the react-day-picker library.

#### Scenario: Calendar component is available

- **WHEN** importing Calendar from `@hai3/uikit`
- **THEN** the Calendar component and CalendarDayButton are available
- **AND** the component uses internal icons (ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon)

#### Scenario: Calendar basic rendering

- **WHEN** using Calendar without props
- **THEN** a month calendar grid is rendered with navigation
- **AND** outside days are shown by default
- **AND** the current month is displayed

#### Scenario: Calendar RTL support

- **WHEN** using Calendar in RTL context
- **THEN** navigation chevrons are rotated appropriately
- **AND** layout adapts to right-to-left direction

#### Scenario: Calendar single selection

- **WHEN** using Calendar with mode="single"
- **THEN** clicking a day selects that single date
- **AND** the selected date is visually highlighted

#### Scenario: Calendar range selection

- **WHEN** using Calendar with mode="range"
- **THEN** clicking two dates creates a date range
- **AND** range start, middle, and end dates are styled distinctly

#### Scenario: Calendar month/year dropdown

- **WHEN** using Calendar with captionLayout="dropdown"
- **THEN** month and year dropdowns are displayed
- **AND** users can quickly navigate to different months/years

#### Scenario: Calendar custom cell size

- **WHEN** using Calendar with custom --cell-size CSS variable
- **THEN** the calendar cells resize accordingly
- **AND** layout remains proportional

### Requirement: Calendar Demo Examples

The system SHALL provide Calendar examples in the Forms & Inputs category of the UI Kit demo.

#### Scenario: Calendar section in FormElements

- **WHEN** viewing the Forms & Inputs category
- **THEN** a Calendar section is displayed with heading and examples
- **AND** the section includes data-element-id="element-calendar" for navigation

#### Scenario: Calendar examples use translations

- **WHEN** Calendar examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple Calendar examples

- **WHEN** viewing the Calendar section
- **THEN** 8 examples are shown demonstrating different capabilities
- **AND** examples include: Persian calendar, selected date with timezone, range, month/year selector, DOB picker, date-time picker, natural language, custom cell size

### Requirement: Calendar in Category System

The system SHALL include Calendar as an implemented element in the Forms & Inputs category.

#### Scenario: Calendar in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Calendar' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Calendar appears in the Forms & Inputs category navigation menu

### Requirement: Calendar Translations

The system SHALL provide Calendar translations across all supported languages (36 languages).

#### Scenario: Calendar translation keys

- **WHEN** Calendar component is used in the demo
- **THEN** translation keys exist for all Calendar elements
- **AND** keys include headings and labels for all 8 example variations

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Calendar translation keys

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

### Requirement: Field Component

The UI kit SHALL provide Field, FieldSet, FieldLegend, FieldGroup, FieldLabel, FieldTitle, FieldDescription, FieldContent, FieldSeparator, and FieldError components for composing accessible form fields with labels, controls, and help text.

#### Scenario: Field component is available

- **WHEN** importing Field from `@hai3/uikit`
- **THEN** all Field sub-components are available: Field, FieldSet, FieldLegend, FieldGroup, FieldLabel, FieldTitle, FieldDescription, FieldContent, FieldSeparator, FieldError
- **AND** components support all standard React component props

#### Scenario: Field with orientation prop

- **WHEN** using Field with orientation="vertical"
- **THEN** the field is arranged in a flex column layout
- **AND** all children take full width
- **WHEN** using Field with orientation="horizontal"
- **THEN** the field is arranged in a flex row layout
- **AND** items are center-aligned
- **AND** FieldLabel takes flex-auto width
- **WHEN** using Field with orientation="responsive"
- **THEN** the field uses vertical layout by default
- **AND** switches to horizontal layout at medium breakpoint using container queries (@md/field-group)

#### Scenario: Field with invalid state

- **WHEN** Field has data-invalid="true" attribute
- **THEN** the field displays destructive text color
- **AND** FieldError component shows validation errors

#### Scenario: FieldSet container

- **WHEN** using FieldSet to wrap multiple Field components
- **THEN** fields are grouped in a flex column with gap-6
- **AND** the container uses semantic fieldset element
- **AND** checkbox groups and radio groups have gap-3 spacing

#### Scenario: FieldLegend with variant

- **WHEN** using FieldLegend with variant="legend"
- **THEN** the legend displays with text-base font size
- **WHEN** using FieldLegend with variant="label"
- **THEN** the legend displays with text-sm font size
- **AND** the legend has mb-3 margin bottom

#### Scenario: FieldGroup container

- **WHEN** using FieldGroup to wrap multiple Field components
- **THEN** fields are grouped in a flex column with gap-7
- **AND** the container uses @container/field-group for container queries
- **AND** nested FieldGroups have gap-4 spacing

#### Scenario: FieldLabel component

- **WHEN** using FieldLabel component
- **THEN** the label wraps the Label component
- **AND** the label has w-fit and gap-2 layout
- **AND** the label respects group-data-[disabled=true]/field:opacity-50 styling
- **AND** when containing Field components, the label becomes full-width with border and padding

#### Scenario: FieldTitle component

- **WHEN** using FieldTitle component
- **THEN** the title displays with text-sm, leading-snug, and font-medium styling
- **AND** the title has w-fit and items-center gap-2 layout
- **AND** the title respects group-data-[disabled=true]/field:opacity-50 styling

#### Scenario: FieldDescription component

- **WHEN** using FieldDescription component
- **THEN** the description displays with text-muted-foreground, text-sm styling
- **AND** links within description have hover:text-primary and underline styling
- **AND** the description has proper spacing with FieldLegend (nth-last-2:-mt-1)

#### Scenario: FieldContent wrapper

- **WHEN** using FieldContent to wrap FieldLabel and FieldDescription
- **THEN** the content is displayed in a flex column with gap-1.5
- **AND** the content takes flex-1 to fill available space
- **AND** the content has leading-snug line height

#### Scenario: FieldSeparator component

- **WHEN** using FieldSeparator without children
- **THEN** a horizontal separator line is rendered
- **AND** the separator has relative positioning with -my-2 margin
- **WHEN** using FieldSeparator with children
- **THEN** the separator displays with content centered on the line
- **AND** the content has bg-background and text-muted-foreground styling

#### Scenario: FieldError component

- **WHEN** using FieldError with children prop
- **THEN** the error message is displayed
- **WHEN** using FieldError with errors array containing single error
- **THEN** the error message text is displayed
- **WHEN** using FieldError with errors array containing multiple errors
- **THEN** a bulleted list of error messages is displayed
- **AND** duplicate error messages are deduplicated
- **WHEN** FieldError has no children and empty errors array
- **THEN** nothing is rendered (returns null)
- **AND** the error has role="alert" for accessibility
- **AND** the error uses text-destructive styling

### Requirement: Field Demo Examples

The UI kit demo SHALL provide examples for the Field component in the Forms & Inputs category demonstrating basic field, error handling, field groups, field sets, and different orientations, using `tk()` for translations.

#### Scenario: Field section in FormElements

- **WHEN** viewing the Forms & Inputs category
- **THEN** a Field section is displayed with heading and examples
- **AND** the section includes data-element-id="element-field" for navigation

#### Scenario: Field examples use translations

- **WHEN** Field examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple Field examples

- **WHEN** viewing the Field section
- **THEN** examples demonstrate:
  - Basic field with label, input, and description
  - Field with error message
  - FieldGroup with multiple fields
  - FieldSet with FieldLegend
  - Field with horizontal orientation
  - Field with responsive orientation
  - FieldSeparator with content

### Requirement: Field in Category System

The UI kit element registry SHALL include 'Field' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Category Menu Shows Field

- **WHEN** viewing the UIKit category menu
- **THEN** Field appears as an implemented element in Forms & Inputs category
- **AND** Field is positioned appropriately among other form elements

### Requirement: Field Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `field_heading` - Section heading
- `field_basic_label` - Basic field example label
- `field_error_label` - Field with error example label
- `field_group_label` - Field group example label
- `field_set_label` - Field set example label
- `field_horizontal_label` - Horizontal orientation example label
- `field_responsive_label` - Responsive orientation example label
- `field_separator_label` - Field separator example label
- Additional keys for example content (labels, descriptions, error messages, form field labels)

#### Scenario: Translated Field Labels

- **WHEN** viewing the Field demo in a non-English language
- **THEN** all Field labels, descriptions, error messages, and form field text display in the selected language
- **AND** translations are contextually appropriate for form conventions

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

### Requirement: Date Picker Composite Component

The UI kit SHALL provide DatePicker, DatePickerTrigger, DatePickerContent, and DatePickerInput components as a composite element that combines Popover and Calendar for complete date selection experiences with button triggers, dropdown calendars, and optional input field integration.

#### Scenario: DatePicker component is available

Given a developer importing from @hai3/uikit
When they import DatePicker, DatePickerTrigger, DatePickerContent, DatePickerInput
Then all components should be available for use

#### Scenario: Basic date picker with trigger

Given a DatePicker component with DatePickerTrigger and DatePickerContent
When the user clicks the trigger button
Then a popover opens with a Calendar for date selection

#### Scenario: Date picker with input variant

Given a DatePickerInput component
When the user types a date or clicks the calendar icon
Then the date can be entered via keyboard or calendar selection

#### Scenario: Date formatting

Given a DatePicker with a selected date
When the date is displayed in the trigger
Then it should be formatted using the provided formatDate function or default locale format

#### Scenario: Empty state placeholder

Given a DatePicker with no selected date
When viewing the trigger button
Then a placeholder text should be displayed with muted styling

### Requirement: Date Picker Demo Examples

The UI kit demo SHALL provide examples for the Date Picker component in the Forms & Inputs category demonstrating:
- Basic date picker with button trigger
- Date of birth picker with dropdown calendar mode and label
- Date picker with editable input field
- Date and time picker combination

#### Scenario: Date Picker section in FormElements

Given a user viewing the Forms & Inputs category in UIKitElementsScreen
When they scroll to the Date Picker section
Then they should see the heading and 4 demo examples

#### Scenario: Demo examples use translations

Given a user viewing the Date Picker demos
When the section renders
Then all labels, placeholders, and descriptions should use `tk()` translation function

#### Scenario: Date of birth picker example

Given the date of birth picker demo
When the user opens the calendar
Then it should use `captionLayout="dropdown"` for easy year/month selection

#### Scenario: Date and time picker example

Given the date and time picker demo
When viewing the example
Then it should show a date picker alongside a time input field

### Requirement: Date Picker in Category System

The UI kit element registry SHALL include 'Date Picker' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Date Picker in IMPLEMENTED_ELEMENTS

Given the uikitCategories.ts file
When checking the IMPLEMENTED_ELEMENTS array
Then 'Date Picker' should be present and alphabetically ordered

#### Scenario: Category menu shows Date Picker

Given a user viewing the UIKit category menu
When they navigate to Forms & Inputs
Then Date Picker should appear in the element list

### Requirement: Date Picker Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `date_picker_heading` - Section heading
- `date_picker_basic_label` - Basic example label
- `date_picker_basic_placeholder` - Placeholder text
- `date_picker_dob_label` - Date of birth label
- `date_picker_dob_field_label` - Field label for DOB
- `date_picker_input_label` - Input variant label
- `date_picker_input_field_label` - Field label for input variant
- `date_picker_input_placeholder` - Placeholder for input
- `date_picker_datetime_label` - Date and time label
- `date_picker_date_label` - Date field label
- `date_picker_time_label` - Time field label
- `date_picker_select_date` - Select date placeholder

#### Scenario: Translation keys exist

Given any of the 36 supported language files
When checking for date_picker_* keys
Then all required keys should be present

#### Scenario: Translated Date Picker labels

Given a user viewing the date picker demo in a non-English language
When the component renders
Then all labels and placeholders should appear in the selected language

### Requirement: Form Composite Component

The UI kit SHALL provide Form, FormField, FormItem, FormLabel, FormControl, FormDescription, and FormMessage components as a composite element that wraps react-hook-form for controlled form state management with schema validation and automatic accessibility attributes.

#### Scenario: Form component is available

Given a developer importing from @hai3/uikit
When they import Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
Then all components should be available for use

#### Scenario: Form with zod validation

Given a form schema defined with zod
When the form is submitted with invalid data
Then validation errors are displayed in FormMessage components
And aria-invalid is set to true on invalid fields

#### Scenario: Form field accessibility

Given a FormItem with FormLabel, FormControl, FormDescription, and FormMessage
When the FormItem renders
Then FormControl has aria-describedby linking to description and message IDs
And FormLabel htmlFor points to the control element ID

### Requirement: FormField Controller Integration

The FormField component SHALL wrap react-hook-form's Controller and provide field context to descendant components via FormFieldContext.

#### Scenario: FormField with render prop

Given a FormField with name and render prop
When the field renders
Then the render prop receives field state and handlers from react-hook-form
And FormFieldContext provides the field name to descendants

#### Scenario: FormField error state

Given a FormField with a validation error
When the field is invalid
Then useFormField hook returns the error state
And FormLabel displays with destructive styling

### Requirement: FormItem ID Generation

Each FormItem component SHALL generate unique IDs via React.useId() for accessibility linking between label, control, description, and message elements.

#### Scenario: Unique IDs per FormItem

Given multiple FormItems in a form
When they render
Then each has unique IDs generated via React.useId()
And child components use correct ID patterns (formItemId, formDescriptionId, formMessageId)

#### Scenario: Aria attributes linkage

Given a FormItem with all child components
When FormControl renders
Then aria-describedby includes formDescriptionId and formMessageId when error exists
And id is set to formItemId

### Requirement: useFormField Hook

The UI kit SHALL export a useFormField hook that provides access to form field state including id, name, formItemId, formDescriptionId, formMessageId, and error state.

#### Scenario: useFormField in custom component

Given a custom component inside FormItem
When calling useFormField()
Then it returns the field context with all ID values and error state

#### Scenario: useFormField outside FormField

Given useFormField called outside a FormField
When the hook executes
Then it throws an error indicating it should be used within FormField

### Requirement: Form Demo Examples

The UI kit demo SHALL provide examples for the Form component in the Forms & Inputs category demonstrating:
- Profile form with username field using zod validation (min 2 chars)
- FormField with render prop pattern for controlled input
- FormLabel, FormControl, FormDescription, and FormMessage composition
- Form submission with validation feedback

#### Scenario: Form section in FormElements

Given a user viewing the Forms & Inputs category in UIKitElementsScreen
When they scroll to the Form section
Then they should see the heading and profile form demo example

#### Scenario: Profile form structure

Given the profile form demo
When viewing the form
Then it should display a username field with label "Username"
And a description "This is your public display name."
And a Submit button

#### Scenario: Profile form validation error

Given the profile form demo with empty or single-character input
When the user clicks Submit
Then a validation error "Username must be at least 2 characters." appears in FormMessage
And the input shows aria-invalid="true"
And the form does not submit

#### Scenario: Profile form successful submission

Given the profile form demo with valid input (2+ characters)
When the user clicks Submit
Then no validation errors appear
And the form submits successfully (console.log or toast)

#### Scenario: Demo uses zodResolver

Given the profile form demo implementation
When examining the useForm configuration
Then it should use zodResolver with a zod schema for validation

### Requirement: Form in Category System

The UI kit element registry SHALL include 'Form' in the IMPLEMENTED_ELEMENTS array to mark it as an available component in the Forms & Inputs category.

#### Scenario: Form in IMPLEMENTED_ELEMENTS

Given the uikitCategories.ts file
When checking the IMPLEMENTED_ELEMENTS array
Then 'Form' should be present and alphabetically ordered

### Requirement: Form Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including form_heading and form demo labels.

#### Scenario: Translation keys exist

Given any of the 36 supported language files
When checking for form_* keys
Then all required keys should be present

### Requirement: Table Component

The UI Kit SHALL provide a Table component that renders a semantic HTML table with horizontal scroll container.

#### Scenario: Basic table rendering
Given a Table component with TableHeader, TableBody, and rows
When it renders
Then it displays a scrollable table with proper semantic structure

#### Scenario: Table with caption
Given a Table with TableCaption
When rendered
Then the caption is displayed at the bottom of the table for accessibility

### Requirement: Table Sections

The UI Kit SHALL provide TableHeader, TableBody, and TableFooter components for semantic table structure.

#### Scenario: Table header styling
Given a TableHeader component
When rendered
Then rows within it have bottom borders

#### Scenario: Table body styling
Given a TableBody component
When rendered
Then the last row has no bottom border

#### Scenario: Table footer styling
Given a TableFooter component
When rendered
Then it has a muted background and top border

### Requirement: Table Row

The UI Kit SHALL provide a TableRow component with hover and selection state support.

#### Scenario: Row hover state
Given a TableRow component
When the user hovers over it
Then it displays a muted background color

#### Scenario: Row selection state
Given a TableRow with data-state="selected"
When rendered
Then it displays a muted background color

### Requirement: Table Cells

The UI Kit SHALL provide TableHead and TableCell components for header and data cells.

#### Scenario: Header cell styling
Given a TableHead component
When rendered
Then it has medium font weight, left alignment, and proper padding

#### Scenario: Data cell styling
Given a TableCell component
When rendered
Then it has proper padding and vertical alignment

#### Scenario: Checkbox alignment
Given a TableHead or TableCell containing a checkbox
When rendered
Then the checkbox is properly aligned with slight vertical offset

### Requirement: Table Demo Examples

The UI kit demo SHALL provide examples for the Table component in the Data Display category demonstrating:
- Invoice table with multiple columns (Invoice, Status, Method, Amount)
- TableHeader with column headings
- TableBody with multiple data rows
- TableFooter with totals row
- TableCaption describing the table content

#### Scenario: Table section in DataDisplayElements
Given a user viewing the Data Display category in UIKitElementsScreen
When they scroll to the Table section
Then they should see the heading and invoice table demo example

#### Scenario: Invoice table structure
Given the invoice table demo
When viewing the table
Then it should display columns for Invoice number, Status, Method, and Amount
And multiple invoice rows with varied data
And a footer row showing the total amount

### Requirement: DataTable Component

The UI Kit SHALL provide a generic DataTable component that renders tabular data with sorting, pagination, and selection support using @tanstack/react-table.

#### Scenario: Basic data table rendering
Given a DataTable component with columns and data props
When it renders
Then it displays data in a table using the existing Table components

#### Scenario: Data table with empty state
Given a DataTable with no data rows
When it renders
Then it displays a "No results" message in the table body

### Requirement: DataTable Sorting

The UI Kit SHALL provide sortable columns with visual sort direction indicators.

#### Scenario: Column sorting toggle
Given a sortable column header
When the user clicks it
Then the table sorts by that column and shows a sort direction indicator

#### Scenario: Multi-direction sorting
Given a sorted column
When the user clicks it again
Then the sort direction toggles (ascending → descending → none)

### Requirement: DataTable Pagination

The UI Kit SHALL provide a DataTablePagination component with page navigation and page size controls.

#### Scenario: Page navigation
Given a paginated data table with multiple pages
When the user clicks next/previous buttons
Then the table navigates to the corresponding page

#### Scenario: Page size selection
Given a data table with pagination
When the user selects a different page size
Then the table displays that number of rows per page

#### Scenario: Row count display
Given a paginated data table with row selection
When viewing the pagination controls
Then it displays "{selected} of {total} row(s) selected"

### Requirement: DataTable Row Selection

The UI Kit SHALL provide row selection with header checkbox for select all and individual row checkboxes.

#### Scenario: Select all rows
Given a data table with a select column
When the user clicks the header checkbox
Then all visible rows are selected

#### Scenario: Individual row selection
Given a data table with a select column
When the user clicks a row's checkbox
Then that row is selected and the header checkbox reflects partial selection state

#### Scenario: Selected row styling
Given a selected row in the data table
When it renders
Then it displays with a highlighted background (data-state="selected")

### Requirement: DataTable Column Visibility

The UI Kit SHALL provide a DataTableViewOptions component for toggling column visibility.

#### Scenario: Column visibility dropdown
Given a data table with view options
When the user opens the columns dropdown
Then they see a list of hideable columns with checkboxes

#### Scenario: Hide column
Given a visible column in the data table
When the user unchecks it in the view options
Then the column is hidden from the table

### Requirement: DataTable Column Header

The UI Kit SHALL provide a DataTableColumnHeader component with sort controls and dropdown menu.

#### Scenario: Sortable header rendering
Given a sortable column
When it renders
Then it displays the column title with sort/hide options in a dropdown

#### Scenario: Non-sortable header
Given a column with sorting disabled
When it renders
Then it displays the column title without sort controls

### Requirement: DataTable Demo Examples

The UI kit demo SHALL provide examples for the Data Table component in the Data Display category demonstrating:
- Payments table with id, status, email, and amount columns
- Select column with checkboxes for row selection
- Sortable columns (amount, status, email)
- Pagination with page size selector
- Column visibility toggle
- Email filter input

#### Scenario: Data Table section in DataDisplayElements
Given a user viewing the Data Display category in UIKitElementsScreen
When they scroll to the Data Table section
Then they should see a payments table with sorting, pagination, and selection

#### Scenario: Payments table structure
Given the payments data table demo
When viewing the table
Then it should display columns for Select, Status, Email, and Amount
And show payment data with varied statuses (pending, processing, success, failed)
And provide pagination controls below the table

### Requirement: Alert Component

The UI kit SHALL provide `Alert`, `AlertTitle`, and `AlertDescription` components for displaying feedback messages with optional icons and severity variants.

#### Scenario: Alert component is available

- **WHEN** importing Alert from `@hai3/uikit`
- **THEN** the Alert, AlertTitle, and AlertDescription components are available for use
- **AND** components support all standard React div props

#### Scenario: Alert with variant prop

- **WHEN** using Alert with variant="default"
- **THEN** the alert displays with bg-card and text-card-foreground styling
- **WHEN** using Alert with variant="destructive"
- **THEN** the alert displays with text-destructive styling
- **AND** the icon inherits text-current color
- **AND** the description uses text-destructive/90 opacity

#### Scenario: Alert with icon

- **WHEN** an SVG icon is placed as direct child of Alert
- **THEN** the alert uses CSS grid with icon column and content column
- **AND** the icon is sized at 4 (--spacing * 4) with translate-y-0.5 alignment
- **AND** the icon inherits text-current color

#### Scenario: Alert without icon

- **WHEN** Alert has no SVG icon as direct child
- **THEN** the alert uses single-column grid layout
- **AND** title and description start at column 2

#### Scenario: AlertTitle rendering

- **WHEN** using AlertTitle component
- **THEN** the title displays with font-medium, tracking-tight, and line-clamp-1 styling
- **AND** the title has min-h-4 and starts at col-start-2

#### Scenario: AlertDescription rendering

- **WHEN** using AlertDescription component
- **THEN** the description displays with text-muted-foreground and text-sm styling
- **AND** the description starts at col-start-2 and supports gap-1 for nested content
- **AND** paragraph elements within have leading-relaxed line height

#### Scenario: Alert accessibility

- **WHEN** Alert is rendered
- **THEN** it has role="alert" attribute
- **AND** it has data-slot="alert" for styling hooks

### Requirement: Alert Demo Examples

The UI kit demo SHALL provide examples for the Alert component in the Feedback & Status category demonstrating:
- Success alert with icon, title, and description
- Alert with icon and title only (no description)
- Destructive alert with icon, title, and description containing structured content (list)

#### Scenario: Alert section in FeedbackElements

- **WHEN** viewing the Feedback & Status category in UIKitElementsScreen
- **THEN** an Alert section is displayed with heading and examples
- **AND** the section includes `data-element-id="element-alert"` for navigation

#### Scenario: Alert examples use translations

- **WHEN** Alert examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple Alert examples

- **WHEN** viewing the Alert section
- **THEN** three examples are displayed demonstrating different use cases
- **AND** examples include icons from lucide-react (CheckCircle2Icon, PopcornIcon, AlertCircleIcon)

### Requirement: Alert in Category System

The UI kit element registry SHALL include 'Alert' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Feedback & Status category.

#### Scenario: Category Menu Shows Alert

- **WHEN** viewing the UIKit category menu
- **THEN** Alert appears as an implemented element in Feedback & Status category
- **AND** Alert is positioned alphabetically among other feedback elements

### Requirement: Alert Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `alert_heading` - Section heading
- `alert_success_title` - Success alert title
- `alert_success_description` - Success alert description
- `alert_info_title` - Info/icon-only alert title
- `alert_error_title` - Destructive alert title
- `alert_error_description` - Destructive alert description
- `alert_error_check_card` - Error list item: check card
- `alert_error_ensure_funds` - Error list item: ensure funds
- `alert_error_verify_address` - Error list item: verify address

#### Scenario: Translated Alert Labels

- **WHEN** viewing the Alert demo in a non-English language
- **THEN** all Alert text displays in the selected language
- **AND** translations are contextually appropriate for feedback messaging

### Requirement: Alert Dialog Component

The UI kit SHALL provide `AlertDialog`, `AlertDialogTrigger`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, and `AlertDialogCancel` components built on `@radix-ui/react-alert-dialog` for displaying modal dialogs that require user acknowledgment or confirmation.

#### Scenario: Alert Dialog component is available

- **WHEN** importing AlertDialog from `@hai3/uikit`
- **THEN** all Alert Dialog components are available: AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel
- **AND** components support all standard Radix alert dialog props

#### Scenario: Alert Dialog root and trigger

- **WHEN** using AlertDialog with AlertDialogTrigger
- **THEN** clicking the trigger opens the alert dialog
- **AND** the dialog is rendered in a portal above the page content
- **AND** AlertDialog has data-slot="alert-dialog" attribute

#### Scenario: Alert Dialog overlay

- **WHEN** AlertDialogContent is rendered
- **THEN** AlertDialogOverlay displays with semi-transparent black background (bg-black/50)
- **AND** the overlay is fixed to cover the entire viewport (inset-0, z-50)
- **AND** the overlay has fade-in/fade-out animations on open/close
- **AND** AlertDialogOverlay has data-slot="alert-dialog-overlay" attribute

#### Scenario: Alert Dialog content positioning and styling

- **WHEN** AlertDialogContent is rendered
- **THEN** content is fixed-positioned and centered (top-50%, left-50%, translate-x/y -50%)
- **AND** content has bg-background, rounded-lg border, and shadow-lg styling
- **AND** content uses z-50 and grid layout with gap-4 and p-6 padding
- **AND** content has max-width constraints (max-w-lg on sm, max-w-[calc(100%-2rem)] otherwise)
- **AND** content has zoom-in/zoom-out and fade animations on open/close
- **AND** AlertDialogContent has data-slot="alert-dialog-content" attribute

#### Scenario: Alert Dialog header and footer layout

- **WHEN** using AlertDialogHeader component
- **THEN** header displays with flex-col layout and gap-2
- **AND** text is center-aligned by default, left-aligned on sm breakpoint
- **AND** AlertDialogHeader has data-slot="alert-dialog-header" attribute
- **WHEN** using AlertDialogFooter component
- **THEN** footer displays with flex-col-reverse layout by default
- **AND** footer changes to flex-row with justify-end and gap-2 on sm breakpoint
- **AND** AlertDialogFooter has data-slot="alert-dialog-footer" attribute

#### Scenario: Alert Dialog title and description

- **WHEN** using AlertDialogTitle component
- **THEN** title displays with text-lg and font-semibold styling
- **AND** AlertDialogTitle has data-slot="alert-dialog-title" attribute
- **WHEN** using AlertDialogDescription component
- **THEN** description displays with text-muted-foreground and text-sm styling
- **AND** AlertDialogDescription has data-slot="alert-dialog-description" attribute

#### Scenario: Alert Dialog action and cancel buttons

- **WHEN** using AlertDialogAction component
- **THEN** action button uses default button variant styling (from buttonVariants)
- **AND** clicking action closes the dialog
- **WHEN** using AlertDialogCancel component
- **THEN** cancel button uses outline button variant styling
- **AND** clicking cancel closes the dialog without action

#### Scenario: Alert Dialog accessibility

- **WHEN** AlertDialog is open
- **THEN** focus is trapped within the dialog content
- **AND** pressing Escape does NOT close the dialog (unlike regular Dialog)
- **AND** clicking outside does NOT close the dialog (unlike regular Dialog)
- **AND** proper ARIA attributes are applied for screen readers

### Requirement: Alert Dialog Demo Examples

The UI kit demo SHALL provide examples for the Alert Dialog component in the Feedback & Status category demonstrating:
- Basic alert dialog with trigger button, title, description, and action/cancel buttons
- Destructive action alert dialog for confirming dangerous operations

#### Scenario: Alert Dialog section in FeedbackElements

- **WHEN** viewing the Feedback & Status category in UIKitElementsScreen
- **THEN** an Alert Dialog section is displayed with heading and examples
- **AND** the section includes `data-element-id="element-alert-dialog"` for navigation

#### Scenario: Alert Dialog examples use translations

- **WHEN** Alert Dialog examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Basic alert dialog example

- **WHEN** viewing the Alert Dialog section
- **THEN** a basic example shows a trigger button labeled "Show Dialog"
- **AND** clicking trigger opens dialog with title and description
- **AND** dialog has Cancel and Continue action buttons

#### Scenario: Destructive alert dialog example

- **WHEN** viewing the Alert Dialog section
- **THEN** a destructive example shows a trigger button for delete action
- **AND** clicking trigger opens dialog warning about permanent deletion
- **AND** dialog has Cancel and destructive-styled Delete action button

### Requirement: Alert Dialog in Category System

The UI kit element registry SHALL include 'Alert Dialog' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Feedback & Status category.

#### Scenario: Category Menu Shows Alert Dialog

- **WHEN** viewing the UIKit category menu
- **THEN** Alert Dialog appears as an implemented element in Feedback & Status category
- **AND** Alert Dialog is positioned alphabetically among other feedback elements

### Requirement: Alert Dialog Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `alert_dialog_heading` - Section heading
- `alert_dialog_show` - Show dialog trigger button text
- `alert_dialog_title` - Basic dialog title
- `alert_dialog_description` - Basic dialog description
- `alert_dialog_cancel` - Cancel button text
- `alert_dialog_continue` - Continue action button text
- `alert_dialog_delete_trigger` - Delete trigger button text
- `alert_dialog_delete_title` - Delete confirmation dialog title
- `alert_dialog_delete_description` - Delete confirmation description
- `alert_dialog_delete_action` - Delete action button text

#### Scenario: Translated Alert Dialog Labels

- **WHEN** viewing the Alert Dialog demo in a non-English language
- **THEN** all Alert Dialog text displays in the selected language
- **AND** translations are contextually appropriate for confirmation dialogs

### Requirement: Empty Component

The system SHALL provide an Empty component in the `@hai3/uikit` package for displaying placeholder content when no data is available.

#### Scenario: Empty component is available

- **WHEN** importing Empty from `@hai3/uikit`
- **THEN** the Empty component and its sub-components are available
- **AND** components include: Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent

#### Scenario: Empty container layout

- **WHEN** using Empty component
- **THEN** the container is displayed as a flex column with centered items
- **AND** the container has rounded-lg corners, dashed border style, and balanced text
- **AND** the container has responsive padding (p-6 on mobile, p-12 on md+)

#### Scenario: EmptyMedia with default variant

- **WHEN** using EmptyMedia with variant="default" or no variant
- **THEN** the media container has transparent background
- **AND** the container is flex with centered items

#### Scenario: EmptyMedia with icon variant

- **WHEN** using EmptyMedia with variant="icon"
- **THEN** the media container has bg-muted background with size-10
- **AND** the container has rounded-lg corners
- **AND** SVG icons inside are sized to size-6 by default

#### Scenario: Empty styling follows theme

- **WHEN** rendering Empty components
- **THEN** EmptyTitle uses text-lg font-medium tracking-tight
- **AND** EmptyDescription uses text-muted-foreground text-sm/relaxed
- **AND** EmptyDescription links have underline with underline-offset-4

### Requirement: Empty Demo Examples

The system SHALL provide Empty examples in the Feedback & Status category of the UI Kit demo.

#### Scenario: Empty section in FeedbackElements

- **WHEN** viewing the Feedback & Status category
- **THEN** an Empty section is displayed with heading and examples
- **AND** the section includes data-element-id="element-empty" for navigation

#### Scenario: Empty examples use translations

- **WHEN** Empty examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Multiple empty state examples

- **WHEN** viewing the Empty section
- **THEN** at least 3 empty state examples are shown: outline, muted background, and avatar
- **AND** each example demonstrates different EmptyMedia variants and styling options

### Requirement: Empty in Category System

The system SHALL include Empty as an implemented element in the Feedback & Status category.

#### Scenario: Empty in IMPLEMENTED_ELEMENTS

- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Empty' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Empty appears in the Feedback & Status category navigation menu

### Requirement: Empty Translations

The system SHALL provide Empty translations across all supported languages (36 languages).

#### Scenario: Empty translation keys

- **WHEN** Empty component is used in the demo
- **THEN** translation keys exist for all Empty elements
- **AND** keys include: empty_heading, empty_outline_title, empty_outline_description, empty_muted_title, empty_muted_description, empty_avatar_title, empty_avatar_description

#### Scenario: Translation files completeness

- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Empty translation keys
- **AND** translations are contextually appropriate for each language

### Requirement: Sonner Toaster Component

The UI Kit SHALL provide a Toaster component that renders toast notifications with theme-aware styling and custom icons.

#### Scenario: Toaster component is available
- **WHEN** importing Toaster from `@hai3/uikit`
- **THEN** the Toaster component is available for use
- **AND** the toast function is available for programmatic toast triggering

#### Scenario: Theme integration
- **WHEN** Toaster component renders
- **THEN** it uses HAI3 theme CSS custom properties for styling
- **AND** background uses `--popover` token
- **AND** text uses `--popover-foreground` token
- **AND** borders use `--border` token
- **AND** border radius uses `--radius` token

#### Scenario: Custom icons for toast types
- **WHEN** Toaster renders different toast types
- **THEN** success toasts display CircleCheckIcon
- **AND** info toasts display InfoIcon
- **AND** warning toasts display TriangleAlertIcon
- **AND** error toasts display OctagonXIcon
- **AND** loading toasts display Loader2Icon with spin animation

### Requirement: Toast Function API

The UI Kit SHALL provide a toast function with support for multiple notification types and promise-based loading states.

#### Scenario: Default toast
- **WHEN** calling `toast(message)`
- **THEN** a default toast notification is displayed
- **AND** the toast displays without a type-specific icon

#### Scenario: Success toast
- **WHEN** calling `toast.success(message)`
- **THEN** a success toast is displayed with CircleCheckIcon
- **AND** the toast uses success styling

#### Scenario: Info toast
- **WHEN** calling `toast.info(message)`
- **THEN** an info toast is displayed with InfoIcon
- **AND** the toast uses info styling

#### Scenario: Warning toast
- **WHEN** calling `toast.warning(message)`
- **THEN** a warning toast is displayed with TriangleAlertIcon
- **AND** the toast uses warning styling

#### Scenario: Error toast
- **WHEN** calling `toast.error(message)`
- **THEN** an error toast is displayed with OctagonXIcon
- **AND** the toast uses error styling

#### Scenario: Promise-based toast
- **WHEN** calling `toast.promise(promiseFunction, config)`
- **THEN** a loading toast is displayed immediately with Loader2Icon
- **AND** when promise resolves, toast updates to success state
- **AND** when promise rejects, toast updates to error state
- **AND** the toast shows appropriate loading, success, and error messages

### Requirement: Toaster Integration

The UI Kit SHALL integrate Toaster component at the application root level for global toast notifications.

#### Scenario: Toaster placement in App.tsx
- **WHEN** the application renders
- **THEN** Toaster component is mounted at root level
- **AND** Toaster is positioned to not interfere with layout
- **AND** toasts can be triggered from any component via toast function

### Requirement: Sonner Demo Examples

The UI kit demo SHALL provide examples for the Sonner component in the Feedback & Status category demonstrating:
- Default toast notification
- Success notification
- Info notification
- Warning notification
- Error notification
- Promise-based loading → success/error flow

#### Scenario: Sonner section in FeedbackElements
- **WHEN** viewing the Feedback & Status category
- **THEN** a Sonner section is displayed with heading and examples
- **AND** the section includes `data-element-id="element-sonner"` for navigation

#### Scenario: Sonner examples use translations
- **WHEN** Sonner examples are rendered
- **THEN** all button labels use the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component
- **AND** no translation keys are displayed (values are shown)

#### Scenario: Multiple toast type examples
- **WHEN** viewing the Sonner section
- **THEN** buttons are displayed for triggering each toast type
- **AND** buttons are labeled: Default, Success, Info, Warning, Error, Promise
- **AND** clicking each button displays the corresponding toast notification
- **AND** Promise button simulates a 2-second async operation

#### Scenario: Interactive toast triggering
- **WHEN** clicking a toast example button
- **THEN** a toast notification appears on screen
- **AND** the toast automatically dismisses after the default duration
- **AND** user can manually dismiss the toast by clicking close button
- **AND** multiple toasts can be stacked

### Requirement: Sonner in Category System

The UI Kit SHALL include Sonner as an implemented element in the Feedback & Status category.

#### Scenario: Sonner in IMPLEMENTED_ELEMENTS
- **WHEN** checking `uikitCategories.ts`
- **THEN** 'Sonner' is included in the IMPLEMENTED_ELEMENTS array
- **AND** Sonner appears in the Feedback & Status category navigation menu

#### Scenario: Sonner element ordering
- **WHEN** viewing the Feedback & Status category
- **THEN** Sonner is positioned appropriately among other feedback elements
- **AND** the navigation menu reflects the correct order

### Requirement: Sonner Translations

The UI Kit SHALL provide Sonner translations across all supported languages (36 languages).

#### Scenario: Sonner translation keys
- **WHEN** Sonner component is used in the demo
- **THEN** translation keys exist for all Sonner elements
- **AND** keys include: sonner_heading, sonner_default_label, sonner_default_message, sonner_success_label, sonner_success_message, sonner_info_label, sonner_info_message, sonner_warning_label, sonner_warning_message, sonner_error_label, sonner_error_message, sonner_promise_label, sonner_promise_loading, sonner_promise_success, sonner_promise_error

#### Scenario: Translation files completeness
- **WHEN** checking translation files in `src/screensets/demo/screens/uikit/i18n/`
- **THEN** all 36 language files include Sonner translation keys
- **AND** translations are contextually appropriate for each language
- **AND** toast messages are concise and actionable

### Requirement: Sonner Accessibility

The Toaster component SHALL provide accessible toast notifications that work with screen readers and keyboard navigation.

#### Scenario: ARIA live region
- **WHEN** a toast notification appears
- **THEN** it is announced to screen readers via ARIA live region
- **AND** the announcement is polite (not assertive) for non-critical toasts

#### Scenario: Keyboard dismissal
- **WHEN** a toast is visible and user presses Escape key
- **THEN** the toast is dismissed
- **AND** focus returns to the triggering element if applicable

#### Scenario: Focus management
- **WHEN** multiple toasts are stacked
- **THEN** keyboard users can navigate between toasts
- **AND** each toast's close button is keyboard accessible

### Requirement: Button Group Component

The UI kit SHALL provide ButtonGroup, ButtonGroupText, and ButtonGroupSeparator components in the `@hai3/uikit` package for visually grouping related buttons with consistent spacing and connected appearance, built on @radix-ui/react-slot for polymorphic composition.

#### Scenario: Button Group component is available

- **WHEN** importing ButtonGroup from `@hai3/uikit`
- **THEN** all Button Group sub-components are available: ButtonGroup, ButtonGroupText, ButtonGroupSeparator
- **AND** buttonGroupVariants is exported for external styling

#### Scenario: ButtonGroup container

- **WHEN** using ButtonGroup to wrap button components
- **THEN** the container displays with flex layout and w-fit sizing
- **AND** the container has role="group" for accessibility
- **AND** the container has data-slot="button-group" attribute
- **AND** the container has data-orientation attribute reflecting current orientation
- **AND** child buttons receive focus z-index boost via [&>*]:focus-visible:z-10

#### Scenario: Horizontal orientation (default)

- **WHEN** using ButtonGroup with default or orientation="horizontal"
- **THEN** buttons display in a horizontal row
- **AND** intermediate buttons have border-radius removed on adjacent sides
- **AND** intermediate buttons have left border removed to prevent double borders
- **AND** first button keeps left border-radius, last button keeps right border-radius

#### Scenario: Vertical orientation

- **WHEN** using ButtonGroup with orientation="vertical"
- **THEN** buttons display in a vertical column via flex-col
- **AND** intermediate buttons have border-radius removed on adjacent sides
- **AND** intermediate buttons have top border removed to prevent double borders
- **AND** first button keeps top border-radius, last button keeps bottom border-radius

#### Scenario: Nested ButtonGroups

- **WHEN** placing ButtonGroup components inside another ButtonGroup
- **THEN** nested groups receive gap-2 spacing via has-[>[data-slot=button-group]]:gap-2
- **AND** nested groups function independently with their own orientation

#### Scenario: ButtonGroupText component

- **WHEN** using ButtonGroupText to display static text or labels
- **THEN** the text displays with bg-muted background
- **AND** the text has rounded-md border with px-4 padding
- **AND** the text has shadow-xs for subtle depth
- **AND** icons within text have pointer-events-none and size-4 defaults
- **AND** asChild prop enables polymorphic composition via Slot

#### Scenario: ButtonGroupSeparator component

- **WHEN** using ButtonGroupSeparator between buttons
- **THEN** a visual divider is rendered using the Separator component
- **AND** the separator has data-slot="button-group-separator" attribute
- **AND** the separator defaults to vertical orientation
- **AND** the separator has bg-input styling and self-stretch sizing
- **AND** the separator removes default margins (!m-0)

#### Scenario: Select trigger integration

- **WHEN** using Select component triggers within ButtonGroup
- **THEN** select triggers without explicit width class get w-fit
- **AND** hidden select elements at end preserve border-radius on visible trigger

### Requirement: Button Group Demo Examples

The UI kit demo SHALL provide examples for the Button Group component in the Actions & Buttons category demonstrating size variants, nested groups, and orientation options, using `tk()` for translations.

#### Scenario: Button Group section in ActionsElements

- **WHEN** viewing the Actions & Buttons category
- **THEN** a Button Group section is displayed with heading and examples
- **AND** the section includes data-element-id="element-button-group" for navigation

#### Scenario: Button Group examples use translations

- **WHEN** Button Group examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Size example

- **WHEN** viewing the Button Group size example
- **THEN** three button groups are displayed showing sm, default, and lg sizes
- **AND** each group contains multiple outline buttons with text labels
- **AND** each group includes an icon-only button with PlusIcon

#### Scenario: Nested example

- **WHEN** viewing the Button Group nested example
- **THEN** a parent ButtonGroup contains two nested ButtonGroups
- **AND** one nested group contains numbered page buttons (1, 2, 3, 4, 5)
- **AND** another nested group contains navigation icon buttons (previous, next)
- **AND** aria-label attributes provide accessibility for icon buttons

#### Scenario: Orientation example

- **WHEN** viewing the Button Group orientation example
- **THEN** a vertical ButtonGroup is displayed
- **AND** the group contains Plus and Minus icon buttons
- **AND** the group has aria-label="Media controls" for accessibility

### Requirement: Button Group in Category System

The UI kit element registry SHALL include 'Button Group' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Actions & Buttons category.

#### Scenario: Category Menu Shows Button Group

- **WHEN** viewing the UIKit category menu
- **THEN** Button Group appears as an implemented element in Actions & Buttons category
- **AND** Button Group is positioned after Button in the category elements list

### Requirement: Button Group Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `button_group_heading` - Section heading
- `button_group_size_label` - Size variants example label
- `button_group_nested_label` - Nested groups example label
- `button_group_orientation_label` - Orientation example label
- Button labels: `button_group_small`, `button_group_default`, `button_group_large`

#### Scenario: Translated Button Group Labels

- **WHEN** viewing the Button Group demo in a non-English language
- **THEN** all Button Group labels and descriptions display in the selected language
- **AND** translations are contextually appropriate for UI action terminology

### Requirement: Command Component

The UI kit SHALL provide Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, and CommandSeparator components in the `@hai3/uikit` package for building keyboard-driven command palettes and search interfaces, built on the `cmdk` library.

#### Scenario: Command component is available

- **WHEN** importing Command from `@hai3/uikit`
- **THEN** all Command sub-components are available: Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator
- **AND** components support all standard cmdk props

#### Scenario: Command container

- **WHEN** using Command as a root container
- **THEN** the container displays with flex-col layout and full height/width
- **AND** the container has bg-popover text-popover-foreground styling
- **AND** the container has rounded-md and overflow-hidden
- **AND** the container has data-slot="command" attribute

#### Scenario: CommandDialog component

- **WHEN** using CommandDialog to display command palette in a modal
- **THEN** the dialog renders using the Dialog component
- **AND** the dialog has accessible title and description (sr-only for screen readers)
- **AND** the dialog content has no padding (p-0) and overflow-hidden
- **AND** the embedded Command has enhanced styling for dialog context

#### Scenario: CommandInput component

- **WHEN** using CommandInput for search/filter input
- **THEN** the input is wrapped in a container with search icon
- **AND** the container has border-b and flex layout with items-center
- **AND** the input has transparent background and no outline
- **AND** the input has data-slot="command-input" attribute
- **AND** the wrapper has data-slot="command-input-wrapper" attribute

#### Scenario: CommandList component

- **WHEN** using CommandList to contain command items
- **THEN** the list has max-h-[300px] with overflow-y-auto
- **AND** the list has scroll-py-1 for scroll padding
- **AND** the list has data-slot="command-list" attribute

#### Scenario: CommandEmpty component

- **WHEN** using CommandEmpty for no results state
- **THEN** the empty state displays with py-6 text-center text-sm styling
- **AND** the empty state has data-slot="command-empty" attribute

#### Scenario: CommandGroup component

- **WHEN** using CommandGroup to organize related items
- **THEN** the group has overflow-hidden and p-1 padding
- **AND** group headings have text-muted-foreground, text-xs, font-medium styling
- **AND** the group has data-slot="command-group" attribute

#### Scenario: CommandItem component

- **WHEN** using CommandItem for selectable options
- **THEN** items display with flex layout, gap-2, rounded-sm, and cursor-default
- **AND** selected items have data-[selected=true]:bg-accent styling
- **AND** disabled items have pointer-events-none and opacity-50
- **AND** icons within items have consistent sizing (size-4) and muted color
- **AND** the item has data-slot="command-item" attribute

#### Scenario: CommandShortcut component

- **WHEN** using CommandShortcut to display keyboard shortcuts
- **THEN** shortcuts display with ml-auto, text-xs, tracking-widest
- **AND** shortcuts have text-muted-foreground styling
- **AND** the shortcut has data-slot="command-shortcut" attribute

#### Scenario: CommandSeparator component

- **WHEN** using CommandSeparator between groups
- **THEN** the separator displays as a horizontal line (h-px)
- **AND** the separator has bg-border and -mx-1 negative margin
- **AND** the separator has data-slot="command-separator" attribute

### Requirement: Command Demo Examples

The UI kit demo SHALL provide examples for the Command component in the Actions & Buttons category demonstrating a command dialog with keyboard shortcut trigger, grouped items with icons, and keyboard shortcuts display.

#### Scenario: Command section in ActionElements

- **WHEN** viewing the Actions & Buttons category
- **THEN** a Command section is displayed with heading and examples
- **AND** the section includes data-element-id="element-command" for navigation

#### Scenario: Command examples use translations

- **WHEN** Command examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Keyboard shortcut trigger

- **WHEN** viewing the Command example
- **THEN** instructions show "Press ⌘J" to open command palette
- **AND** the keyboard shortcut is displayed in a styled kbd element
- **AND** pressing ⌘J (or Ctrl+J on Windows) toggles the command dialog

#### Scenario: Command dialog content

- **WHEN** the command dialog is open
- **THEN** a search input with placeholder is displayed
- **AND** a "Suggestions" group shows Calendar, Search Emoji, Calculator items with icons
- **AND** a "Settings" group shows Profile, Billing, Settings items with icons and shortcuts
- **AND** groups are separated by CommandSeparator
- **AND** "No results found." displays when search has no matches

### Requirement: Command in Category System

The UI kit element registry SHALL include 'Command' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Actions & Buttons category.

#### Scenario: Category Menu Shows Command

- **WHEN** viewing the UIKit category menu
- **THEN** Command appears as an implemented element in Actions & Buttons category
- **AND** Command is positioned alphabetically among other action elements

### Requirement: Command Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `command_heading` - Section heading
- `command_press` - "Press" instruction text
- `command_placeholder` - Search input placeholder
- `command_no_results` - Empty state message
- `command_suggestions` - Suggestions group heading
- `command_settings` - Settings group heading
- `command_calendar` - Calendar item label
- `command_search_emoji` - Search Emoji item label
- `command_calculator` - Calculator item label
- `command_profile` - Profile item label
- `command_billing` - Billing item label
- `command_settings_item` - Settings item label

#### Scenario: Translated Command Labels

- **WHEN** viewing the Command demo in a non-English language
- **THEN** all Command labels, placeholders, and group headings display in the selected language
- **AND** translations are contextually appropriate for command palette terminology

### Requirement: Toggle Component

The UI kit SHALL provide Toggle and toggleVariants in the `@hai3/uikit` package for creating togglable buttons that switch between on/off states, built on the `@radix-ui/react-toggle` library.

#### Scenario: Toggle component is available

- **WHEN** importing Toggle from `@hai3/uikit`
- **THEN** Toggle component and toggleVariants are available
- **AND** the component supports all standard @radix-ui/react-toggle props

#### Scenario: Toggle styling

- **WHEN** using Toggle component
- **THEN** the toggle displays with inline-flex, items-center, justify-center layout
- **AND** the toggle has rounded-md, text-sm, font-medium styling
- **AND** hover state shows bg-muted and text-muted-foreground
- **AND** pressed state (data-[state=on]) shows bg-accent and text-accent-foreground
- **AND** disabled state has pointer-events-none and opacity-50
- **AND** icons within have consistent sizing (size-4) and shrink-0
- **AND** the toggle has data-slot="toggle" attribute

#### Scenario: Toggle variants

- **WHEN** using Toggle with variant prop
- **THEN** "default" variant has bg-transparent
- **AND** "outline" variant has border, border-input, bg-transparent, shadow-xs
- **AND** "outline" variant hover shows bg-accent and text-accent-foreground

#### Scenario: Toggle sizes

- **WHEN** using Toggle with size prop
- **THEN** "sm" size has h-8, px-1.5, min-w-8
- **AND** "default" size has h-9, px-2, min-w-9
- **AND** "lg" size has h-10, px-2.5, min-w-10

### Requirement: Toggle Demo Examples

The UI kit demo SHALL provide examples for the Toggle component in the Actions & Buttons category demonstrating variants, sizes, and disabled states.

#### Scenario: Toggle section in ActionElements

- **WHEN** viewing the Actions & Buttons category
- **THEN** a Toggle section is displayed with heading and examples
- **AND** the section includes data-element-id="element-toggle" for navigation

#### Scenario: Toggle examples use translations

- **WHEN** Toggle examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Toggle example content

- **WHEN** viewing the Toggle section
- **THEN** a default toggle with icon and text is shown
- **AND** an outline variant toggle with bookmark icon is shown
- **AND** a disabled toggle is shown

### Requirement: Toggle in Category System

The UI kit element registry SHALL include 'Toggle' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Actions & Buttons category.

#### Scenario: Category Menu Shows Toggle

- **WHEN** viewing the UIKit category menu
- **THEN** Toggle appears as an implemented element in Actions & Buttons category
- **AND** Toggle is positioned alphabetically among other action elements

### Requirement: Toggle Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `toggle_heading` - Section heading
- `toggle_default_label` - Default variant label
- `toggle_outline_label` - Outline variant label
- `toggle_disabled_label` - Disabled state label
- `toggle_italic` - Italic text
- `toggle_bookmark` - Bookmark text

#### Scenario: Translated Toggle Labels

- **WHEN** viewing the Toggle demo in a non-English language
- **THEN** all Toggle labels and text display in the selected language
- **AND** translations are contextually appropriate for toggle button terminology

### Requirement: Toggle Group Component

The UI kit SHALL provide ToggleGroup and ToggleGroupItem components in the `@hai3/uikit` package for creating groups of toggle buttons with single or multiple selection, built on the `@radix-ui/react-toggle-group` library and reusing `toggleVariants` from the Toggle component.

#### Scenario: Toggle Group components are available

- **WHEN** importing ToggleGroup from `@hai3/uikit`
- **THEN** ToggleGroup and ToggleGroupItem components are available
- **AND** the components support all standard @radix-ui/react-toggle-group props

#### Scenario: ToggleGroup container styling

- **WHEN** using ToggleGroup as a root container
- **THEN** the container displays with flex layout, w-fit, items-center
- **AND** the container has rounded-md styling
- **AND** the container has data-slot="toggle-group" attribute
- **AND** the container accepts variant, size, and spacing props
- **AND** variant and size are passed to children via React context

#### Scenario: ToggleGroup selection modes

- **WHEN** using ToggleGroup with type="single"
- **THEN** only one item can be selected at a time
- **AND** selecting a new item deselects the previous one
- **WHEN** using ToggleGroup with type="multiple"
- **THEN** multiple items can be selected simultaneously

#### Scenario: ToggleGroup spacing

- **WHEN** using ToggleGroup with spacing prop (default 0)
- **THEN** items are connected with no gap when spacing=0
- **AND** first item has rounded-l-md, last item has rounded-r-md
- **AND** middle items have rounded-none
- **WHEN** spacing > 0
- **THEN** items have gap between them based on spacing value
- **AND** each item maintains its own border radius

#### Scenario: ToggleGroupItem styling

- **WHEN** using ToggleGroupItem within a ToggleGroup
- **THEN** the item inherits variant and size from ToggleGroup context
- **AND** the item uses toggleVariants for consistent styling with Toggle
- **AND** the item has data-slot="toggle-group-item" attribute
- **AND** selected state shows data-[state=on] styling

#### Scenario: ToggleGroup outline variant

- **WHEN** using ToggleGroup with variant="outline"
- **THEN** items have border styling from toggleVariants outline variant
- **AND** adjacent items share borders (border-l-0 except first)
- **AND** the group has shadow-xs styling

### Requirement: Toggle Group Demo Examples

The UI kit demo SHALL provide examples for the Toggle Group component in the Actions & Buttons category demonstrating single selection, multiple selection, outline variant, spacing, and disabled states.

#### Scenario: Toggle Group section in ActionElements

- **WHEN** viewing the Actions & Buttons category
- **THEN** a Toggle Group section is displayed with heading and examples
- **AND** the section includes data-element-id="element-toggle-group" for navigation

#### Scenario: Toggle Group examples use translations

- **WHEN** Toggle Group examples are rendered
- **THEN** all text content uses the `tk()` translation helper
- **AND** all translated text is wrapped with TextLoader component

#### Scenario: Toggle Group example content

- **WHEN** viewing the Toggle Group section
- **THEN** a single selection example with type="single" is shown
- **AND** an outline variant example with type="multiple" variant="outline" is shown
- **AND** a spacing example with custom colors is shown
- **AND** a disabled state example is shown

### Requirement: Toggle Group in Category System

The UI kit element registry SHALL include 'Toggle Group' in the `IMPLEMENTED_ELEMENTS` array to mark it as an available component in the Actions & Buttons category.

#### Scenario: Category Menu Shows Toggle Group

- **WHEN** viewing the UIKit category menu
- **THEN** Toggle Group appears as an implemented element in Actions & Buttons category
- **AND** Toggle Group is positioned alphabetically among other action elements

### Requirement: Toggle Group Translations

The UI kit translations SHALL provide localized strings for all 36 supported languages with keys including:
- `toggle_group_heading` - Section heading
- `toggle_group_single_label` - Single selection label
- `toggle_group_outline_label` - Outline variant label
- `toggle_group_spacing_label` - Spacing example label
- `toggle_group_disabled_label` - Disabled state label

#### Scenario: Translated Toggle Group Labels

- **WHEN** viewing the Toggle Group demo in a non-English language
- **THEN** all Toggle Group labels display in the selected language
- **AND** translations are contextually appropriate for toggle group terminology

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
