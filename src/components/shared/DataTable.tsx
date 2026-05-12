import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export default function DataTable<T>({ data, columns, keyExtractor, emptyMessage = "No data found" }: DataTableProps<T>) {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-slate-300">
              <thead className="bg-slate-50">
                <tr>
                  {columns.map((col, index) => (
                    <th 
                      key={index}
                      scope="col" 
                      className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6 ${col.className || ''}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr key={keyExtractor(item)}>
                      {columns.map((col, index) => (
                        <td 
                          key={index} 
                          className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 sm:pl-6 ${col.className || ''}`}
                        >
                          {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-4 text-center text-sm text-slate-500">
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
