import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable, type DataTableColumn } from './DataTable';

interface Row {
  id: string;
  name: string;
}

const columns: DataTableColumn<Row>[] = [{ key: 'name', header: 'Name', render: (row) => row.name }];

describe('DataTable', () => {
  it('renders caption, column headers and rows', () => {
    render(<DataTable caption="Sensors" columns={columns} rows={[{ id: '1', name: 'Pump A' }]} rowKey={(r) => r.id} />);

    const table = screen.getByRole('table', { name: 'Sensors' });
    expect(within(table).getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: 'Pump A' })).toBeInTheDocument();
  });

  it('shows an explicit empty state', () => {
    render(<DataTable caption="Sensors" columns={columns} rows={[]} rowKey={(r) => r.id} />);

    expect(screen.getByRole('cell', { name: 'No data to display.' })).toBeInTheDocument();
  });
});
