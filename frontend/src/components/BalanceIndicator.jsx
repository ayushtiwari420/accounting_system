import React from "react";
import { formatCurrency } from "../utils/formatters";

/**
 * BalanceIndicator component for live debit vs credit verification
 * @param {number} totalDebit - Total calculated debit amount
 * @param {number} totalCredit - Total calculated credit amount
 */
const BalanceIndicator = ({ totalDebit = 0, totalCredit = 0 }) => {
  const debit = Number(totalDebit) || 0;
  const credit = Number(totalCredit) || 0;
  const diff = Math.abs(debit - credit);
  const isBalanced = diff < 0.001 && debit > 0;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isBalanced
          ? "bg-emerald-50 border-emerald-300 text-emerald-900"
          : debit === 0 && credit === 0
          ? "bg-slate-50 border-slate-200 text-slate-700"
          : "bg-rose-50 border-rose-300 text-rose-900"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-xs uppercase font-bold text-slate-500 block">Total Debit (DR)</span>
            <span className="text-lg font-extrabold font-mono text-slate-900">
              {formatCurrency(debit)}
            </span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-500 block">Total Credit (CR)</span>
            <span className="text-lg font-extrabold font-mono text-slate-900">
              {formatCurrency(credit)}
            </span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-500 block">Difference</span>
            <span
              className={`text-lg font-extrabold font-mono ${
                diff < 0.001 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {formatCurrency(diff)}
            </span>
          </div>
        </div>

        <div>
          {isBalanced ? (
            <div className="flex items-center space-x-1.5 bg-emerald-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg shadow-sm tracking-wide">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span>✓ BALANCED & READY TO POST</span>
            </div>
          ) : debit === 0 && credit === 0 ? (
            <div className="flex items-center space-x-1.5 bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg">
              <span>ENTER DEBIT AND CREDIT LINES</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-rose-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg shadow-sm tracking-wide">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>⚠ UNBALANCED (DIFF: {formatCurrency(diff)})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceIndicator;
