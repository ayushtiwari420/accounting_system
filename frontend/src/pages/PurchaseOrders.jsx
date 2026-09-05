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

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/purchase-orders");
      const data = res.data?.data || res.data || [];
      setPurchaseOrders(data);
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      setError("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const columns = [
    {
      header: "PO Number",
      accessor: (row) => (
        <Link
          to={`/purchase-orders/${row.id}`}
          className="font-mono text-[#1E3A8A] font-extrabold hover:underline text-xs"
        >
          {row.order_number}
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
          <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-[#1E3A8A] border border-slate-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
            {row.contacts?.type || "VENDOR"}
          </span>
        </div>
      ),
    },
    {
      header: "Procured Furniture Items",
      accessor: (row) => {
        const items = row.purchase_order_items || [];
        if (items.length === 0) return <span className="text-xs text-slate-400 italic">No items listed</span>;
        return (
          <div className="space-y-1 max-w-xs">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                <span>• {item.products?.name || item.description || "Procured Item"}</span>
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
      header: "Total Cost (₹)",
      accessor: (row) => (
        <CurrencyDisplay amount={row.total_amount} size="md" color="default" />
      ),
    },
    {
      header: "Total Lines",
      accessor: (row) => (
        <span className="bg-slate-100 text-[#1E3A8A] px-2 py-0.5 rounded font-mono font-bold text-xs border border-slate-200">
          {row.purchase_order_items?.length || 0} Lines
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
          to={`/purchase-orders/${row.id}`}
          className="text-xs font-bold text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white bg-slate-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
        >
          View Order &rarr;
        </Link>
      ),
    },
  ];

  if (loading) return <Loading text="Loading purchase procurement orders..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Vendor procurement orders and inventory sourcing"
        actions={
          <Link
            to="/purchase-orders/new"
            className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus"></i>
            <span>New Purchase Order</span>
          </Link>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {purchaseOrders.length === 0 ? (
        <EmptyState
          icon="fa-cart-shopping"
          title="No Purchase Orders Created"
          description="Create vendor purchase orders to convert into Vendor Bills and manage Accounts Payable."
          actionLabel="Create First Purchase Order"
          onAction={() => (window.location.href = "/purchase-orders/new")}
        />
      ) : (
        <DataTable columns={columns} data={purchaseOrders} emptyMessage="No purchase orders found." />
      )}
    </div>
  );
};

export default PurchaseOrders;
