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

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Bill creation modal
  const [showBillModal, setShowBillModal] = useState(false);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/purchase-orders/${id}`);
      setPurchaseOrder(res.data.data);
    } catch (err) {
      console.error("Error fetching purchase order:", err);
      setError(err.response?.data?.message || "Purchase order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const handleCreateBill = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await api.post(`/bills/from-purchase-order/${id}`, {
        due_date: dueDate,
      });
      setShowBillModal(false);
      if (res.data?.data?.id) {
        navigate(`/bills/${res.data.data.id}`);
      } else {
        fetchPurchaseOrder();
      }
    } catch (err) {
      console.error("Error creating bill from PO:", err);
      setError(err.response?.data?.message || "Failed to create vendor bill");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading text="Loading purchase order document..." />;

  if (error || !purchaseOrder) {
    return (
      <div className="space-y-4">
        <Link to="/purchase-orders" className="text-xs text-blue-600 hover:underline">
          &larr; Back to Purchase Orders
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-center">
          <h2 className="text-lg font-bold mb-1">Purchase Order Error</h2>
          <p className="text-sm">{error || "Purchase order not found."}</p>
        </div>
      </div>
    );
  }

  const items = purchaseOrder.purchase_order_items || [];
  const vendor = purchaseOrder.contacts || {};
  const hasBill = purchaseOrder.vendor_bills && purchaseOrder.vendor_bills.length > 0;
  const bill = hasBill ? purchaseOrder.vendor_bills[0] : null;

  // Workflow timeline steps
  const steps = [
    { key: "DRAFT", label: "Draft PO" },
    { key: "CONFIRMED", label: "Confirmed Order" },
    { key: "BILLED", label: "Vendor Billed" },
  ];
  let currentKey = "DRAFT";
  let completedKeys = [];

  if (hasBill) {
    currentKey = "BILLED";
    completedKeys = ["DRAFT", "CONFIRMED", "BILLED"];
  } else if (purchaseOrder.status === "CONFIRMED") {
    currentKey = "CONFIRMED";
    completedKeys = ["DRAFT", "CONFIRMED"];
  } else {
    currentKey = "DRAFT";
    completedKeys = ["DRAFT"];
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={purchaseOrder.order_number}
        subtitle={`Procurement Order for ${vendor.name || "Vendor"}`}
        breadcrumbs={[
          { label: "Purchase Orders", path: "/purchase-orders" },
          { label: purchaseOrder.order_number },
        ]}
        status={purchaseOrder.status}
        actions={
          hasBill ? (
            <Link
              to={`/bills/${bill.id}`}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <span>View Vendor Bill ({bill.bill_number}) &rarr;</span>
            </Link>
          ) : (
            <button
              onClick={() => setShowBillModal(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-100 transition-all"
            >
              <i className="fa-solid fa-receipt text-xs"></i>
              <span>Create Vendor Bill</span>
            </button>
          )
        }
      />

      {/* Workflow timeline */}
      <WorkflowTimeline steps={steps} currentStepKey={currentKey} completedKeys={completedKeys} />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Vendor / Supplier Details
          </h3>
          <div>
            <span className="text-lg font-bold text-slate-900 block">{vendor.name || "N/A"}</span>
            <div className="text-xs text-slate-500 space-y-0.5 mt-1 font-medium">
              {vendor.email && <p>Email: {vendor.email}</p>}
              {vendor.phone && <p>Phone: {vendor.phone}</p>}
              {vendor.address && <p>Address: {vendor.address}</p>}
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
              <span className="font-bold text-slate-900">{formatDate(purchaseOrder.order_date)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5 font-medium">
              <span className="text-slate-500">Payment Terms:</span>
              <span className="font-bold text-slate-900">{purchaseOrder.payment_terms || "Net 30"}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Linked Vendor Bill:</span>
              {hasBill ? (
                <Link to={`/bills/${bill.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                  {bill.bill_number}
                </Link>
              ) : (
                <span className="text-slate-400 font-medium">Not Billed Yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-blue-50/70">
          <h3 className="font-black text-blue-950 text-sm uppercase tracking-wider">Procurement Items Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/50 text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Product Description</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost (₹)</th>
                  <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
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
            <FinancialSummary subtotal={purchaseOrder.subtotal} totalAmount={purchaseOrder.total_amount} />
          </div>
        </div>
      </div>

      {/* Modal for Bill Creation */}
      <Modal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        title={`Generate Vendor Bill for ${purchaseOrder.order_number}`}
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            This action will record a formal Vendor Bill and automatically post a General Ledger Journal Entry (Debit 5000 Purchases Expense, Credit 2000 Accounts Payable).
          </p>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Bill Due Date *
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
              onClick={() => setShowBillModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBill}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 transition-all"
            >
              {actionLoading ? "Posting Vendor Bill..." : "Post Vendor Bill"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PurchaseOrderDetail;
