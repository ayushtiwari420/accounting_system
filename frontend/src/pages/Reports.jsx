import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import CurrencyDisplay from "../components/CurrencyDisplay";
import { formatDate } from "../utils/formatters";

const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profit-loss";

  const [plData, setPlData] = useState(null);
  const [bsData, setBsData] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expanded account drilldown toggles
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [periodFilter, setPeriodFilter] = useState("ALL");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      let plUrl = "/reports/profit-loss";
      const now = new Date();
      if (periodFilter === "THIS_MONTH") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
        plUrl += `?start_date=${start}&end_date=${end}`;
      } else if (periodFilter === "THIS_QUARTER") {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        const start = new Date(now.getFullYear(), qMonth, 1).toISOString().split("T")[0];
        const end = new Date(now.getFullYear(), qMonth + 3, 0).toISOString().split("T")[0];
        plUrl += `?start_date=${start}&end_date=${end}`;
      } else if (periodFilter === "THIS_YEAR") {
        const start = `${now.getFullYear()}-01-01`;
        const end = `${now.getFullYear()}-12-31`;
        plUrl += `?start_date=${start}&end_date=${end}`;
      }

      const [plRes, bsRes, budgetRes] = await Promise.all([
        api.get(plUrl),
        api.get("/reports/balance-sheet"),
        api.get("/reports/budget-performance"),
      ]);

      setPlData(plRes.data?.data || plRes.data);
      setBsData(bsRes.data?.data || bsRes.data);
      setBudgetData(budgetRes.data?.data || budgetRes.data || []);
    } catch (err) {
      console.error("Error fetching financial reports:", err);
      setError("Failed to load financial statement reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [periodFilter]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const toggleAccountDrilldown = (accCode) => {
    setExpandedAccounts((prev) => ({
      ...prev,
      [accCode]: !prev[accCode],
    }));
  };

  if (loading) return <Loading text="Generating official financial statement reports & GL ledgers..." />;

  const totalRev = Number(plData?.total_income || 0);
  const totalExp = Number(plData?.total_expense || 0);
  const maxVal = Math.max(totalRev, totalExp, 1);
  const revWidth = Math.min(100, Math.round((totalRev / maxVal) * 100));
  const expWidth = Math.min(100, Math.round((totalExp / maxVal) * 100));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Statements & Reports"
        subtitle="Automated Profit & Loss (P&L), Balance Sheet, and Budget Variance statements"
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchReports}
              className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <i className="fa-solid fa-arrows-rotate"></i>
              <span>Refresh Live Data</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <i className="fa-solid fa-print"></i>
              <span>Print Financial Report</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white px-4 pt-2 rounded-2xl border shadow-xs gap-2">
        <button
          onClick={() => handleTabChange("profit-loss")}
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "profit-loss"
              ? "border-[#1E3A8A] text-[#1E3A8A] font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <i className="fa-solid fa-chart-line mr-2"></i>
          Profit & Loss Statement
        </button>

        <button
          onClick={() => handleTabChange("balance-sheet")}
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "balance-sheet"
              ? "border-[#1E3A8A] text-[#1E3A8A] font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <i className="fa-solid fa-scale-balanced mr-2"></i>
          Balance Sheet Statement
        </button>

        <button
          onClick={() => handleTabChange("budget-performance")}
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "budget-performance"
              ? "border-[#1E3A8A] text-[#1E3A8A] font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <i className="fa-solid fa-calculator mr-2"></i>
          Budget Variance Report
        </button>
      </div>

      {/* TAB 1: PROFIT & LOSS STATEMENT */}
      {activeTab === "profit-loss" && plData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="border-b border-slate-200 pb-4 text-center relative">
            <h2 className="text-xl font-black text-slate-900">URBAN FURNITURE CO.</h2>
            <h3 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-widest mt-0.5">
              PROFIT AND LOSS STATEMENT (INCOME STATEMENT)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Period: {typeof plData.period === "object" ? `${plData.period.start_date || "All Time"} to ${plData.period.end_date || "All Time"}` : (plData.period || "Current Fiscal Operating Period")}
            </p>

            {/* Quick Period Filter Bar */}
            <div className="flex justify-center items-center space-x-2 mt-3">
              {["ALL", "THIS_MONTH", "THIS_QUARTER", "THIS_YEAR"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all border ${
                    periodFilter === p
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {p === "ALL" ? "All Time" : p.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Bar Comparison */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Financial Performance Summary
            </h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Operating Revenue (Income)</span>
                  <span className="text-emerald-700 font-mono">₹{totalRev.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${revWidth}%` }}
                    transition={{ duration: 0.8 }}
                    className="bg-emerald-500 h-3 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Operating Expenses (Cost & Overheads)</span>
                  <span className="text-rose-700 font-mono">₹{totalExp.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${expWidth}%` }}
                    transition={{ duration: 0.8 }}
                    className="bg-rose-500 h-3 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg uppercase tracking-wider border border-emerald-200 flex items-center justify-between">
              <span>1. REVENUE & OPERATING INCOME</span>
              <span className="font-mono text-emerald-900 font-extrabold text-xs">
                TOTAL: ₹{totalRev.toLocaleString()}
              </span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {(plData.income_breakdown || []).map((inc, idx) => {
                    const code = inc.code || "4000";
                    const isExpanded = expandedAccounts[code];

                    return (
                      <React.Fragment key={idx}>
                        <tr
                          onClick={() => toggleAccountDrilldown(code)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3 text-slate-800 font-bold flex items-center space-x-2">
                            <i
                              className={`fa-solid ${
                                isExpanded ? "fa-chevron-down" : "fa-chevron-right"
                              } text-[10px] text-blue-600`}
                            ></i>
                            <span>
                              [{code}] {inc.account_name || inc.name || "Sales Income"}
                            </span>
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold">
                              Click for Drilldown
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-900 font-bold">
                            <CurrencyDisplay amount={inc.amount} size="sm" color="success" />
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan="2" className="bg-blue-50/60 p-4 border-l-4 border-blue-600">
                              <div className="space-y-2">
                                <div className="text-[11px] font-black text-blue-950 uppercase tracking-wider">
                                  Underlying Sales Ledger Transactions (Account 4000)
                                </div>
                                <p className="text-xs text-slate-600">
                                  Income generated from customer furniture invoices, credited directly to Sales Revenue.
                                </p>
                                <div className="pt-1">
                                  <Link
                                    to="/journal-entries?source=SALES_INVOICE"
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                  >
                                    View All Linked Sales Invoices & Journal Entries &rarr;
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-black text-rose-800 bg-rose-50 px-3 py-2 rounded-lg uppercase tracking-wider border border-rose-200 flex items-center justify-between">
              <span>2. OPERATING EXPENSES & PROCUREMENT</span>
              <span className="font-mono text-rose-900 font-extrabold text-xs">
                TOTAL: ₹{totalExp.toLocaleString()}
              </span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {(plData.expense_breakdown || []).map((exp, idx) => {
                    const code = exp.code || "5000";
                    const isExpanded = expandedAccounts[code];

                    return (
                      <React.Fragment key={idx}>
                        <tr
                          onClick={() => toggleAccountDrilldown(code)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3 text-slate-800 font-bold flex items-center space-x-2">
                            <i
                              className={`fa-solid ${
                                isExpanded ? "fa-chevron-down" : "fa-chevron-right"
                              } text-[10px] text-blue-600`}
                            ></i>
                            <span>
                              [{code}] {exp.account_name || exp.name || "Purchases Expense"}
                            </span>
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold">
                              Click for Drilldown
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-900 font-bold">
                            <CurrencyDisplay amount={exp.amount} size="sm" color="danger" />
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan="2" className="bg-rose-50/60 p-4 border-l-4 border-rose-600">
                              <div className="space-y-2">
                                <div className="text-[11px] font-black text-rose-950 uppercase tracking-wider">
                                  Underlying Expense Ledger Transactions (Account 5000)
                                </div>
                                <p className="text-xs text-slate-600">
                                  Expenses incurred from vendor furniture bills and material sourcing debited to Purchases Expense.
                                </p>
                                <div className="pt-1">
                                  <Link
                                    to="/journal-entries?source=PURCHASE_BILL"
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                  >
                                    View All Linked Vendor Bills & Journal Entries &rarr;
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Profit Banner */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-blue-950 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg border border-blue-900"
          >
            <div>
              <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-widest block">
                NET OPERATING RESULT
              </span>
              <h4 className="text-xl font-black text-white">NET PROFIT / (NET LOSS)</h4>
            </div>
            <CurrencyDisplay
              amount={plData.net_profit}
              size="xl"
              color={plData.net_profit >= 0 ? "success" : "danger"}
            />
          </motion.div>
        </motion.div>
      )}

      {/* TAB 2: BALANCE SHEET STATEMENT */}
      {activeTab === "balance-sheet" && bsData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="border-b border-slate-200 pb-4 text-center">
            <h2 className="text-xl font-black text-slate-900">URBAN FURNITURE CO.</h2>
            <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-widest mt-0.5">
              OFFICIAL BALANCE SHEET STATEMENT
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              As of {formatDate(new Date())}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ASSETS */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg uppercase tracking-wider border border-emerald-200">
                1. ASSETS (DEBIT BALANCES)
              </h4>
              <div className="space-y-2 text-xs">
                {(bsData.assets?.breakdown || []).map((ast, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                    <span>[{ast.code}] {ast.name}</span>
                    <CurrencyDisplay amount={ast.amount} size="sm" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-3 border-t-2 border-slate-900 font-extrabold text-sm text-slate-900">
                <span>TOTAL ASSETS</span>
                <CurrencyDisplay amount={bsData.assets?.total || 0} size="md" color="success" />
              </div>
            </div>

            {/* LIABILITIES & EQUITY */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-blue-950 bg-blue-50 px-3 py-2 rounded-lg uppercase tracking-wider border border-blue-200">
                2. LIABILITIES & CAPITAL EQUITY
              </h4>
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider pt-1">Liabilities</div>
                {(bsData.liabilities?.breakdown || []).map((lia, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                    <span>[{lia.code}] {lia.name}</span>
                    <CurrencyDisplay amount={lia.amount} size="sm" />
                  </div>
                ))}

                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider pt-3">Capital & Equity</div>
                {(bsData.equity?.breakdown || []).map((eq, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                    <span>[{eq.code}] {eq.name}</span>
                    <CurrencyDisplay amount={eq.amount} size="sm" />
                  </div>
                ))}
              </div>

              <div className="flex justify-between py-3 border-t-2 border-slate-900 font-extrabold text-sm text-slate-900">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <CurrencyDisplay
                  amount={(bsData.liabilities?.total || 0) + (bsData.equity?.total || 0)}
                  size="md"
                  color="default"
                />
              </div>
            </div>
          </div>

          {/* Equation Status Bar */}
          <div className="bg-blue-950 text-white p-4 rounded-2xl flex items-center justify-between border border-blue-900">
            <span className="text-xs font-mono font-bold text-blue-200">
              EQUATION VALIDATOR: ASSETS = LIABILITIES + CAPITAL EQUITY
            </span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${
                bsData.is_balanced
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}
            >
              {bsData.is_balanced ? "✓ BALANCE SHEET BALANCED" : "⚠ UNBALANCED"}
            </span>
          </div>
        </motion.div>
      )}

      {/* TAB 3: BUDGET VARIANCE REPORT */}
      {activeTab === "budget-performance" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="border-b border-slate-200 pb-4 text-center">
            <h2 className="text-xl font-black text-slate-900">URBAN FURNITURE CO.</h2>
            <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-widest mt-0.5">
              BUDGET VARIANCE & COST CENTER REPORT
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/70 text-blue-950 uppercase tracking-wider font-extrabold">
                  <th className="py-2.5 px-3">Budget Title</th>
                  <th className="py-2.5 px-3">Analytic Cost Center</th>
                  <th className="py-2.5 px-3 text-right">Target Planned (₹)</th>
                  <th className="py-2.5 px-3 text-right">Actual Spent (₹)</th>
                  <th className="py-2.5 px-3 text-right">Variance Balance (₹)</th>
                  <th className="py-2.5 px-3 text-center">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {budgetData.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-50/30">
                    <td className="py-3 px-3 font-bold text-slate-900 text-sm">{b.name}</td>
                    <td className="py-3 px-3 text-slate-600 font-semibold">{b.analytic_account_name || b.analytic_accounts?.name}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      <CurrencyDisplay amount={b.planned_amount} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      <CurrencyDisplay amount={b.actual_amount} size="sm" color="default" />
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      <CurrencyDisplay
                        amount={b.remaining_amount}
                        size="sm"
                        color={b.remaining_amount >= 0 ? "success" : "danger"}
                      />
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          b.achievement_rate > 100
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {b.achievement_rate}% Utilized
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
