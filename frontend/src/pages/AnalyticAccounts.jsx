import React, { useState, useEffect } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/formatters";

const AnalyticAccounts = () => {
  const [analyticAccounts, setAnalyticAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE",
  });

  const fetchAnalyticAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/budgets/analytic-accounts");
      setAnalyticAccounts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching analytic accounts:", err);
      setError(err.response?.data?.message || "Failed to load analytic accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await api.post("/budgets/analytic-accounts", formData);
      setShowModal(false);
      setFormData({ name: "", type: "EXPENSE" });
      fetchAnalyticAccounts();
    } catch (err) {
      console.error("Error creating analytic account:", err);
      setError(err.response?.data?.message || "Failed to create analytic account");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Cost Center / Analytic Name",
      accessor: (row) => (
        <div className="font-bold text-slate-900 text-sm">{row.name}</div>
      ),
    },
    {
      header: "Account Type",
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            row.type === "EXPENSE"
              ? "bg-slate-100 text-slate-800 border border-slate-200"
              : "bg-blue-100 text-blue-900 border border-blue-200"
          }`}
        >
          {row.type || "EXPENSE"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge status={row.is_active !== false ? "ACTIVE" : "INACTIVE"} size="sm" />
      ),
    },
    {
      header: "Created Date",
      accessor: (row) => formatDate(row.created_at),
    },
  ];

  if (loading) return <Loading text="Loading cost centers & project tags..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytic Accounts (Cost Centers)"
        subtitle="Tag revenue and expense lines to specific business units or projects"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Create Analytic Account</span>
          </button>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {analyticAccounts.length === 0 ? (
        <EmptyState
          icon="fa-layer-group"
          title="No Analytic Accounts Defined"
          description="Create analytic cost centers to tag line items in invoices and journal entries."
          actionLabel="Create Analytic Account"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <DataTable columns={columns} data={analyticAccounts} emptyMessage="No analytic accounts found." />
      )}

      {/* Modal for creating analytic account */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Analytic Account (Cost Center)"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Analytic Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Marketing Campaign, R&D Dept, Office Furnishing Project"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Account Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXPENSE">Expense Cost Center</option>
              <option value="INCOME">Income / Revenue Center</option>
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
              {submitting ? "Creating..." : "Save Analytic Account"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnalyticAccounts;
