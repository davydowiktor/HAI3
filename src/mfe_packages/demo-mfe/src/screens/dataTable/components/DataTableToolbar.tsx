import React from 'react';
import { type Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { DataTableViewOptions } from '../../../components/ui/data-table/data-table-view-options';
import { ButtonVariant, ButtonSize } from '../../../components/types';
import { type Task } from './data';

interface DataTableToolbarProps {
  table: Table<Task>;
  t: (key: string) => string;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({ table, t }) => {
  const isFiltered = table.getState().columnFilters.length > 0;
  const titleColumn = table.getColumn('title');

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={t('filter_placeholder')}
          value={(titleColumn?.getFilterValue() as string) ?? ''}
          onChange={(event) => titleColumn?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant={ButtonVariant.Ghost}
            size={ButtonSize.Sm}
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t('reset')}
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} label={t('toggle_columns')} buttonText={t('view')} />
    </div>
  );
};

DataTableToolbar.displayName = 'DataTableToolbar';
