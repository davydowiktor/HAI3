# Proposal: Add DataTable Screen

## Summary
Add new screen "dataTable" to demo-mfe screenset. This screen demonstrates the existing data-table UI components with filtering, sorting, and pagination using sample data.

## Details
- Screenset: demo-mfe
- Screen name: dataTable
- Add to menu: Yes (icon: lucide:table, route: /data-table, order: 50)

## Component Plan
- REUSE: Existing `components/ui/data-table/` components (DataTable, DataTableColumnHeader, DataTablePagination, DataTableViewOptions)
- REUSE: Existing `components/ui/` components (Badge, Button, Input)
- NEW: `screens/dataTable/components/columns.tsx` - Column definitions with sortable headers
- NEW: `screens/dataTable/components/DataTableToolbar.tsx` - Filter input + view options toolbar
- NEW: `screens/dataTable/components/data.ts` - Sample data for the table (tasks/items)

## Data Flow
- Client-side only: uses local sample data (no API service needed for demo)
- Screen orchestrates components, no direct slice updates
- Uses @tanstack/react-table for filtering, sorting, pagination (already a dependency via DataTable component)

## UI Sections
- Header: screen title and description
- Toolbar: text filter input + column visibility toggle
- Data table: sortable columns, filterable rows, paginated view
