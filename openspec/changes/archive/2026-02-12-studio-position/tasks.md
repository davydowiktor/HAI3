# Tasks: Studio Viewport Positioning

## 1. useDraggable viewport clamping

- [x] 1.1 Add `clampToViewport(pos: Position, size: Size): Position` helper in `packages/studio/src/hooks/useDraggable.ts`.
  - Use existing `clamp` from lodash.
  - Add `VIEWPORT_MARGIN` constant (e.g. 20). Bounds: `x` in `[VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, window.innerWidth - size.width - VIEWPORT_MARGIN)]`, `y` in `[VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, window.innerHeight - size.height - VIEWPORT_MARGIN)]`.
- [x] 1.2 Clamp position on load: in the `useState` initializer, set initial position to `clampToViewport(loadStudioState(storageKey, getDefaultPosition()), panelSize)` instead of the raw loaded/default value.
- [x] 1.3 Add a `useEffect` that subscribes to `window` `resize`.
  - In the handler: compute `clamped = clampToViewport(currentPosition, panelSize)` via `setPosition(prev => { ... })`.
  - If clamped position differs from `prev` (by x or y), update state to `clamped`, then emit the appropriate event (`StudioEvents.ButtonPositionChanged` when `storageKey === STORAGE_KEYS.BUTTON_POSITION`, else `StudioEvents.PositionChanged`) with `{ position: clamped }`.
  - If clamped equals `prev`, leave state unchanged and do not emit.
  - Dependencies: `[panelSize.width, panelSize.height, storageKey]`.
- [x] 1.4 Ensure drag handler uses same viewport margin and bounds as `clampToViewport` (already clamps and emits).

## 2. Verification

- [x] 2.1 With Studio collapsed: set `hai3:studio:buttonPosition` in localStorage to an off-screen value (e.g. `{"x":9999,"y":9999}`), reload; confirm the button appears in view (clamped).
- [x] 2.2 With Studio expanded: set `hai3:studio:position` to an off-screen value, reload; confirm the panel appears in view (clamped).
- [x] 2.3 Resize the window so the current button or panel would go off-screen; confirm it moves to stay visible and the new position is persisted (reload to verify).
