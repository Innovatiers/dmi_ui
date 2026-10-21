import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface DataTableColumn<TRow> {
  readonly key: string;
  readonly header: string;
  readonly render: (row: TRow) => ReactNode;
}

export interface DataTableProps<TRow> {
  readonly caption: string;
  readonly columns: readonly DataTableColumn<TRow>[];
  readonly rows: readonly TRow[];
  readonly rowKey: (row: TRow) => string;
}

/** Semantic table with caption and column headers; shows an explicit empty state. */
export function DataTable<TRow>({ caption, columns, rows, rowKey }: DataTableProps<TRow>) {
  const { t } = useTranslation();
  return (
    <table className="cw-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>{t('table.empty')}</td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
