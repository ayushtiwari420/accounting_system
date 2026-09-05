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

const SalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sales-orders");
      const data = res.data?.data || res.data || [];
      setSalesOrders(data);
    } catch (err) {
      console.error("Error fetching sales orders:", err);
      setError("Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const columns = [
    {
      header: "Order Number",
      accessor: (row) => (
        <Link
          to={`/sales-orders/${row.id}`}
          className="font-mono text-blue-600 font-extrabold hover:underline text-xs"
        >
          {row.order_number}
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
          <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
            {row.contacts?.type || "CUSTOMER"}
          </span>
        </div>
      ),
    },
    {
      header: "Purchased Furniture Items",
      accessor: (row) => {
        const items = row.sales_order_items || [];
        if (items.length === 0) return <span className="text-xs text-slate-400 italic">No items listed</span>;
        return (
          <div className="space-y-1 max-w-xs">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                <span>• {item.products?.name || item.description || "Furniture Item"}</span>
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
      header: "Order Date",
      accessor: (row) => formatDate(row.order_date),
    },
    {
      header: "Subtotal (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.subtotal || 0} size="sm" color="default" />
      ),
    },
    {
      header: "GST Tax (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.tax_amount || 0} size="sm" color="default" />
      ),
    },
    {
      header: "Grand Total (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.total_amount} size="md" color="default" />
      ),
    },
    {
      header: "Total Lines",
      accessor: (row) => (
        <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-mono font-bold text-xs border border-blue-200">
          {row.sales_order_items?.length || 0} Lines
        </span>
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
          to={`/sales-orders/${row.id}`}
          className="text-xs font-bold text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200"
        >
          View Order &rarr;
        </Link>
      ),
    },
  ];

  if (loading) return <Loading text="Loading sales order ledger..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle="Customer quotations and order fulfillment pipeline"
        actions={
          <Link
            to="/sales-orders/new"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>New Sales Order</span>
          </Link>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {salesOrders.length === 0 ? (
        <EmptyState
          icon="fa-file-signature"
          title="No Sales Orders Created"
          description="Customer quotations generated here can be converted directly into Customer Invoices."
          actionLabel="Create First Sales Order"
          onAction={() => (window.location.href = "/sales-orders/new")}
        />
      ) : (
        <DataTable columns={columns} data={salesOrders} emptyMessage="No sales orders found." />
      )}
    </div>
  );
};

export default SalesOrders;
