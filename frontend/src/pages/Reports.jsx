import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
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

  // Period filter for P&L: 1m, 6m, 1y, all
  const [periodFilter, setPeriodFilter] = useState("all");
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [showLogs, setShowLogs] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const [plRes, bsRes, budgetRes] = await Promise.all([
        api.get(`/reports/profit-loss?preset=${periodFilter}`),
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loading text="Generating official financial statement reports & GL ledgers..." />;

  const metrics = plData?.metrics || {};
  const totalRev = Number(metrics.total_income ?? plData?.total_income ?? 0);
  const totalExp = Number(metrics.total_expense ?? plData?.total_expense ?? 0);
  const cogsAmount = Number(metrics.cogs_amount ?? 0);
  const grossProfit = Number(metrics.gross_profit ?? (totalRev - cogsAmount));
  const netProfit = Number(metrics.net_profit ?? plData?.net_profit ?? (totalRev - totalExp));
  const grossProfitMargin = Number(metrics.gross_profit_margin_percent ?? (totalRev > 0 ? ((grossProfit / totalRev) * 100).toFixed(2) : 0));
  const netProfitMargin = Number(metrics.net_profit_margin_percent ?? (totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(2) : 0));

  const maxVal = Math.max(totalRev, totalExp, 1);
  const revWidth = Math.min(100, Math.round((totalRev / maxVal) * 100));
  const expWidth = Math.min(100, Math.round((totalExp / maxVal) * 100));

  const periodLabelMap = {
    "1m": "Last 1 Month (30 Days)",
    "6m": "Last 6 Months (180 Days)",
    "1y": "Last 1 Year (365 Days)",
    "all": "All Time Historical",
  };

  return (
    <div className="space-y-6 font-['Lato',sans-serif]">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <PageHeader
        title="Financial Statements & Reports"
        subtitle="Automated Profit & Loss (P&L), Balance Sheet, and Budget Variance statements"
        actions={
          <div className="flex items-center space-x-3 no-print">
            <button
              onClick={fetchReports}
              className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <i className="fa-solid fa-arrows-rotate"></i>
              <span>Refresh Live Data</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <i className="fa-solid fa-file-pdf text-rose-400"></i>
              <span>Download PDF / Print Statement</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl text-sm font-medium no-print">
          {error}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white px-4 pt-2 rounded-2xl border shadow-xs gap-2 no-print">
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
        <div id="printable-report">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6"
          >
            {/* Header Document Banner */}
            <div className="border-b border-slate-200 pb-5 text-center relative">
              <div className="flex justify-between items-center mb-2">
                <div className="text-left">
                  <h2 className="text-2xl font-black text-[#1E3A8A]">FINORA FINANCIAL ERP</h2>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-50 text-[#1E3A8A] text-xs font-black px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                    Official Income Statement
                  </span>
                </div>
              </div>

              {/* Time Period Filter Bar */}
              <div className="flex justify-center items-center space-x-2 mt-4 no-print">
                <span className="text-xs font-extrabold text-slate-500 mr-1 uppercase tracking-wider">Period Preset:</span>
                {[
                  { key: "1m", label: "Last 1 Month" },
                  { key: "6m", label: "Last 6 Months" },
                  { key: "1y", label: "Last 1 Year" },
                  { key: "all", label: "All Time" },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriodFilter(p.key)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border ${
                      periodFilter === p.key
                        ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profit Margin KPI Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Total Operating Revenue
                </span>
                <CurrencyDisplay amount={totalRev} size="md" color="success" />
                <p className="text-[10px] text-slate-500 font-medium">Gross income from sales & invoices</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Cost of Goods Sold (COGS)
                </span>
                <CurrencyDisplay amount={cogsAmount} size="md" color="danger" />
                <p className="text-[10px] text-slate-500 font-medium">Direct materials & procurement cost</p>
              </div>

              <div className="bg-[#1E3A8A]/5 p-4 rounded-xl border border-[#1E3A8A]/20 shadow-2xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-wider block">
                    Gross Operating Profit
                  </span>
                  <span className="text-xs font-black text-[#1E3A8A] bg-blue-100 px-2 py-0.5 rounded-md">
                    {grossProfitMargin}% Margin
                  </span>
                </div>
                <CurrencyDisplay amount={grossProfit} size="md" color="success" />
                <p className="text-[10px] text-[#1E3A8A]/70 font-medium">Revenue minus direct product costs</p>
              </div>

              <div className="bg-blue-950 p-4 rounded-xl border border-blue-900 shadow-2xs space-y-1 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider block">
                    Net Profit / Operating Margin
                  </span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${netProfit >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                    {netProfitMargin}% Net
                  </span>
                </div>
                <CurrencyDisplay amount={netProfit} size="md" color={netProfit >= 0 ? "success" : "danger"} />
                <p className="text-[10px] text-blue-300/80 font-medium">Final retained profit after all expenses</p>
              </div>
            </div>

            {/* Visual Bar Comparison */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Revenue vs Expense Visual Distribution
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Operating Revenue (Income)</span>
                    <span className="text-emerald-700 font-mono font-bold">₹{totalRev.toLocaleString()}</span>
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
                    <span>Operating Expenses (Procurement & Overheads)</span>
                    <span className="text-rose-700 font-mono font-bold">₹{totalExp.toLocaleString()}</span>
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
                <span className="tabular-nums text-emerald-900 font-bold text-xs">
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
                                } text-[10px] text-blue-600 no-print`}
                              ></i>
                              <span>
                                [{code}] {inc.account_name || inc.name || "Sales Income"}
                              </span>
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold no-print">
                                Click for Drilldown
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-900 font-bold">
                              <CurrencyDisplay amount={inc.amount} size="sm" color="success" />
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="no-print">
                              <td colSpan="2" className="bg-blue-50/60 p-4 border-l-4 border-blue-600">
                                <div className="space-y-2">
                                  <div className="text-[11px] font-black text-blue-950 uppercase tracking-wider">
                                    Underlying Sales Ledger Transactions (Account {code})
                                  </div>
                                  <p className="text-xs text-slate-600">
                                    Income generated from furniture sales invoices, credited directly to Sales Revenue.
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

            {/* Operating Expenses Breakdown */}
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-black text-rose-800 bg-rose-50 px-3 py-2 rounded-lg uppercase tracking-wider border border-rose-200 flex items-center justify-between">
                <span>2. OPERATING EXPENSES & COST OF GOODS SOLD</span>
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
                                } text-[10px] text-blue-600 no-print`}
                              ></i>
                              <span>
                                [{code}] {exp.account_name || exp.name || "Purchases Expense"}
                              </span>
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold no-print">
                                Click for Drilldown
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-900 font-bold">
                              <CurrencyDisplay amount={exp.amount} size="sm" color="danger" />
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="no-print">
                              <td colSpan="2" className="bg-rose-50/60 p-4 border-l-4 border-rose-600">
                                <div className="space-y-2">
                                  <div className="text-[11px] font-black text-rose-950 uppercase tracking-wider">
                                    Underlying Expense Ledger Transactions (Account {code})
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

            {/* Net Operating Result Banner */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-blue-950 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg border border-blue-900"
            >
              <div>
                <span className="text-xs font-bold text-blue-300 uppercase tracking-widest block">
                  NET OPERATING RESULT ({periodLabelMap[periodFilter] || "Custom Period"})
                </span>
                <h4 className="text-xl font-black text-white">NET PROFIT / (NET LOSS)</h4>
              </div>
              <CurrencyDisplay
                amount={netProfit}
                size="xl"
                color={netProfit >= 0 ? "success" : "danger"}
              />
            </motion.div>

            {/* Period Detailed Transaction Logs Table */}
            {(plData.transaction_logs || []).length > 0 && (
              <div className="space-y-3 pt-6 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Period Detailed GL Transaction Logs ({periodLabelMap[periodFilter] || "Custom Period"})
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Itemized journal entry ledger lines posted within selected date range
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="text-xs font-bold text-[#1E3A8A] hover:underline no-print"
                  >
                    {showLogs ? "Hide Transaction Logs" : "Show Transaction Logs"}
                  </button>
                </div>

                {showLogs && (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs font-['Lato',sans-serif]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Entry #</th>
                          <th className="py-2.5 px-3">Source & Reference</th>
                          <th className="py-2.5 px-3">Account</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                          <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                          <th className="py-2.5 px-3 text-right">Net Impact (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {plData.transaction_logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-600 font-mono font-medium">
                              {formatDate(log.entry_date)}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#1E3A8A]">
                              <Link to={`/journal-entries`} className="hover:underline">
                                {log.entry_number}
                              </Link>
                            </td>
                            <td className="py-2.5 px-3 font-medium">
                              <span className="inline-block bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5">
                                {log.source_type}
                              </span>
                              {log.reference}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              [{log.account_code}] {log.account_name}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  log.account_type === "INCOME"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {log.account_type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                              {log.debit > 0 ? `₹${log.debit.toLocaleString()}` : "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                              {log.credit > 0 ? `₹${log.credit.toLocaleString()}` : "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                              <CurrencyDisplay
                                amount={log.net_amount}
                                size="sm"
                                color={log.account_type === "INCOME" ? "success" : "danger"}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* TAB 2: BALANCE SHEET STATEMENT */}
      {activeTab === "balance-sheet" && bsData && (
        <div id="printable-report">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
          >
            <div className="border-b border-slate-200 pb-4 text-center">
              <h2 className="text-xl font-black text-slate-900">FINORA FINANCIAL ERP</h2>
              <h3 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-widest mt-0.5">
                OFFICIAL BALANCE SHEET STATEMENT
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                As of {formatDate(bsData.as_of_date || new Date())}
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
                  <CurrencyDisplay
                    amount={bsData.assets?.total_assets ?? bsData.assets?.total ?? 0}
                    size="md"
                    color="success"
                  />
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
                  {(bsData.equity?.capital_breakdown || bsData.equity?.breakdown || []).map((eq, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                      <span>[{eq.code}] {eq.name}</span>
                      <CurrencyDisplay amount={eq.amount} size="sm" />
                    </div>
                  ))}

                  {bsData.equity?.retained_earnings_net_profit !== undefined && (
                    <div className="flex justify-between py-2 border-b border-slate-100 font-semibold text-emerald-800">
                      <span>Retained Earnings (Net Profit Inception)</span>
                      <CurrencyDisplay amount={bsData.equity.retained_earnings_net_profit} size="sm" color="success" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between py-3 border-t-2 border-slate-900 font-extrabold text-sm text-slate-900">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <CurrencyDisplay
                    amount={bsData.total_liabilities_and_equity ?? ((bsData.liabilities?.total_liabilities ?? bsData.liabilities?.total ?? 0) + (bsData.equity?.total_equity ?? bsData.equity?.total ?? 0))}
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
        </div>
      )}

      {/* TAB 3: BUDGET VARIANCE REPORT */}
      {activeTab === "budget-performance" && (
        <div id="printable-report">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
          >
            <div className="border-b border-slate-200 pb-4 text-center">
              <h2 className="text-xl font-black text-slate-900">FINORA FINANCIAL ERP</h2>
              <h3 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-widest mt-0.5">
                BUDGET VARIANCE & COST CENTER REPORT
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['Lato',sans-serif]">
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
                  {budgetData.map((b) => {
                    const planned = Number(b.planned_amount || 0);
                    const actual = Number(b.actual_amount || 0);
                    const variance = Number(b.variance ?? b.remaining_amount ?? (planned - actual));
                    const util = Number(b.utilization_percentage ?? b.achievement_rate ?? (planned > 0 ? (actual / planned) * 100 : 0));

                    return (
                      <tr key={b.budget_id || b.id} className="hover:bg-blue-50/30">
                        <td className="py-3 px-3 font-bold text-slate-900 text-sm">{b.budget_name || b.name}</td>
                        <td className="py-3 px-3 text-slate-600 font-semibold">{b.analytic_account || b.analytic_account_name || b.analytic_accounts?.name}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          <CurrencyDisplay amount={planned} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          <CurrencyDisplay amount={actual} size="sm" color="default" />
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900">
                          <CurrencyDisplay
                            amount={variance}
                            size="sm"
                            color={variance >= 0 ? "success" : "danger"}
                          />
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              util > 100
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {util}% Utilized
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reports;
