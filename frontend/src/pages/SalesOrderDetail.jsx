import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import WorkflowTimeline from "../components/WorkflowTimeline";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import FinancialSummary from "../components/FinancialSummary";
import CurrencyDisplay from "../components/CurrencyDisplay";
import { formatDate } from "../utils/formatters";

const SalesOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salesOrder, setSalesOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Invoice creation modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );

  const fetchSalesOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sales-orders/${id}`);
      const soData = res.data?.data || res.data;
      setSalesOrder(soData);
    } catch (err) {
      console.error("Error fetching sales order:", err);
      setError(err.response?.data?.message || "Sales order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOrder();
  }, [id]);

  const handleCreateInvoice = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await api.post(`/invoices/from-sales-order/${id}`, {
        due_date: dueDate,
      });
      setShowInvoiceModal(false);
      if (res.data?.data?.id) {
        navigate(`/invoices/${res.data.data.id}`);
      } else {
        fetchSalesOrder();
      }
    } catch (err) {
      console.error("Error creating invoice from SO:", err);
      setError(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading text="Loading sales order document..." />;

  if (error || !salesOrder) {
    return (
      <div className="space-y-4">
        <Link to="/sales-orders" className="text-xs text-blue-600 hover:underline">
          &larr; Back to Sales Orders
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-center">
          <h2 className="text-lg font-bold mb-1">Sales Order Error</h2>
          <p className="text-sm">{error || "Sales order not found."}</p>
        </div>
      </div>
    );
  }

  const items = salesOrder.sales_order_items || [];
  const customer = salesOrder.contacts || {};
  const hasInvoice = salesOrder.customer_invoices && salesOrder.customer_invoices.length > 0;
  const invoice = hasInvoice ? salesOrder.customer_invoices[0] : null;

  // Workflow status steps
  const steps = [
    { key: "DRAFT", label: "Draft Quotation" },
    { key: "CONFIRMED", label: "Confirmed Order" },
    { key: "INVOICED", label: "Customer Invoiced" },
  ];
  let currentKey = "DRAFT";
  let completedKeys = [];

  if (hasInvoice) {
    currentKey = "INVOICED";
    completedKeys = ["DRAFT", "CONFIRMED", "INVOICED"];
  } else if (salesOrder.status === "CONFIRMED") {
    currentKey = "CONFIRMED";
    completedKeys = ["DRAFT", "CONFIRMED"];
  } else {
    currentKey = "DRAFT";
    completedKeys = ["DRAFT"];
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={salesOrder.order_number}
        subtitle={`Sales Quotation for ${customer.name || "Customer"}`}
        breadcrumbs={[
          { label: "Sales Orders", path: "/sales-orders" },
          { label: salesOrder.order_number },
        ]}
        status={salesOrder.status}
        actions={
          hasInvoice ? (
            <Link
              to={`/invoices/${invoice.id}`}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <span>View Invoice ({invoice.invoice_number}) &rarr;</span>
            </Link>
          ) : (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-100 transition-all"
            >
              <i className="fa-solid fa-file-invoice-dollar text-xs"></i>
              <span>Create Customer Invoice</span>
            </button>
          )
        }
      />

      {/* Workflow timeline */}
      <WorkflowTimeline steps={steps} currentStepKey={currentKey} completedKeys={completedKeys} />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Customer Information
          </h3>
          <div>
            <span className="text-lg font-bold text-slate-900 block">{customer.name || "N/A"}</span>
            <div className="text-xs text-slate-500 space-y-0.5 mt-1 font-medium">
              {customer.email && <p>Email: {customer.email}</p>}
              {customer.phone && <p>Phone: {customer.phone}</p>}
              {customer.address && <p>Address: {customer.address}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Order Parameters
          </h3>
          <div className="text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-100 pb-1.5 font-medium">
              <span className="text-slate-500">Order Date:</span>
              <span className="font-bold text-slate-900">{formatDate(salesOrder.order_date)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5 font-medium">
              <span className="text-slate-500">Payment Terms:</span>
              <span className="font-bold text-slate-900">{salesOrder.payment_terms || "Immediate"}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Linked Invoice:</span>
              {hasInvoice ? (
                <Link to={`/invoices/${invoice.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                  {invoice.invoice_number}
                </Link>
              ) : (
                <span className="text-slate-400 font-medium">Not Invoiced Yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-blue-50/70">
          <h3 className="font-black text-blue-950 text-sm uppercase tracking-wider">Furniture Items Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/50 text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Product Description</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Unit Price (₹)</th>
                  <th className="py-2.5 px-3 text-right">Line Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {items.map((item, idx) => {
                  const product = item.products || {};
                  const lineTotal = Number(item.line_total || item.quantity * item.unit_price || 0);

                  return (
                    <tr key={item.id || idx} className="hover:bg-blue-50/30">
                      <td className="py-3.5 px-3 text-slate-900 font-semibold">
                        <div>
                          <span>{product.name || "Custom Item"}</span>
                          {product.sku && (
                            <span className="text-xs text-slate-400 block font-mono">SKU: {product.sku}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700 font-bold">{item.quantity}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        <CurrencyDisplay amount={item.unit_price} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        <CurrencyDisplay amount={lineTotal} size="sm" color="default" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <FinancialSummary subtotal={salesOrder.subtotal} totalAmount={salesOrder.total_amount} />
          </div>
        </div>
      </div>

      {/* Modal for Invoice Creation */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title={`Generate Customer Invoice for ${salesOrder.order_number}`}
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            This action will issue a formal Customer Invoice and automatically post a General Ledger Journal Entry (Debit 1100 Accounts Receivable, Credit 4000 Sales Income).
          </p>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Invoice Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateInvoice}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 transition-all"
            >
              {actionLoading ? "Posting Invoice..." : "Post Customer Invoice"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesOrderDetail;
