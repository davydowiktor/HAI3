import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../../../components/ui/data-table/data-table-column-header';
import { Badge } from '../../../components/ui/badge';
import { type Task, TASK_STATUS, TASK_PRIORITY } from './data';

const STATUS_VARIANT_MAP: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [TASK_STATUS.TODO]: 'outline',
  [TASK_STATUS.IN_PROGRESS]: 'default',
  [TASK_STATUS.DONE]: 'secondary',
  [TASK_STATUS.CANCELLED]: 'destructive',
};

const PRIORITY_VARIANT_MAP: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [TASK_PRIORITY.LOW]: 'outline',
  [TASK_PRIORITY.MEDIUM]: 'secondary',
  [TASK_PRIORITY.HIGH]: 'destructive',
};

export function createColumns(t: (key: string) => string): ColumnDef<Task>[] {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('col_id')} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('col_title')} />,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('col_status')} />,
      cell: ({ row }) => {
        const status = row.getValue<string>('status');
        return (
          <Badge variant={STATUS_VARIANT_MAP[status] ?? 'outline'}>
            {t(`status_${status}`)}
          </Badge>
        );
      },
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('col_priority')} />,
      cell: ({ row }) => {
        const priority = row.getValue<string>('priority');
        return (
          <Badge variant={PRIORITY_VARIANT_MAP[priority] ?? 'outline'}>
            {t(`priority_${priority}`)}
          </Badge>
        );
      },
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('col_created')} />,
    },
  ];
}
