import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import AccountingTrace from "../components/AccountingTrace";
import WorkflowTimeline from "../components/WorkflowTimeline";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import FinancialSummary from "../components/FinancialSummary";
import CurrencyDisplay from "../components/CurrencyDisplay";
import { formatDate } from "../utils/formatters";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "BANK",
    payment_date: new Date().toISOString().split("T")[0],
    reference: "",
  });

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invoices/${id}`);
      const invData = res.data.data;
      setInvoice(invData);

      const total = Number(invData.total_amount || 0);
      const paid = Number(invData.paid_amount || 0);
      const remaining = Math.max(0, total - paid);

      setPaymentForm((prev) => ({
        ...prev,
        amount: remaining.toFixed(2),
        reference: `Payment for ${invData.invoice_number}`,
      }));
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError(err.response?.data?.message || "Invoice not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);

      await api.post("/payments/customer", {
        invoice_id: id,
        amount: Number(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        payment_date: paymentForm.payment_date,
        reference: paymentForm.reference,
      });

      setShowPaymentModal(false);
      fetchInvoice();
    } catch (err) {
      console.error("Error registering payment:", err);
      setError(err.response?.data?.message || "Failed to process customer payment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading text="Loading customer invoice document & GL trace..." />;

  if (error && !invoice) {
    return (
      <div className="space-y-4">
        <Link to="/invoices" className="text-xs text-blue-600 hover:underline">
          &larr; Back to Invoices
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-center">
          <h2 className="text-lg font-bold mb-1">Invoice Error</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const items = invoice.customer_invoice_items || [];
  const customer = invoice.contacts || {};
  const totalAmount = Number(invoice.total_amount || 0);
  const paidAmount = Number(invoice.paid_amount || 0);
  const remainingDue = Math.max(0, totalAmount - paidAmount);
  const isFullyPaid = invoice.status === "PAID" || remainingDue <= 0.01;

  // Workflow timeline steps
  const steps = [
    { key: "POSTED", label: "Invoice Issued & Posted" },
    { key: "PARTIALLY_PAID", label: "Partially Paid" },
    { key: "PAID", label: "Fully Paid" },
  ];
  let currentKey = "POSTED";
  let completedKeys = ["POSTED"];

  if (isFullyPaid) {
    currentKey = "PAID";
    completedKeys = ["POSTED", "PARTIALLY_PAID", "PAID"];
  } else if (paidAmount > 0) {
    currentKey = "PARTIALLY_PAID";
    completedKeys = ["POSTED", "PARTIALLY_PAID"];
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={invoice.invoice_number}
        subtitle={`Customer Invoice for ${customer.name || "Customer"}`}
        breadcrumbs={[
          { label: "Customer Invoices", path: "/invoices" },
          { label: invoice.invoice_number },
        ]}
        status={invoice.status}
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
            >
              <i className="fa-solid fa-print"></i>
              <span>Print Invoice</span>
            </button>

            {!isFullyPaid && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-100 transition-all"
              >
                <i className="fa-solid fa-money-bill-wave"></i>
                <span>Register Customer Payment</span>
              </button>
            )}
          </div>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Workflow timeline */}
      <WorkflowTimeline steps={steps} currentStepKey={currentKey} completedKeys={completedKeys} />

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Total Invoiced</span>
          <CurrencyDisplay amount={totalAmount} size="xl" color="default" />
          <span className="text-xs text-slate-500 block font-medium">
            Invoice Date: {formatDate(invoice.invoice_date)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Total Collected</span>
          <CurrencyDisplay amount={paidAmount} size="xl" color="success" />
          <span className="text-xs text-slate-500 block font-medium">
            Status: {invoice.status}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Balance Due</span>
          <CurrencyDisplay amount={remainingDue} size="xl" color={remainingDue > 0 ? "danger" : "success"} />
          <span className="text-xs text-slate-500 block font-medium">
            Due Date: {formatDate(invoice.due_date)}
          </span>
        </div>
      </div>

      {/* Printable Invoice Document Header & Items */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-black text-blue-900 uppercase tracking-widest block">CUSTOMER INVOICE</span>
            <h2 className="text-2xl font-black text-blue-950">URBAN FURNITURE CO.</h2>
            <p className="text-xs text-slate-500 font-medium">Financial Accounting & Operational ERP System</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold font-mono text-slate-800">{invoice.invoice_number}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Invoice Date: {formatDate(invoice.invoice_date)}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Due Date: {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-blue-100 bg-blue-50/70 text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                <th className="py-2.5 px-3">Product / Line Description</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Unit Price (₹)</th>
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
                      {product.name || item.description || "Line Item"}
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
          <FinancialSummary
            subtotal={invoice.subtotal || totalAmount}
            taxAmount={invoice.tax_amount || 0}
            totalAmount={totalAmount}
            paidAmount={paidAmount}
            showPaymentDetails={true}
          />
        </div>
      </div>

      {/* General Ledger Accounting Trace */}
      <AccountingTrace journalEntry={invoice.journal_entries} title="Automatic Accounts Receivable GL Traceability" />

      {/* Payment Registration Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Register Customer Payment for ${invoice.invoice_number}`}
      >
        <form onSubmit={handleRegisterPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              max={remainingDue}
              min="0.01"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Max allowable payment balance: <CurrencyDisplay amount={remainingDue} size="sm" color="danger" />
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Payment Method *
              </label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="BANK">Bank Transfer (Account 1010)</option>
                <option value="CASH">Cash Payment (Account 1000)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Reference / Memo
            </label>
            <input
              type="text"
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Live Accounting Impact Preview */}
          <div className="bg-blue-950 text-white p-4 rounded-xl space-y-2 border border-blue-900 text-xs">
            <div className="text-[10px] font-mono font-bold text-blue-300 uppercase tracking-wider">
              AUTOMATIC ACCOUNTING IMPACT
            </div>
            <div className="flex justify-between font-mono">
              <span>{paymentForm.payment_method === "CASH" ? "1000 Cash" : "1010 Bank Transfer"}</span>
              <span className="text-emerald-400 font-bold">DR <CurrencyDisplay amount={paymentForm.amount || 0} size="sm" color="success" /></span>
            </div>
            <div className="flex justify-between font-mono">
              <span>1100 Accounts Receivable</span>
              <span className="text-blue-300 font-bold">CR <CurrencyDisplay amount={paymentForm.amount || 0} size="sm" color="default" /></span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-100 transition-all"
            >
              {actionLoading ? "Processing Payment..." : "Record Customer Payment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoiceDetail;
