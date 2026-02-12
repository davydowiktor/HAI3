# Change: Studio Position Within Viewport

## Why

Studio stores the position of the collapsed toggle button and the expanded panel in localStorage. On load, that stored position is applied as-is. When the user later opens the app on a different resolution, monitor, or window size, the saved (x, y) can fall outside the visible viewport. The collapsed button or the panel then appears off-screen or on another display and can become unreachable without clearing storage or resizing blindly.

Two manifestations of the same root cause:

1. **Collapsed button off-screen** – The floating toggle is often positioned outside the visible window on initial load.
2. **Panel off-screen** – The expanded Studio panel can also be outside the visible area on initial load.

Both use the same `useDraggable` hook and the same persistence mechanism; the fix is a single change in one place.

## What Changes

- **MODIFIED** `packages/studio/src/hooks/useDraggable.ts`:
  - **Clamp on load:** When initializing position (from storage or default), clamp (x, y) to the current viewport so the element stays fully visible with a viewport margin (e.g. 20px) from edges. Use a shared helper that clamps to `[margin, innerWidth - width - margin]` and `[margin, innerHeight - height - margin]`.
  - **Clamp on resize:** Add a `window` `resize` listener. When the viewport changes, re-clamp the current position to the new bounds. When the clamped position differs from the current one, update state and emit the existing position event (`PositionChanged` or `ButtonPositionChanged`) so persistence effects save the corrected position.
- **UNCHANGED** Drag behavior (already clamps during drag); persistence API; event contracts; `CollapsedButton` and `StudioPanel` components.

## Capabilities

- **Studio viewport positioning:** The Studio collapsed button and expanded panel remain within the visible viewport on initial load and after window resize.

## Impact

- **Packages:** `@hai3/studio` only.
- **Layers / registries:** None.
- **Rollback / risk:** Low. Change is additive (clamping); no new dependencies or event shapes. Reverting restores previous “raw stored position” behavior.
