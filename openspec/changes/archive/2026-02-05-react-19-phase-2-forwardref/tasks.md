# Implementation Tasks

## 1. Pre-Migration Validation
- [x] Run `npm run type-check` to establish baseline (expect zero errors)
- [x] Run `npm run arch:check` to ensure clean start (expect all checks pass)
- [x] Run `npm run build:packages` to verify all packages build cleanly
- [x] Verify git working tree is clean (`git status`)
- [x] Create feature branch `feat/react19-p2`

## 2. Install Codemod Tool
- [x] Install codemod CLI globally: `npm install -g codemod`
- [x] Verify installation: `codemod --version`

## 3. Run Automated forwardRef Migration (Base Components - 21 files)

### Run codemod on base components
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/accordion.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/alert-dialog.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/avatar.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/button.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/card.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/carousel.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/collapsible.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/dialog.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/drawer.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/dropdown-menu.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/header.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/hover-card.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/input.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/input-group.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/navigation-menu.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/popover.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/progress.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/select.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/sheet.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/slider.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/spinner.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/switch.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/textarea.tsx` (will require manual fix after)
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/base/tooltip.tsx`

### Review base component transformations
- [x] Review each transformed file for correctness
- [x] Verify `forwardRef` removed from all components
- [x] Verify `ref` added to props destructuring
- [x] Verify type annotations updated correctly
- [x] Verify `displayName` preserved where present
- [x] Commit base component changes: "refactor(uikit): migrate base components from forwardRef to native ref"

## 4. Run Automated forwardRef Migration (Composite Components - 7 files)

### Run codemod on composite components
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/composite/buttons/DropdownButton.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/composite/buttons/IconButton.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/composite/navigation/Sidebar.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/composite/navigation/SidebarHeader.tsx`
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/uikit/src/composite/user/UserInfo.tsx`

### Review composite component transformations
- [x] Review each transformed file for correctness
- [x] Verify all forwardRef wrappers removed
- [x] Verify ref handling correct in composite components
- [x] Commit composite component changes: "refactor(uikit): migrate composite components from forwardRef to native ref"

## 5. Run Automated forwardRef Migration (CLI Template - 1 file)

### Run codemod on CLI template
- [x] Execute: `npx codemod react/19/remove-forward-ref packages/cli/templates/src/screensets/demo/uikit/icons/MenuItemButton.tsx`

### Review CLI template transformation
- [x] Review MenuItemButton.tsx transformation
- [x] Verify forwardRef removed correctly
- [x] Commit CLI template changes: "refactor(cli): migrate MenuItemButton template from forwardRef to native ref"

## 6. Manual Fix for textarea.tsx (useImperativeHandle)

### Analyze textarea.tsx codemod output
- [x] Open `packages/uikit/src/base/textarea.tsx`
- [x] Review codemod transformation
- [x] Identify useImperativeHandle usage

### Apply manual fix if needed
- [x] Verify `useImperativeHandle` still works with new signature
- [x] Test that ref forwarding works correctly
- [x] Ensure autoResize functionality preserved
- [x] If codemod didn't handle correctly, apply manual transformation:
  ```typescript
  // Keep useImperativeHandle approach (compatible with React 19)
  useImperativeHandle(ref, () => textareaRef.current!);
  ```
- [x] Commit textarea manual fix separately: "refactor(uikit): fix textarea ref forwarding with useImperativeHandle" (not needed - codemod handled correctly)

## 7. Fix Type Errors Revealed by Migration

### Fix implicit any types in components
- [x] Fix `dropdown-menu.tsx` - Add proper type annotations to DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel
- [x] Fix `carousel.tsx` - Add type annotation using CarouselProps
- [x] Fix `input-group.tsx` - Add type annotations to InputGroupAddon and InputGroupButton
- [x] Fix `sidebar.tsx` - Add type annotations to Sidebar and SidebarMenuButton

### Fix type definition for CSS logical flow directions
- [x] Expand `InputGroupAddon` type to accept all 4 CSS logical directions: "inline-start", "inline-end", "block-start", "block-end"
- [x] Verify FormElements.tsx uses correct `block-start` and `block-end` for vertical addon positioning

### Remove unused imports
- [x] Remove unused `VariantProps` import from `input-group.tsx`
- [x] Add missing `ButtonProps` import to `input-group.tsx`
- [x] Remove unused `VariantProps` import from `sidebar.tsx`

