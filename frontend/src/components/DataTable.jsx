import React from "react";

const DataTable = ({ columns, data, emptyMessage = "No records found" }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-blue-50/70 text-xs uppercase font-semibold text-blue-950 border-b border-blue-100 tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-3.5 ${col.align === "right" || col.rightAlign ? "text-right" : "text-left"}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-blue-50/40 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 text-sm font-normal text-slate-900 ${col.align === "right" || col.rightAlign ? "text-right" : "text-left"}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-sm text-slate-400 font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
