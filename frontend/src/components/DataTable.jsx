import React, { useState } from "react";

const DataTable = ({
  columns,
  data = [],
  emptyMessage = "No records found",
  enableSearch = true,
  enableExport = true,
  exportTitle = "ERP_Report",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to extract text from a cell
  const getCellText = (row, col) => {
    if (col.render) return col.render(row);
    if (typeof col.accessor === "function") return col.accessor(row);
    return row[col.accessor];
  };

  // Filter data based on search query
  const filteredData = data.filter((row) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return columns.some((col) => {
      const val = getCellText(row, col);
      if (val === null || val === undefined) return false;
      if (typeof val === "string" || typeof val === "number") {
        return String(val).toLowerCase().includes(query);
      }
      return false;
    });
  });

  // Export visible data to CSV
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(",");
    const rows = filteredData.map((row) => {
      return columns
        .map((col) => {
          let val = row[col.accessor];
          if (typeof col.accessor === "function") {
            val = col.accessor(row);
          }
          if (typeof val === "object" && val !== null) {
            val = row.id || JSON.stringify(val);
          }
          const cleanVal = String(val ?? "").replace(/"/g, '""').replace(/\n/g, " ");
          return `"${cleanVal}"`;
        })
        .join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${exportTitle}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Control Bar: Search & CSV Export */}
      {(enableSearch || enableExport) && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          {enableSearch ? (
            <div className="relative w-full sm:w-72">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter table rows..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          ) : <div></div>}

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <span className="text-[11px] font-extrabold text-slate-500 font-mono">
              Showing {filteredData.length} of {data.length} records
            </span>
            {enableExport && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-[#1E3A8A] font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-300 transition-all shadow-xs"
                title="Download CSV spreadsheet report"
              >
                <i className="fa-solid fa-file-csv text-sm text-[#1E3A8A]"></i>
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-slate-200">
        <table className="w-full text-left text-sm text-slate-700 border-collapse">
          <thead className="bg-[#1E3A8A] text-xs uppercase font-extrabold text-white tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 ${col.align === "right" || col.rightAlign ? "text-right" : "text-left"}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 text-sm font-medium text-slate-900 ${col.align === "right" || col.rightAlign ? "text-right" : "text-left"}`}>
                      {col.render
                        ? col.render(row)
                        : typeof col.accessor === "function"
                        ? col.accessor(row)
                        : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-slate-400 font-medium"
                >
                  {searchQuery ? `No records match filter "${searchQuery}".` : emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
