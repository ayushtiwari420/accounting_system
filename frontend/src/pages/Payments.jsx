import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import CurrencyDisplay from "../components/CurrencyDisplay";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/formatters";

const Payments = () => {
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get("type"); // "customer" or "vendor"

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments");
      const data = res.data?.data || res.data || [];
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (typeFilter === "customer") return Boolean(p.invoice_id || p.customer_invoices);
    if (typeFilter === "vendor") return Boolean(p.bill_id || p.vendor_bills);
    return true;
  });

  const columns = [
    {
      header: "Payment Voucher",
      accessor: (row) => (
        <Link
          to={`/payments/${row.id}`}
          className="font-mono text-blue-600 font-extrabold hover:underline text-xs"
        >
          {row.payment_number}
        </Link>
      ),
    },
    {
      header: "Transaction Type",
      accessor: (row) => {
        const isCustomer = Boolean(row.invoice_id || row.customer_invoices);
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
              isCustomer
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-blue-100 text-blue-900 border border-blue-200"
            }`}
          >
            {isCustomer ? "Customer Inbound" : "Vendor Outbound"}
          </span>
        );
      },
    },
    {
      header: "Party / Contact",
      accessor: (row) => {
        const contact = row.customer_invoices?.contacts || row.vendor_bills?.contacts;
        const name = contact?.name || "Direct Party";
        const type = contact?.type || (row.invoice_id ? "CUSTOMER" : "VENDOR");
        return (
          <div>
            <span className="font-bold text-slate-900 text-xs block">{name}</span>
            <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
              {type}
            </span>
          </div>
        );
      },
    },
    {
      header: "Target Document",
      accessor: (row) => {
        if (row.customer_invoices) {
          return (
            <Link to={`/invoices/${row.customer_invoices.id}`} className="font-mono text-blue-600 font-bold text-xs hover:underline">
              {row.customer_invoices.invoice_number}
            </Link>
          );
        }
        if (row.vendor_bills) {
          return (
            <Link to={`/bills/${row.vendor_bills.id}`} className="font-mono text-amber-700 font-bold text-xs hover:underline">
              {row.vendor_bills.bill_number}
            </Link>
          );
        }
        return <span className="font-mono text-slate-500 text-xs">Direct Voucher</span>;
      },
    },
    {
      header: "Settled Furniture Items",
      accessor: (row) => {
        const items = row.customer_invoices?.customer_invoice_items || row.vendor_bills?.vendor_bill_items || [];
        if (items.length === 0) return <span className="text-xs text-slate-400 italic">Direct ledger entry</span>;
        return (
          <div className="space-y-1 max-w-xs">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                <span>• {item.products?.name || item.description || "Settled Item"}</span>
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
      header: "Payment Date",
      accessor: (row) => formatDate(row.payment_date),
    },
    {
      header: "Payment Method",
      accessor: (row) => (
        <span className="font-mono text-slate-800 font-bold text-xs bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
          {row.payment_method}
        </span>
      ),
    },
    {
      header: "Settlement Ledger",
      accessor: (row) => (
        <span className="text-xs font-mono font-bold text-slate-600">
          {row.payment_method === "CASH" ? "1000 Cash" : "1010 Bank"}
        </span>
      ),
    },
    {
      header: "Amount Paid (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.amount} size="md" color="success" />
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status || "POSTED"} />,
    },
    {
      header: "Action",
      accessor: (row) => (
        <Link
          to={`/payments/${row.id}`}
          className="text-xs font-bold text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200"
        >
          View Voucher &rarr;
        </Link>
      ),
    },
  ];

  if (loading) return <Loading text="Loading payment transactions & bank ledgers..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          typeFilter === "customer"
            ? "Customer Payments Received"
            : typeFilter === "vendor"
            ? "Vendor Payments Outbound"
            : "All Payment Transactions"
        }
        subtitle="Cash (1000) and Bank Transfer (1010) double-entry settlement log"
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {filteredPayments.length === 0 ? (
        <EmptyState
          icon="fa-money-bill-transfer"
          title="No Payment Records Found"
          description="Register payments against outstanding Customer Invoices or Vendor Bills to see transactions here."
          actionLabel="View Customer Invoices"
          onAction={() => (window.location.href = "/invoices")}
        />
      ) : (
        <DataTable columns={columns} data={filteredPayments} emptyMessage="No payment transactions found." />
      )}
    </div>
  );
};

export default Payments;
