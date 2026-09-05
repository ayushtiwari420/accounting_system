import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import BalanceIndicator from "../components/BalanceIndicator";
import PageHeader from "../components/PageHeader";

const CreateJournalEntry = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    journal_id: "",
    entry_date: new Date().toISOString().split("T")[0],
    reference: "",
  });

  const [lines, setLines] = useState([
    { account_id: "", analytic_account_id: "", description: "", debit: "", credit: "" },
    { account_id: "", analytic_account_id: "", description: "", debit: "", credit: "" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [journalsRes, accountsRes, analyticsRes] = await Promise.all([
          api.get("/journals"),
          api.get("/accounts"),
          api.get("/budgets/analytic-accounts"),
        ]);

        const journalList = journalsRes.data?.data || (Array.isArray(journalsRes.data) ? journalsRes.data : []);
        setJournals(journalList);
        if (journalList.length > 0) {
          setFormData((prev) => ({ ...prev, journal_id: journalList[0].id }));
        }

        const accountList = accountsRes.data?.data || (Array.isArray(accountsRes.data) ? accountsRes.data : []);
        setAccounts(accountList);

        const analyticList = analyticsRes.data?.data || (Array.isArray(analyticsRes.data) ? analyticsRes.data : []);
        setAnalytics(analyticList);
      } catch (err) {
        console.error("Error fetching reference data:", err);
        setError("Failed to load reference data for journal entry");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    // Mutually exclusive debit/credit clearing
    if (field === "debit" && value) {
      newLines[index].credit = "";
    } else if (field === "credit" && value) {
      newLines[index].debit = "";
    }

    setLines(newLines);
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { account_id: "", analytic_account_id: "", description: "", debit: "", credit: "" },
    ]);
  };

  const removeLine = (index) => {
    if (lines.length <= 2) {
      alert("A journal entry requires at least 2 lines for double-entry balancing.");
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBalanced) {
      setError("Journal entry is not balanced. Total Debit must equal Total Credit.");
      return;
    }

    const invalidLine = lines.find((l) => !l.account_id || (!Number(l.debit) && !Number(l.credit)));
    if (invalidLine) {
      setError("Each line must have an account selected and either a Debit (DR) or Credit (CR) amount.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        journal_id: formData.journal_id,
        entry_date: formData.entry_date,
        reference: formData.reference || undefined,
        source_type: "MANUAL",
        lines: lines.map((l) => ({
          account_id: l.account_id,
          analytic_account_id: l.analytic_account_id || undefined,
          description: l.description || undefined,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
        })),
      };

      await api.post("/journal-entries", payload);
      navigate("/journal-entries");
    } catch (err) {
      console.error("Error creating journal entry:", err);
      setError(err.response?.data?.message || "Failed to post journal entry");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading Chart of Accounts..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Post Manual Journal Entry"
        subtitle="Spreadsheet-style double-entry accounting transaction record"
        breadcrumbs={[
          { label: "Journal Entries", path: "/journal-entries" },
          { label: "New Entry" },
        ]}
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header fields */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Journal Book *
            </label>
            <select
              value={formData.journal_id}
              onChange={(e) => setFormData({ ...formData, journal_id: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {journals.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name} ({j.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Posting Date *
            </label>
            <input
              type="date"
              value={formData.entry_date}
              onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Reference / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Month-end adjustment, Depreciation"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Spreadsheet-like Lines Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Spreadsheet Journal Lines</h3>
            <button
              type="button"
              onClick={addLine}
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
            >
              + Add Journal Line
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/70 text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-1/3">Account (CoA) *</th>
                  <th className="py-2.5 px-3 w-1/4">Analytic Account</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right w-36">Debit DR (₹)</th>
                  <th className="py-2.5 px-3 text-right w-36">Credit CR (₹)</th>
                  <th className="py-2.5 px-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30">
                    <td className="py-2.5 pr-2">
                      <select
                        value={line.account_id}
                        onChange={(e) => handleLineChange(idx, "account_id", e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Account...</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            [{acc.code}] {acc.name} ({acc.type})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2.5 px-2">
                      <select
                        value={line.analytic_account_id}
                        onChange={(e) =>
                          handleLineChange(idx, "analytic_account_id", e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">None / Optional</option>
                        {analytics.map((ana) => (
                          <option key={ana.id} value={ana.id}>
                            {ana.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        placeholder="Line note"
                        value={line.description}
                        onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={line.debit}
                        onChange={(e) => handleLineChange(idx, "debit", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-right font-mono font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={line.credit}
                        onChange={(e) => handleLineChange(idx, "credit", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-right font-mono font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    <td className="py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove Line"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live balance indicator */}
        <BalanceIndicator totalDebit={totalDebit} totalCredit={totalCredit} />

        {/* Submit Controls */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <Link
            to="/journal-entries"
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!isBalanced || submitting}
            className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all shadow-md ${
              isBalanced && !submitting
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                : "bg-slate-300 cursor-not-allowed shadow-none"
            }`}
          >
            {submitting ? "Posting Entry..." : "Post Journal Entry"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJournalEntry;
