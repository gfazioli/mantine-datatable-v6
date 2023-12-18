import { Button, Group, Stack, Switch } from '@mantine/core';
import { DataTable, useDragToggleColumns } from 'mantine-datatable';
import { useState } from 'react';
import { companies, type Company } from '~/data';

export default function ResizingExample() {
  const key = 'resize-example';

  const [withTableBorder, setWithTableBorder] = useState<boolean>(true);
  const [withColumnBorders, setWithColumnBorders] = useState<boolean>(true);

  const { effectiveColumns, resetColumnsWidth } = useDragToggleColumns<Company>({
    key,
    columns: [
      { accessor: 'name', width: 100, resizable: true },
      { accessor: 'streetAddress', resizable: true },
      { accessor: 'city', resizable: true },
      { accessor: 'state' },
    ],
  });

  return (
    <Stack>
      <DataTable
        withBorder={withTableBorder}
        withColumnBorders={withColumnBorders}
        storeColumnsKey={key}
        records={companies}
        columns={effectiveColumns}
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
          <Button onClick={resetColumnsWidth}>Reset Column Width</Button>
        </Group>
      </Group>
    </Stack>
  );
}
