import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import CurrencyDisplay from "../components/CurrencyDisplay";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/formatters";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bills");
      const data = res.data?.data || res.data || [];
      setBills(data);
    } catch (err) {
      console.error("Error fetching vendor bills:", err);
      setError("Failed to load vendor bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const columns = [
    {
      header: "Bill Number",
      accessor: (row) => (
        <Link
          to={`/bills/${row.id}`}
          className="font-mono text-blue-600 font-extrabold hover:underline text-xs"
        >
          {row.bill_number}
        </Link>
      ),
    },
    {
      header: "Vendor / Supplier",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">
            {row.contacts?.name || "N/A"}
          </span>
          <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
            {row.contacts?.type || "VENDOR"}
          </span>
        </div>
      ),
    },
    {
      header: "Billed Furniture Items",
      accessor: (row) => {
        const items = row.vendor_bill_items || [];
        if (items.length === 0) return <span className="text-xs text-slate-400 italic">No items listed</span>;
        return (
          <div className="space-y-1 max-w-xs">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                <span>• {item.products?.name || item.description || "Billed Item"}</span>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">
                  x{Number(item.quantity)}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: "Bill Date",
      accessor: (row) => formatDate(row.bill_date),
    },
    {
      header: "Due Date",
      accessor: (row) => formatDate(row.due_date),
    },
    {
      header: "Subtotal (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.subtotal || 0} size="sm" color="default" />
      ),
    },
    {
      header: "Tax Amount (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.tax_amount || 0} size="sm" color="default" />
      ),
    },
    {
      header: "Total Payable (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.total_amount} size="md" color="default" />
      ),
    },
    {
      header: "Disbursed Paid (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.paid_amount} size="sm" color="success" />
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Action",
      accessor: (row) => (
        <Link
          to={`/bills/${row.id}`}
          className="text-xs font-bold text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200"
        >
          View Bill &rarr;
        </Link>
      ),
    },
  ];

  if (loading) return <Loading text="Loading vendor accounts payable ledger..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Bills"
        subtitle="Accounts Payable (2000) and supplier expense ledger"
        actions={
          <Link
            to="/purchase-orders"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Generate from Purchase Orders</span>
          </Link>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {bills.length === 0 ? (
        <EmptyState
          icon="fa-receipt"
          title="No Vendor Bills"
          description="Generate vendor bills directly from confirmed Purchase Orders."
          actionLabel="Go to Purchase Orders"
          onAction={() => (window.location.href = "/purchase-orders")}
        />
      ) : (
        <DataTable columns={columns} data={bills} emptyMessage="No vendor bills found." />
      )}
    </div>
  );
};

export default Bills;
