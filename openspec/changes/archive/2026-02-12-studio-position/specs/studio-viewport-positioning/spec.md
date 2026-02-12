# Studio Viewport Positioning (Delta)

## Purpose

Ensure the Studio collapsed button and expanded panel always remain within the visible viewport on initial load and after window resize, regardless of stored position or viewport changes. Positions are kept at least a viewport margin from the window edges (e.g. 20px, single constant in implementation) so the element is never flush with the edge.

## Requirements

### Requirement: Position Clamped on Load

The system SHALL clamp the Studio collapsed button and panel position to the current viewport when restoring from storage or applying the default position.

#### Scenario: Stored position off-screen on load
- **GIVEN** a stored position (e.g. `hai3:studio:position` or `hai3:studio:buttonPosition`) that would place the element outside the current viewport (e.g. x or y less than viewport margin, or beyond `innerWidth - elementWidth - margin` / `innerHeight - elementHeight - margin`)
- **WHEN** the Studio overlay mounts (collapsed button or panel)
- **THEN** the rendered position SHALL be clamped so the element is fully visible with margin from edges
- **AND** x SHALL be within `[viewportMargin, window.innerWidth - elementWidth - viewportMargin]`
- **AND** y SHALL be within `[viewportMargin, window.innerHeight - elementHeight - viewportMargin]`

#### Scenario: Stored position already in view
- **GIVEN** a stored position that is already within viewport bounds
- **WHEN** the Studio overlay mounts
- **THEN** the rendered position SHALL equal the stored position (no change)

### Requirement: Position Clamped on Viewport Resize

The system SHALL re-clamp the Studio collapsed button and panel position when the window is resized so they remain visible.

#### Scenario: Window shrinks and current position would go off-screen
- **GIVEN** the Studio collapsed button or panel is visible at position (x, y)
- **WHEN** the user resizes the window such that (x, y) would fall outside the new viewport (e.g. new `innerWidth` or `innerHeight` is smaller)
- **THEN** the position SHALL be updated to the nearest in-bounds position (clamped)
- **AND** the updated position SHALL be persisted (e.g. via existing position-change event so localStorage is updated)

#### Scenario: Window grows
- **GIVEN** the Studio collapsed button or panel is visible at position (x, y)
- **WHEN** the user resizes the window to a larger size
- **THEN** the position SHALL remain unchanged if (x, y) is still within the new viewport
- **AND** no unnecessary persistence SHALL occur when position is unchanged

### Requirement: Shared Behavior for Button and Panel

The system SHALL apply the same clamp-on-load and clamp-on-resize behavior to both the Studio collapsed button and the Studio panel, using a single shared implementation (e.g. the same hook or helper used by both).