### Fix ElementRef deprecation (React 19)
- [x] Identify all uses of deprecated `React.ElementRef` (67 occurrences in 16 Radix UI wrapper components)
- [x] Replace all `React.ElementRef` with `React.ComponentRef` using sed batch replacement
- [x] Verify type checking passes after replacement
- [x] Update documentation (design.md and proposal.md) with ElementRef fix details
- [x] Commit ElementRef replacement: "refactor(uikit): replace deprecated ElementRef with ComponentRef"

## 8. Type Checking & Compilation

### Run full type checking
- [x] Run `npm run type-check` - expect zero errors
- [x] Run `npm run type-check:packages` - expect all packages compile cleanly
- [x] Fix any type errors discovered (if any)
- [x] Re-run type checks until clean

### Build all packages
- [x] Run `npm run build:packages` - expect clean build
- [x] Verify all packages build in correct order (SDK → Framework → React → UI → CLI)
- [x] Fix any build errors (if any)

## 9. Architecture & Linting Validation

### Run architecture checks
- [x] Run `npm run arch:check` - expect all checks pass (from pre-migration baseline)
- [x] Run `npm run arch:deps` - expect no dependency violations (from pre-migration baseline)
- [x] Run `npm run arch:sdk` - expect SDK layer rules pass (from pre-migration baseline)

### Run linting
- [x] Run `npm run lint` - expect zero warnings/errors
- [x] Fix any linting issues (if any)
- [x] Run pre-commit hooks to verify (if configured)

## 10. Manual Testing - Base Components

### Test input components with refs
- [x] Start dev server: `npm run dev`
- [x] Test Button component (focus, click, ref access)
- [x] Test Input component (focus, setValue via ref)
- [x] Test Textarea component (focus, setValue via ref, autoResize)
- [x] Test Switch component (focus, checked state)

### Test Radix UI wrapper components
- [x] Test Dialog (open, close, focus trap, ref access)
- [x] Test Sheet (open, close, ref access)
- [x] Test Dropdown Menu (open, close, keyboard nav, ref access)
- [x] Test Select (focus, open, close, value selection)
- [x] Test Popover (open, close, positioning)
- [x] Test HoverCard (hover, delay, ref access)
- [x] Test Tooltip (hover, positioning)
- [x] Test AlertDialog (open, close, focus trap)
- [x] Test Accordion (expand, collapse, multiple items)
- [x] Test Collapsible (expand, collapse)
- [x] Test NavigationMenu (keyboard nav, submenu)
- [x] Test Avatar (image load, fallback)
- [x] Test Progress (value updates)
- [x] Test Slider (drag, keyboard, value)
- [x] Test Carousel (navigation, autoplay if enabled)

### Test layout components
- [x] Test Card (rendering, ref access)
- [x] Test Header (rendering, ref access)
- [x] Test InputGroup (rendering, child composition)

### Verify no console errors
- [x] Check browser console for React warnings
- [x] Check for forwardRef deprecation warnings (should be none)
- [x] Check for ref-related errors (should be none)

## 10. Manual Testing - Composite Components

### Test composite button components
- [x] Test IconButton (click, focus, icon rendering, ref access)
- [x] Test DropdownButton (click, dropdown open/close, ref access)

### Test composite navigation components
- [x] Test Sidebar (expand/collapse, navigation, ref access)
- [x] Test SidebarHeader (rendering, interactions)

### Test composite user components
- [x] Test UserInfo (rendering, avatar, name display)

## 11. CLI Generator Integration Testing

### Generate new project with updated template
- [x] Create temp directory: `mkdir -p /tmp/test-react19-p2`
- [x] Generate new project: `node packages/cli/dist/index.js create test-react19-p2`
- [x] Verify project generated successfully

### Verify MenuItemButton.tsx in generated project
- [x] Open `test-react19-p2/src/screensets/demo/uikit/icons/MenuItemButton.tsx`
- [x] Verify forwardRef removed (uses native ref pattern)
- [x] Verify component signature correct (ref?: React.Ref<HTMLButtonElement>)
- [x] Verify no forwardRef imports
- [x] Verify displayName preserved

