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

import Modal from "../components/Modal";

const Payments = () => {
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get("type"); // "customer" or "vendor"

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState("CUSTOMER"); // CUSTOMER or VENDOR
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    target_id: "",
    amount: "",
    payment_method: "BANK",
    payment_date: new Date().toISOString().split("T")[0],
    reference: "",
  });

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

  const handleOpenModal = async () => {
    try {
      const [invRes, billRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/bills"),
      ]);
      const invs = invRes.data?.data || (Array.isArray(invRes.data) ? invRes.data : []);
      const bills = billRes.data?.data || (Array.isArray(billRes.data) ? billRes.data : []);

      const pendingInvs = invs.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED");
      const pendingBills = bills.filter((b) => b.status !== "PAID" && b.status !== "CANCELLED");

      setUnpaidInvoices(pendingInvs);
      setUnpaidBills(pendingBills);

      const defaultTarget = pendingInvs.length > 0 ? pendingInvs[0].id : "";
      const defaultAmount = pendingInvs.length > 0 ? Math.max(0, Number(pendingInvs[0].total_amount || 0) - Number(pendingInvs[0].paid_amount || 0)) : "";

      setPaymentForm({
        target_id: defaultTarget,
        amount: defaultAmount ? String(defaultAmount) : "",
        payment_method: "BANK",
        payment_date: new Date().toISOString().split("T")[0],
        reference: defaultTarget ? `Payment for Invoice` : "",
      });

      setShowModal(true);
    } catch (err) {
      console.error("Error fetching pending documents for payment:", err);
      alert("Failed to load pending invoices or bills");
    }
  };

  const handleTypeChange = (type) => {
    setModalType(type);
    if (type === "CUSTOMER") {
      const target = unpaidInvoices.length > 0 ? unpaidInvoices[0] : null;
      const due = target ? Math.max(0, Number(target.total_amount || 0) - Number(target.paid_amount || 0)) : 0;
      setPaymentForm((prev) => ({
        ...prev,
        target_id: target ? target.id : "",
        amount: due > 0 ? String(due) : "",
        reference: target ? `Payment for Invoice ${target.invoice_number}` : "",
      }));
    } else {
      const target = unpaidBills.length > 0 ? unpaidBills[0] : null;
      const due = target ? Math.max(0, Number(target.total_amount || 0) - Number(target.paid_amount || 0)) : 0;
      setPaymentForm((prev) => ({
        ...prev,
        target_id: target ? target.id : "",
        amount: due > 0 ? String(due) : "",
        reference: target ? `Payment for Bill ${target.bill_number}` : "",
      }));
    }
  };

  const handleDocChange = (docId) => {
    if (modalType === "CUSTOMER") {
      const target = unpaidInvoices.find((i) => i.id === docId);
      const due = target ? Math.max(0, Number(target.total_amount || 0) - Number(target.paid_amount || 0)) : 0;
      setPaymentForm((prev) => ({
        ...prev,
        target_id: docId,
        amount: due > 0 ? String(due) : "",
        reference: target ? `Payment for Invoice ${target.invoice_number}` : "",
      }));
    } else {
      const target = unpaidBills.find((b) => b.id === docId);
      const due = target ? Math.max(0, Number(target.total_amount || 0) - Number(target.paid_amount || 0)) : 0;
      setPaymentForm((prev) => ({
        ...prev,
        target_id: docId,
        amount: due > 0 ? String(due) : "",
        reference: target ? `Payment for Bill ${target.bill_number}` : "",
      }));
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.target_id) {
      alert("Please select a document to pay against");
      return;
    }
    if (!Number(paymentForm.amount) || Number(paymentForm.amount) <= 0) {
      alert("Please enter a valid payment amount greater than 0");
      return;
    }

    try {
      setSubmitting(true);
      if (modalType === "CUSTOMER") {
        await api.post("/payments/customer", {
          invoice_id: paymentForm.target_id,
          amount: Number(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          payment_date: paymentForm.payment_date,
          reference: paymentForm.reference,
        });
      } else {
        await api.post("/payments/vendor", {
          bill_id: paymentForm.target_id,
          amount: Number(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          payment_date: paymentForm.payment_date,
          reference: paymentForm.reference,
        });
      }
      setShowModal(false);
      fetchPayments();
    } catch (err) {
      console.error("Error submitting payment:", err);
      alert(err.response?.data?.message || "Failed to record payment transaction");
    } finally {
      setSubmitting(false);
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
        actions={
          <button
            type="button"
            onClick={handleOpenModal}
            className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152e70] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-2"
          >
            <i className="fa-solid fa-plus" />
            <span>Record New Payment</span>
          </button>
        }
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
          actionLabel="Record Payment Now"
          onAction={handleOpenModal}
        />
      ) : (
        <DataTable columns={columns} data={filteredPayments} emptyMessage="No payment transactions found." />
      )}

      {/* Modal for Recording New Payment */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record New Cash / Bank Payment"
      >
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Payment Category *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange("CUSTOMER")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  modalType === "CUSTOMER"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                📥 Customer Receipt (Inflow)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("VENDOR")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  modalType === "VENDOR"
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                📤 Vendor Payment (Outflow)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {modalType === "CUSTOMER" ? "Select Pending Invoice *" : "Select Pending Bill *"}
            </label>
            {modalType === "CUSTOMER" ? (
              <select
                value={paymentForm.target_id}
                onChange={(e) => handleDocChange(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Customer Invoice...</option>
                {unpaidInvoices.map((inv) => {
                  const due = Math.max(0, Number(inv.total_amount || 0) - Number(inv.paid_amount || 0));
                  return (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} ({inv.contacts?.name || "Customer"}) — Due: ₹{due.toFixed(2)}
                    </option>
                  );
                })}
              </select>
            ) : (
              <select
                value={paymentForm.target_id}
                onChange={(e) => handleDocChange(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Vendor Bill...</option>
                {unpaidBills.map((b) => {
                  const due = Math.max(0, Number(b.total_amount || 0) - Number(b.paid_amount || 0));
                  return (
                    <option key={b.id} value={b.id}>
                      {b.bill_number} ({b.contacts?.name || "Vendor"}) — Due: ₹{due.toFixed(2)}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="10000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Payment Method & Account *
              </label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BANK">BANK (1010 Bank Account)</option>
                <option value="CASH">CASH (1000 Physical Cash)</option>
                <option value="CARD">CARD (1010 Bank Transfer)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Payment Reference / Description
            </label>
            <input
              type="text"
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              placeholder="e.g. Bank Transfer Ref #12345"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white rounded-xl text-xs font-extrabold shadow-sm"
            >
              {submitting ? "Saving Voucher..." : "Save Payment Voucher"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
