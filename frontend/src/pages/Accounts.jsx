import React, { useState, useEffect } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "ASSET",
  });
  const [modalError, setModalError] = useState(null);

  const getNextAvailableCode = (typeStr) => {
    const prefixMap = { ASSET: "10", LIABILITY: "20", EQUITY: "30", CAPITAL: "30", INCOME: "40", EXPENSE: "50" };
    const prefix = prefixMap[typeStr] || "10";
    const matchingCodes = accounts
      .map((a) => Number(a.code))
      .filter((c) => !isNaN(c) && String(c).startsWith(prefix));
    if (matchingCodes.length === 0) return `${prefix}00`;
    const maxCode = Math.max(...matchingCodes);
    return String(maxCode + 10);
  };

  const handleOpenModal = () => {
    setModalError(null);
    const suggested = getNextAvailableCode("ASSET");
    setFormData({ code: suggested, name: "", type: "ASSET" });
    setShowModal(true);
  };

  const handleTypeChange = (newType) => {
    const suggested = getNextAvailableCode(newType);
    setFormData((prev) => ({ ...prev, type: newType, code: suggested }));
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/accounts");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data || []);
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Failed to load Chart of Accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setModalError(null);
      setError(null);
      await api.post("/accounts", formData);
      setShowModal(false);
      setFormData({ code: "", name: "", type: "ASSET" });
      fetchAccounts();
    } catch (err) {
      console.error("Error creating account:", err);
      const msg = err.response?.data?.message || err.message || "Failed to create account";
      setModalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Group accounts by type
  const categories = [
    { key: "ASSET", title: "ASSETS", icon: "fa-building-columns", color: "text-blue-900 bg-blue-50 border-blue-200" },
    { key: "LIABILITY", title: "LIABILITIES", icon: "fa-hand-holding-dollar", color: "text-blue-950 bg-slate-100 border-slate-200" },
    { key: "EQUITY", title: "CAPITAL / EQUITY", icon: "fa-vault", color: "text-blue-900 bg-blue-50/60 border-blue-200" },
    { key: "INCOME", title: "INCOME / REVENUE", icon: "fa-arrow-trend-up", color: "text-blue-900 bg-blue-100/70 border-blue-300" },
    { key: "EXPENSE", title: "EXPENSES", icon: "fa-arrow-trend-down", color: "text-slate-900 bg-slate-50 border-slate-200" },
  ];

  if (loading) return <Loading text="Loading Chart of Accounts (CoA) structure..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts (CoA)"
        subtitle="Master double-entry accounting ledger classification"
        actions={
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>New Ledger Account</span>
          </button>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Grouped Account Tables */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const categoryAccounts = accounts.filter(
            (a) => a.type === cat.key || (cat.key === "EQUITY" && a.type === "CAPITAL")
          );

          return (
            <div
              key={cat.key}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-blue-50/70 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className={`fa-solid ${cat.icon} text-sm text-blue-900`}></i>
                  <h3 className="font-black text-blue-950 text-xs uppercase tracking-wider">{cat.title}</h3>
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
                    {categoryAccounts.length}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {categoryAccounts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    No accounts registered under {cat.title}.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-blue-100 bg-blue-50/50 text-blue-950 uppercase tracking-wider font-extrabold">
                          <th className="py-2.5 px-3">Account Code</th>
                          <th className="py-2.5 px-3">Account Name</th>
                          <th className="py-2.5 px-3">Category Type</th>
                          <th className="py-2.5 px-3">Normal Balance</th>
                          <th className="py-2.5 px-3">Base Currency</th>
                          <th className="py-2.5 px-3">Ledger Scope</th>
                          <th className="py-2.5 px-3">Created Date</th>
                          <th className="py-2.5 px-3">Record GUID</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-center">Role Visibility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {categoryAccounts.map((acc) => {
                          const isDebitNormal = acc.type === "ASSET" || acc.type === "EXPENSE";
                          return (
                            <tr key={acc.id} className="hover:bg-blue-50/30">
                              <td className="py-3 px-3 font-mono font-extrabold text-slate-900">
                                <span className="bg-blue-50 border border-blue-200 text-blue-900 px-2 py-1 rounded">
                                  {acc.code}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-bold text-slate-800 text-sm">{acc.name}</td>
                              <td className="py-3 px-3 font-mono text-blue-900 font-bold">{acc.type}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${isDebitNormal ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-blue-50 text-blue-800 border border-blue-200"}`}>
                                  {isDebitNormal ? "DEBIT (DR)" : "CREDIT (CR)"}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-600">INR (₹)</td>
                              <td className="py-3 px-3 text-slate-600 font-semibold text-[11px]">Master Chart of Accounts</td>
                              <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                                {acc.created_at ? new Date(acc.created_at).toLocaleDateString() : "System Init"}
                              </td>
                              <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                                {acc.id ? `${acc.id.substring(0, 8)}...` : "—"}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <StatusBadge status={acc.is_active !== false ? "ACTIVE" : "INACTIVE"} size="sm" />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border border-slate-200">
                                  ALL ROLES
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for creating a new ledger account */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Chart of Account Ledger"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start space-x-2">
              <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Account Code *</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, code: getNextAvailableCode(formData.type) })}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
              >
                Auto-Suggest Code
              </button>
            </label>
            <input
              type="text"
              placeholder="e.g. 1100, 2000, 4000"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Account Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Accounts Receivable, Sales Income"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Account Category Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="ASSET">ASSET (Cash, Bank, Debtors)</option>
              <option value="LIABILITY">LIABILITY (Creditors, AP)</option>
              <option value="EQUITY">EQUITY / CAPITAL (Share Capital)</option>
              <option value="INCOME">INCOME (Sales Revenue)</option>
              <option value="EXPENSE">EXPENSE (Purchases, Operating)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 transition-all"
            >
              {submitting ? "Saving Account..." : "Save Ledger Account"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounts;
