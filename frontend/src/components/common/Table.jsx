'use client';

import React, { useState } from 'react';

// Table Component
const Table = ({
  columns = [],
  data = [],
  sortable = true,
  selectable = false,
  onRowClick = null,
  loading = false,
  className = '',
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);

  const handleSort = (columnKey) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig?.key === columnKey && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key: columnKey, direction });
  };

  const handleSelectRow = (rowIndex) => {
    setSelectedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((i) => i !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((_, index) => index));
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });

    return sorted;
  }, [data, sortConfig]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg shadow ${className}`.trim()}>
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {selectable && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                />
              </th>
            )}

            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                className={`
                  px-6 py-3 text-left text-sm font-semibold text-gray-900
                  ${column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                `.trim()}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {sortable && column.sortable !== false && (
                    <svg
                      className={`w-4 h-4 transition duration-300 ${
                        sortConfig?.key === column.key
                          ? 'opacity-100'
                          : 'opacity-30'
                      } ${
                        sortConfig?.key === column.key &&
                        sortConfig?.direction === 'desc'
                          ? 'rotate-180'
                          : ''
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h5a1 1 0 000-2H3zm0 4a1 1 0 100 2h4a1 1 0 100-2H3zm11-4a1 1 0 10-2 0v5.586L9.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 10.586V7z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`
                border-b border-gray-200 transition duration-300
                ${onRowClick ? 'hover:bg-blue-50 cursor-pointer' : ''}
                ${selectedRows.includes(rowIndex) ? 'bg-blue-50' : 'hover:bg-gray-50'}
              `.trim()}
            >
              {selectable && (
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowIndex)}
                    onChange={() => handleSelectRow(rowIndex)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                  />
                </td>
              )}

              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
