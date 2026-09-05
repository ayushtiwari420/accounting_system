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

  // Helper to extract text from a cell for search filtering
  const getCellText = (row, col) => {
    if (col.render) return col.render(row);
    if (typeof col.accessor === "function") return col.accessor(row);
    return row[col.accessor];
  };

  // Helper to extract clean human-readable text for CSV exporting
  const getCellTextForCSV = (row, col) => {
    if (typeof col.csvValue === "function") {
      return col.csvValue(row);
    }

    let node;
    if (typeof col.accessor === "function") {
      node = col.accessor(row);
    } else if (typeof col.accessor === "string" && row[col.accessor] !== undefined) {
      node = row[col.accessor];
    } else if (col.render) {
      node = col.render(row);
    }

    const extractText = (val) => {
      if (val === null || val === undefined) return "";
      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        return String(val);
      }
      if (Array.isArray(val)) {
        return val.map(extractText).filter(Boolean).join(" ");
      }
      if (typeof val === "object") {
        // If CurrencyDisplay component or node with amount prop
        if (val.props && val.props.amount !== undefined) {
          const amt = Number(val.props.amount) || 0;
          return `₹${amt.toLocaleString("en-IN")}`;
        }
        // If StatusBadge component or node with status prop
        if (val.props && val.props.status !== undefined) {
          return String(val.props.status);
        }
        // If node has children props
        if (val.props && val.props.children !== undefined) {
          return extractText(val.props.children);
        }
        // Common domain entity properties
        if (val.name) return String(val.name);
        if (val.invoice_number) return String(val.invoice_number);
        if (val.bill_number) return String(val.bill_number);
        if (val.order_number) return String(val.order_number);
        if (val.payment_number) return String(val.payment_number);
        if (val.entry_number) return String(val.entry_number);
        if (val.code) return String(val.code);
      }
      return "";
    };

    const text = extractText(node);
    if (text) return text.trim();

    // Direct fallback if string accessor exists
    if (typeof col.accessor === "string" && row[col.accessor] !== undefined) {
      const v = row[col.accessor];
      if (typeof v !== "object") return String(v);
    }

    return "";
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

  // Export visible data to CSV with clean text values
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(",");
    const rows = filteredData.map((row) => {
      return columns
        .map((col) => {
          const val = getCellTextForCSV(row, col);
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          {enableSearch ? (
            <div className="relative w-full sm:w-72">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter table rows..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#1E3A8A] min-h-[40px]"
              />
            </div>
          ) : <div></div>}

          <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto">
            <span className="text-[11px] font-extrabold text-slate-500 tabular-nums">
              Showing {filteredData.length} of {data.length} records
            </span>
            {enableExport && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-[#1E3A8A] font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-300 transition-all shadow-xs min-h-[40px]"
                title="Download CSV spreadsheet report"
              >
                <i className="fa-solid fa-file-csv text-sm text-[#1E3A8A]"></i>
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Container with Touch Momentum Horizontal Scroll */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-slate-200 touch-pan-x scrollbar-thin">
        <table className="w-full text-left text-sm text-slate-700 border-collapse min-w-[600px] sm:min-w-0">
          <thead className="bg-[#1E3A8A] text-xs leading-4 uppercase font-bold text-white tracking-[0.03em] sticky top-0 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3.5 sm:px-6 sm:py-4 ${col.align === "right" || col.rightAlign ? "text-right" : "text-left"}`}>
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
                    <td key={colIndex} className={`px-4 py-3 sm:px-6 sm:py-4 text-sm leading-5 font-normal text-[#0F172A] ${col.align === "right" || col.rightAlign ? "text-right" : "text-left"}`}>
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
