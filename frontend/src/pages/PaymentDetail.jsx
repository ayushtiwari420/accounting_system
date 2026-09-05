import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import AccountingTrace from "../components/AccountingTrace";
import PageHeader from "../components/PageHeader";
import CurrencyDisplay from "../components/CurrencyDisplay";
import { formatDate } from "../utils/formatters";

const PaymentDetail = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/payments/${id}`);
        setPayment(res.data.data);
      } catch (err) {
        console.error("Error fetching payment detail:", err);
        setError(err.response?.data?.message || "Payment record not found");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id]);

  if (loading) return <Loading text="Loading payment voucher & GL trace..." />;

  if (error || !payment) {
    return (
      <div className="space-y-4">
        <Link to="/payments" className="text-xs text-blue-600 hover:underline">
          &larr; Back to Payments
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-center">
          <h2 className="text-lg font-bold mb-1">Payment Voucher Error</h2>
          <p className="text-sm">{error || "Payment record not found."}</p>
        </div>
      </div>
    );
  }

  const isCustomerPayment = Boolean(payment.invoice_id || payment.customer_invoices);
  const linkedInvoice = payment.customer_invoices;
  const linkedBill = payment.vendor_bills;
  const amount = Number(payment.amount || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={payment.payment_number}
        subtitle={isCustomerPayment ? "Customer Payment Settlement Voucher" : "Vendor Outbound Payment Voucher"}
        breadcrumbs={[
          { label: "Payments", path: "/payments" },
          { label: payment.payment_number },
        ]}
        status={payment.status || "POSTED"}
        actions={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
          >
            <i className="fa-solid fa-print"></i>
            <span>Print Payment Voucher</span>
          </button>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Payment Date</span>
          <span className="text-base font-bold text-slate-900 block">
            {formatDate(payment.payment_date)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Method / Account</span>
          <span className="text-base font-bold text-slate-900 block font-mono">
            {payment.payment_method} ({payment.payment_method === "CASH" ? "1000 Cash" : "1010 Bank"})
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Amount Paid</span>
          <CurrencyDisplay amount={amount} size="xl" color="success" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Reference</span>
          <span className="text-base font-bold text-slate-900 block truncate">
            {payment.reference || "—"}
          </span>
        </div>
      </div>

      {/* Explicit Accounting Impact Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-blue-400 font-mono font-bold text-xs uppercase tracking-wider">
            ACCOUNTING IMPACT
          </span>
          <span className="text-slate-500">•</span>
          <h3 className="text-sm font-bold text-white">Double-Entry Ledger Impact</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {isCustomerPayment ? (
            <>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block text-[11px]">DEBIT (DR)</span>
                <span className="text-white text-base font-bold">
                  {payment.payment_method === "CASH" ? "1000 Cash" : "1010 Bank Transfer"}
                </span>
                <p className="text-slate-400 text-[10px]">Increases Liquid Asset</p>
                <div className="text-emerald-400 font-bold text-sm pt-1">
                  DR <CurrencyDisplay amount={amount} size="md" color="success" />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-blue-400 font-bold block text-[11px]">CREDIT (CR)</span>
                <span className="text-white text-base font-bold">1100 Accounts Receivable</span>
                <p className="text-slate-400 text-[10px]">Decreases Customer Receivable Asset</p>
                <div className="text-blue-400 font-bold text-sm pt-1">
                  CR <CurrencyDisplay amount={amount} size="md" color="default" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block text-[11px]">DEBIT (DR)</span>
                <span className="text-white text-base font-bold">2000 Accounts Payable</span>
                <p className="text-slate-400 text-[10px]">Decreases Vendor Liability</p>
                <div className="text-emerald-400 font-bold text-sm pt-1">
                  DR <CurrencyDisplay amount={amount} size="md" color="success" />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-blue-400 font-bold block text-[11px]">CREDIT (CR)</span>
                <span className="text-white text-base font-bold">
                  {payment.payment_method === "CASH" ? "1000 Cash" : "1010 Bank Transfer"}
                </span>
                <p className="text-slate-400 text-[10px]">Decreases Liquid Asset</p>
                <div className="text-blue-400 font-bold text-sm pt-1">
                  CR <CurrencyDisplay amount={amount} size="md" color="default" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Linked Document Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Linked Source Document
        </h3>
        {linkedInvoice && (
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Customer Invoice</span>
              <span className="font-mono font-extrabold text-slate-900 text-base">{linkedInvoice.invoice_number}</span>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Total Invoice Value: <CurrencyDisplay amount={linkedInvoice.total_amount} size="sm" color="default" />
              </p>
            </div>
            <Link
              to={`/invoices/${linkedInvoice.id}`}
              className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              View Invoice &rarr;
            </Link>
          </div>
        )}

        {linkedBill && (
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Vendor Bill</span>
              <span className="font-mono font-extrabold text-slate-900 text-base">{linkedBill.bill_number}</span>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Total Bill Value: <CurrencyDisplay amount={linkedBill.total_amount} size="sm" color="default" />
              </p>
            </div>
            <Link
              to={`/bills/${linkedBill.id}`}
              className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              View Vendor Bill &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* General Ledger Accounting Trace */}
      <AccountingTrace journalEntry={payment.journal_entries} title="General Ledger Settlement Impact" />
    </div>
  );
};

export default PaymentDetail;
