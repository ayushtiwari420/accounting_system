import React from "react";
import CurrencyDisplay from "./CurrencyDisplay";

/**
 * FinancialSummary Component - Blue & White Document Totals
 */
const FinancialSummary = ({
  subtotal = 0,
  taxAmount = 0,
  totalAmount = 0,
  paidAmount = 0,
  showPaymentDetails = false,
}) => {
  const sub = Number(subtotal) || 0;
  const tax = Number(taxAmount) || 0;
  const total = Number(totalAmount) || sub + tax;
  const paid = Number(paidAmount) || 0;
  const remaining = Math.max(0, total - paid);

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 w-full sm:w-80 ml-auto space-y-3 shadow-xs">
      <div className="flex justify-between items-center text-xs font-semibold border-b border-blue-100 pb-2">
        <span className="text-slate-600">Subtotal</span>
        <CurrencyDisplay amount={sub} size="sm" color="default" />
      </div>

      {tax > 0 && (
        <div className="flex justify-between items-center text-xs font-semibold border-b border-blue-100 pb-2">
          <span className="text-slate-600">Tax / GST</span>
          <CurrencyDisplay amount={tax} size="sm" color="default" />
        </div>
      )}

      <div className="flex justify-between items-center text-sm font-black pt-1 border-b-2 border-blue-900 pb-2">
        <span className="text-blue-950 uppercase tracking-wider text-xs">Total Amount</span>
        <CurrencyDisplay amount={total} size="lg" color="darkblue" />
      </div>

      {showPaymentDetails && (
        <>
          <div className="flex justify-between items-center text-xs text-emerald-800 font-bold pt-1">
            <span>Amount Paid</span>
            <span>- <CurrencyDisplay amount={paid} size="sm" color="success" /></span>
          </div>

          <div className="flex justify-between items-center text-xs font-black bg-white p-3 rounded-xl border border-blue-200 mt-2 shadow-xs">
            <span className="text-blue-950 uppercase tracking-wider text-[11px]">Balance Due</span>
            <CurrencyDisplay
              amount={remaining}
              size="md"
              color={remaining > 0 ? "danger" : "success"}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialSummary;
