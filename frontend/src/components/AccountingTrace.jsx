import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatters";

/**
 * AccountingTrace Component - Blue & White ERP Design
 */
const AccountingTrace = ({ journalEntry, title = "Accounting & General Ledger Traceability" }) => {
  if (!journalEntry) {
    return (
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 text-blue-900 text-xs font-semibold text-center">
        No journal entry posted for this transaction yet.
      </div>
    );
  }

  const lines = journalEntry.lines || journalEntry.journal_entry_lines || [];
  const totalDebit = lines.reduce((acc, line) => acc + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((acc, line) => acc + (Number(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="bg-blue-950 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 font-mono font-bold text-xs uppercase tracking-wider">
              GENERAL LEDGER IMPACT
            </span>
            <span className="text-blue-700 text-xs">•</span>
            <h3 className="text-sm font-extrabold text-white">{title}</h3>
          </div>
          <p className="text-xs text-blue-200 mt-0.5 font-medium">
            Entry Number: <span className="font-mono text-white font-bold">{journalEntry.entry_number}</span>
            {journalEntry.posting_date && ` | Date: ${new Date(journalEntry.posting_date).toLocaleDateString("en-IN")}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-md border uppercase ${
              isBalanced
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
            }`}
          >
            {isBalanced ? "✓ BALANCED" : "⚠ UNBALANCED"}
          </span>
          <Link
            to={`/journal-entries/${journalEntry.id}`}
            className="text-xs font-bold bg-blue-900 hover:bg-blue-800 text-blue-100 px-3.5 py-1.5 rounded-xl transition-colors border border-blue-800"
          >
            View GL Log &rarr;
          </Link>
        </div>
      </div>

      <div className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-blue-100 bg-blue-50/60 text-blue-950 uppercase tracking-wider font-black">
                <th className="py-3 px-3">Account Code & Name</th>
                <th className="py-3 px-3">Analytic / Cost Center</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-right">Debit (DR)</th>
                <th className="py-3 px-3 text-right">Credit (CR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {lines.map((line, index) => {
                const accountCode = line.account?.code || line.account_code || "N/A";
                const accountName = line.account?.name || line.account_name || "Account";
                const analyticName = line.analytic_account?.name || line.analytic_account_name || null;
                const debit = Number(line.debit) || 0;
                const credit = Number(line.credit) || 0;

                return (
                  <tr key={line.id || index} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                          {accountCode}
                        </span>
                        <span>{accountName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {analyticName ? (
                        <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
                          {analyticName}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {line.description || journalEntry.reference || "—"}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {debit > 0 ? (
                        <span className="text-blue-900 font-extrabold">DR {formatCurrency(debit)}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {credit > 0 ? (
                        <span className="text-blue-700 font-extrabold">CR {formatCurrency(credit)}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-blue-900 bg-blue-50/80 font-black text-slate-900">
                <td colSpan={3} className="py-3 px-3 text-right text-xs uppercase tracking-wider text-blue-950">
                  Total Accounting Impact
                </td>
                <td className="py-3 px-3 text-right font-mono text-blue-950 font-black">
                  DR {formatCurrency(totalDebit)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-blue-950 font-black">
                  CR {formatCurrency(totalCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {isBalanced ? (
          <div className="mt-3 flex items-center justify-end text-xs text-emerald-800 font-extrabold space-x-1.5">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span>✓ BALANCED (Total Debit = Total Credit)</span>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-end text-xs text-rose-700 font-extrabold space-x-1.5">
            <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>⚠ UNBALANCED (Difference: {formatCurrency(totalDebit - totalCredit)})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountingTrace;
