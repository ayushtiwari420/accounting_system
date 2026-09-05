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

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/invoices");
      const data = res.data?.data || res.data || [];
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching customer invoices:", err);
      setError("Failed to load customer invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const columns = [
    {
      header: "Invoice Number",
      accessor: (row) => (
        <Link
          to={`/invoices/${row.id}`}
          className="font-mono text-[#1E3A8A] font-extrabold hover:underline text-xs"
        >
          {row.invoice_number}
        </Link>
      ),
    },
    {
      header: "Customer Name",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">
            {row.contacts?.name || "N/A"}
          </span>
          <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-[#1E3A8A] border border-slate-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
            {row.contacts?.type || "CUSTOMER"}
          </span>
        </div>
      ),
    },
    {
      header: "Invoiced Furniture Items",
      accessor: (row) => {
        const items = row.customer_invoice_items || [];
        if (items.length === 0) return <span className="text-xs text-slate-400 italic">No items listed</span>;
        return (
          <div className="space-y-1 max-w-xs">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                <span>• {item.products?.name || item.description || "Invoiced Item"}</span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-[#1E3A8A] px-1.5 py-0.5 rounded border border-slate-200">
                  x{Number(item.quantity)}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: "Invoice Date",
      accessor: (row) => formatDate(row.invoice_date),
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
      header: "Total Billed (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.total_amount} size="md" color="default" />
      ),
    },
    {
      header: "Paid Amount (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.paid_amount} size="sm" color="default" />
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
          to={`/invoices/${row.id}`}
          className="text-xs font-bold text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white bg-slate-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
        >
          View Invoice &rarr;
        </Link>
      ),
    },
  ];

  if (loading) return <Loading text="Loading customer accounts receivable ledger..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Invoices"
        subtitle="Accounts Receivable (1100) and sales revenue billing ledger"
        actions={
          <Link
            to="/sales-orders"
            className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <i className="fa-solid fa-file-signature"></i>
            <span>Generate from Sales Orders</span>
          </Link>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {invoices.length === 0 ? (
        <EmptyState
          icon="fa-file-invoice-dollar"
          title="No Customer Invoices"
          description="Generate customer invoices directly from confirmed Sales Orders."
          actionLabel="Go to Sales Orders"
          onAction={() => (window.location.href = "/sales-orders")}
        />
      ) : (
        <DataTable columns={columns} data={invoices} emptyMessage="No invoices found." />
      )}
    </div>
  );
};

export default Invoices;