### Validate generated project
- [x] Link local packages with React 19 changes (using file: protocol in package.json)
- [x] Run `npm install` in generated project
- [x] Run `npm run type-check` - expect zero errors
- [x] Run `npm run arch:check` - expect all checks pass (4/4 passed)
- [x] Run `npm run build` - expect clean build
- [x] Run `npm run dev` - expect dev server starts (http://localhost:5173/)
- [x] Test MenuItemButton in demo screenset (if visible)

## 12. Documentation Updates

### Update OpenSpec docs
- [x] Mark Phase 2 as complete in `openspec/changes/2026-02-05-react-19-phase-2-forwardref/proposal.md`
- [x] Update this tasks.md with completion status
- [x] Add notes about any issues encountered during migration (ElementRef deprecation, InputGroupAddon type expansion)

### Update main specs (if needed)
- [x] Review `openspec/specs/uikit-base/spec.md`
- [x] Add note about React 19 native ref pattern (if not already documented) - Delta spec created
- [x] Update component implementation guidelines to prefer native ref - Documented in delta spec
- [x] Sync delta spec to main spec using OpenSpec (will be handled during archive step)

## 13. Version Bumping

### Bump package versions for affected packages
- [x] Bump `@hai3/uikit` version in `packages/uikit/package.json` (0.3.0-alpha.0 → 0.3.0-alpha.1)
- [x] Bump `@hai3/cli` version in `packages/cli/package.json` (0.3.0-alpha.1 → 0.3.0-alpha.2)
- [x] Bump `@hai3/studio` version in `packages/studio/package.json` (0.3.0-alpha.0 → 0.3.0-alpha.1)
- [x] Update CHANGELOG.md files for affected packages (no CHANGELOG files exist)
- [x] Commit version bumps: "chore: bump versions for React 19 Phase 2 migration"

## 14. Final Validation & Merge

### Run complete validation suite
- [x] Run `npm run type-check` - zero errors
- [x] Run `npm run build:packages` - clean build
- [x] Run `npm run arch:check` - all checks pass
- [x] Run `npm run lint` - zero warnings
- [x] Run `npm run dev` - dev server starts cleanly
- [x] Manual testing checklist completed (base and composite components tested)

### Review all commits
- [x] Review all commit messages for clarity
- [x] Ensure commits are atomic and logical
- [x] Squash/reorder commits if needed (kept 2 commits: main migration + ElementRef fix)

### Verify git status
- [x] All changes committed
- [x] No uncommitted files
- [x] Branch is `feat/react19-p2`
- [x] Ready to push and create PR

## Phase 2 Completion Checklist

- [x] All 100 forwardRef declarations migrated (all auto via codemod)
- [x] All 29 files transformed successfully
- [x] textarea.tsx useImperativeHandle handled correctly
- [x] Zero TypeScript errors
- [x] Clean package builds
- [x] All architecture checks pass
- [x] No linting errors
- [x] ElementRef deprecation fixed (67 occurrences replaced with ComponentRef)
- [x] Dev server runs without warnings
- [x] All ref-dependent features tested manually (base and composite components)
- [x] CLI generator integration tested (MenuItemButton uses native ref pattern)
- [x] Generated project validates successfully (type-check, arch-check, build all pass)
- [x] No React warnings in browser console
- [x] All commits reviewed and clean
- [x] Documentation updated
- [x] Package versions bumped for affected packages
- [x] Ready for PR and merge

## Rollback Plan (if needed)

### Quick rollback (revert commits)
```bash
# Identify commits to revert
git log --oneline -n 10

# Revert all Phase 2 commits
git revert <commit-hash-1>
git revert <commit-hash-2>
git revert <commit-hash-3>

# Validate rollback
npm run type-check
npm run build:packages
npm run dev
```

### Full rollback (abandon branch)
```bash
git checkout main
git branch -D feat/react19-p2
```

## Notes

- **Codemod installation:** If `npm install -g codemod` fails, try `npx codemod` directly (it will auto-install)
- **Batch execution:** Can run codemod on multiple files at once: `npx codemod react/19/remove-forward-ref 'packages/uikit/src/base/*.tsx'`
- **Type annotations:** Codemod may produce verbose types; simplify if needed (e.g., use type aliases)
- **displayName:** Codemod preserves `displayName` assignments (important for React DevTools)
- **Testing priority:** Focus manual testing on ref-dependent features (focus, imperative methods, forwarding)
