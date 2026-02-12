# Design: Studio Viewport Positioning

## Overview

Keep the Studio collapsed button and expanded panel within the visible viewport by clamping position on load and on window resize. All logic lives in the existing `useDraggable` hook; no new events, effects, or slices are introduced.

## Approach

### Single implementation point

Both the collapsed button (`CollapsedButton`) and the expanded panel (`StudioPanel`) use `useDraggable` with different `panelSize` and `storageKey`. Implementing clamp-on-load and clamp-on-resize inside `useDraggable` satisfies the spec’s “shared behavior” requirement and avoids duplication.

### Viewport clamping helper

Introduce a pure helper in `useDraggable.ts` (or a small util used only by it):

- **Input:** `Position` and `Size` (element width/height).
- **Output:** A new `Position` with `x` and `y` clamped so the element stays fully inside the viewport with margin from edges.
- **Viewport margin:** A constant (e.g. `VIEWPORT_MARGIN = 20`) so the element is never flush with the window edge.
- **Bounds:**
  - `x` in `[VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, window.innerWidth - size.width - VIEWPORT_MARGIN)]`
  - `y` in `[VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, window.innerHeight - size.height - VIEWPORT_MARGIN)]`

Use the existing `clamp` from lodash (already used in the drag handler). The same margin applies to initial position, resize re-clamp, and drag; use one constant for consistency.

### Clamp on load

- **Where:** Initial state in `useDraggable` (the `useState` initializer).
- **Behavior:** After resolving position (from `loadStudioState(storageKey, getDefaultPosition())`), pass that position and `panelSize` into the clamping helper and use the result as the initial state.
- **Effect:** First paint always shows the button/panel in view, whether the stored position was valid or not. No new persistence at load time; the next drag or resize will persist if needed.

### Clamp on resize

- **Where:** A `useEffect` in `useDraggable` that subscribes to `window` `resize`.
- **Behavior:**
  - On each resize, compute `clamped = clampToViewport(currentPosition, panelSize)`.
  - If `clamped` differs from current position, call `setPosition(clamped)` and emit the existing event so persistence runs:
    - `storageKey === STORAGE_KEYS.BUTTON_POSITION` → `StudioEvents.ButtonPositionChanged`
    - else → `StudioEvents.PositionChanged`
  - Payload: `{ position: clamped }` (same as drag).
- **Effect:** When the window is shrunk and the element would go off-screen, it moves to the nearest in-bounds position and that position is saved. When the window grows and the element is still in view, position and stored state stay unchanged (no emit).

### Drag behavior

The drag handler already clamps during `mousemove` and emits the same events; it SHALL use the same viewport margin and bounds as `clampToViewport` so the element cannot be dragged into the margin zone.

## Event and persistence flow

- **Existing events:** `StudioEvents.PositionChanged`, `StudioEvents.ButtonPositionChanged` (payload: `{ position }`).
- **Existing effect:** `initPersistenceEffects()` in `StudioProvider` subscribes to these and calls `saveStudioState(STORAGE_KEYS.POSITION | BUTTON_POSITION, position)`.
- **Change:** Resize path now may emit one of these events when re-clamping moves the element. No new events or effect subscriptions; persistence remains the single listener it is today.

## Module and file changes

| File | Change |
|------|--------|
| `packages/studio/src/hooks/useDraggable.ts` | Add `VIEWPORT_MARGIN` constant; `clampToViewport` helper (with margin); clamp initial state; drag and resize use same margin; add resize listener that re-clamps and optionally emits. |
| No other files | Persistence, events, `CollapsedButton`, `StudioPanel`, types unchanged. |

## Edge cases

- **Viewport smaller than element:** `Math.max(VIEWPORT_MARGIN, innerWidth - width - VIEWPORT_MARGIN)` (and same for height) keeps the element as far right/bottom as possible; minimum position stays at (VIEWPORT_MARGIN, VIEWPORT_MARGIN). Acceptable for very small windows.
- **SSR / no `window`:** `useDraggable` runs in browser (Studio is dev overlay). If ever used in SSR, the initializer could guard on `typeof window !== 'undefined'` and use a safe default; no change required for current usage.
- **Panel size from storage:** `StudioPanel` passes `size` from `useResizable()` (which also loads from storage). Initial render uses that size for clamping; if size changes later (e.g. after load), the resize effect will run when `panelSize` changes and re-clamp with the new size.

## Rollback

Revert the changes in `useDraggable.ts` (remove helper, restore raw loaded position in initial state, remove resize effect). Stored positions remain in localStorage; behavior reverts to “use stored position as-is.”
