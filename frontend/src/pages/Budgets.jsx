import React, { useState, useEffect } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import CurrencyDisplay from "../components/CurrencyDisplay";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { formatDate } from "../utils/formatters";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    analytic_account_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
    planned_amount: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetRes, analyticRes] = await Promise.all([
        api.get("/budgets"),
        api.get("/budgets/analytic-accounts"),
      ]);

      const bList = budgetRes.data.data || [];
      const aList = analyticRes.data.data || [];

      setBudgets(bList);
      setAnalytics(aList);

      if (aList.length > 0) {
        setFormData((prev) => ({ ...prev, analytic_account_id: aList[0].id }));
      }
    } catch (err) {
      console.error("Error fetching budget data:", err);
      setError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await api.post("/budgets", {
        ...formData,
        planned_amount: Number(formData.planned_amount),
      });
      setShowModal(false);
      setFormData({
        name: "",
        analytic_account_id: analytics[0]?.id || "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
        planned_amount: "",
      });
      fetchData();
    } catch (err) {
      console.error("Error creating budget:", err);
      setError(err.response?.data?.message || "Failed to create budget");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Budget Title",
      accessor: (row) => (
        <span className="font-bold text-slate-900 text-sm">{row.name}</span>
      ),
    },
    {
      header: "Analytic Cost Center",
      accessor: (row) => (
        <span className="font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
          {row.analytic_accounts?.name || row.analytic_account_name || "General"}
        </span>
      ),
    },
    {
      header: "Center Category",
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {row.analytic_accounts?.type || "EXPENSE"}
        </span>
      ),
    },
    {
      header: "Responsible User",
      accessor: (row) => (
        <span className="text-slate-800 text-xs font-medium">
          {row.users?.name || "Finance Admin"}
        </span>
      ),
    },
    {
      header: "Start Date",
      accessor: (row) => formatDate(row.start_date),
    },
    {
      header: "End Date",
      accessor: (row) => formatDate(row.end_date),
    },
    {
      header: "Planned Target (₹)",
      accessor: (row) => <CurrencyDisplay amount={row.planned_amount} size="sm" color="default" />,
    },
    {
      header: "Actual Consumed (₹)",
      accessor: (row) => <CurrencyDisplay amount={row.actual_amount} size="sm" color="default" />,
    },
    {
      header: "Remaining Funds (₹)",
      accessor: (row) => (
        <CurrencyDisplay
          amount={row.remaining_amount}
          size="sm"
          color={row.remaining_amount >= 0 ? "success" : "danger"}
        />
      ),
    },
    {
      header: "Utilization Status",
      accessor: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            row.achievement_rate > 100
              ? "bg-rose-100 text-rose-800 border border-rose-200"
              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
          }`}
        >
          {row.achievement_rate}% Utilized
        </span>
      ),
    },
  ];

  if (loading) return <Loading text="Loading project & cost center budgets..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Budgets"
        subtitle="Analytic account financial target planning and variance monitoring"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Create New Budget</span>
          </button>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {budgets.length === 0 ? (
        <EmptyState
          icon="fa-calculator"
          title="No Budgets Defined"
          description="Create budgets for your analytic cost centers to monitor planned vs actual spending."
          actionLabel="Create Budget"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <DataTable columns={columns} data={budgets} emptyMessage="No budgets found." />
      )}

      {/* Create Budget Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Define New Financial Budget"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Budget Name *
            </label>
            <input
              type="text"
              placeholder="e.g. FY 2026 Marketing Budget, Office Expansion"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Analytic Cost Center *
            </label>
            <select
              value={formData.analytic_account_id}
              onChange={(e) => setFormData({ ...formData, analytic_account_id: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {analytics.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Planned Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 500000"
              value={formData.planned_amount}
              onChange={(e) => setFormData({ ...formData, planned_amount: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
            />
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
              {submitting ? "Saving Budget..." : "Save Budget"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;
