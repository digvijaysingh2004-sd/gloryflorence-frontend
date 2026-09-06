import React from 'react';
import './Table.css';

export interface Column<T> {
  key: string;
  title: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  rowKey?: keyof T | ((item: T) => string | number);
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  rowKey,
}: TableProps<T>) {
  const getRowKey = (item: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(item);
    }
    if (rowKey && item[rowKey] !== undefined) {
      return item[rowKey] as unknown as string | number;
    }
    return (item as { id?: string | number }).id || index;
  };

  return (
    <div className="table-container">
      <table className="table-element">
        <thead className="table-thead">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="table-th"
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-tbody">
          {isLoading ? (
            // Render 4 skeleton rows while loading
            Array.from({ length: 4 }).map((_, rIdx) => (
              <tr key={`skeleton-row-${rIdx}`} className="table-tr">
                {columns.map((col) => (
                  <td key={`skeleton-cell-${col.key}`} className="table-td-skeleton">
                    <div className="table-skeleton-bar shimmer" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr className="table-tr table-empty-row">
              <td colSpan={columns.length} className="table-empty-cell">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={getRowKey(item, index)}
                className={`table-tr ${onRowClick ? 'table-tr-hoverable' : ''}`}
                onClick={() => onRowClick?.(item)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="table-td">
                    {col.render ? col.render(item, index) : (item as Record<string, any>)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
