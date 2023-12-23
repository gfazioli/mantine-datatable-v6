import { Button, Group, Stack, Switch } from '@mantine/core';
import { sortBy } from 'lodash';
import { DataTable, DataTableSortStatus, useDataTableColumns } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { companies, type Company } from '~/data';

export default function ResizingComplexExample() {
  const key = 'resize-complex-example';

  const [withTableBorder, setWithTableBorder] = useState<boolean>(true);

  const [withColumnBorders, setWithColumnBorders] = useState<boolean>(true);

  const props = {
    resizable: true,
    sortable: true,
    toggleable: true,
    draggable: true,
  };

  const { effectiveColumns, resetColumnsWidth, resetColumnsOrder, resetColumnsToggle } = useDataTableColumns<Company>({
    key,
    columns: [
      { accessor: 'name', ...props },
      { accessor: 'streetAddress', ...props },
      { accessor: 'city', ...props },
      { accessor: 'state', ...props },
    ],
  });

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const [records, setRecords] = useState(sortBy(companies, 'name'));

  useEffect(() => {
    const data = sortBy(companies, sortStatus.columnAccessor) as Company[];
    setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
  }, [sortStatus]);

  return (
    <Stack>
      <DataTable
        withBorder={withTableBorder}
        withColumnBorders={withColumnBorders}
        storeColumnsKey={key}
        records={records}
        columns={effectiveColumns}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
      />
      <Group grow position="apart">
        <Group position="left">
          <Switch
            checked={withTableBorder}
            onChange={(event) => setWithTableBorder(event.currentTarget.checked)}
            labelPosition="left"
            label="Table Border"
          />
          <Switch
            checked={withColumnBorders}
            onChange={(event) => setWithColumnBorders(event.currentTarget.checked)}
            labelPosition="left"
            label="Column Borders"
          />
        </Group>
        <Group position="right">
          <Button size="xs" compact onClick={resetColumnsWidth}>
            Reset Column Width
          </Button>
          <Button size="xs" compact onClick={resetColumnsOrder}>
            Reset Column Order
          </Button>
          <Button size="xs" compact onClick={resetColumnsToggle}>
            Reset Column Toggle
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
