import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import AccountingTrace from "../components/AccountingTrace";
import PageHeader from "../components/PageHeader";
import { formatDate } from "../utils/formatters";

const JournalEntryDetail = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/journal-entries/${id}`);
        setEntry(res.data.data);
      } catch (err) {
        console.error("Error loading journal entry detail:", err);
        setError(err.response?.data?.message || "Journal entry not found");
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  if (loading) return <Loading text="Loading journal entry document..." />;

  if (error || !entry) {
    return (
      <div className="space-y-4">
        <Link to="/journal-entries" className="text-xs text-blue-600 hover:underline">
          &larr; Back to Journal Entries
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-center">
          <h2 className="text-lg font-bold mb-1">Journal Entry Error</h2>
          <p className="text-sm">{error || "Requested journal entry could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={entry.entry_number}
        subtitle="General Ledger Double-Entry Audit Record"
        breadcrumbs={[
          { label: "Journal Entries", path: "/journal-entries" },
          { label: entry.entry_number },
        ]}
        status={entry.status || "POSTED"}
        actions={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
          >
            <i className="fa-solid fa-print"></i>
            <span>Print Entry</span>
          </button>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
            Posting Date
          </span>
          <span className="text-base font-bold text-slate-900 block">
            {formatDate(entry.entry_date)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
            Journal Book
          </span>
          <span className="text-base font-bold text-slate-900 block">
            {entry.journals?.name || entry.journals?.code || "General"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
            Source Type
          </span>
          <span className="text-base font-bold text-blue-700 block font-mono">
            {entry.source_type || "MANUAL"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
            Reference
          </span>
          <span className="text-base font-bold text-slate-900 block truncate">
            {entry.reference || "—"}
          </span>
        </div>
      </div>

      {/* Accounting Trace Table */}
      <AccountingTrace journalEntry={entry} title="Journal Line Items & Accounting Ledger Impact" />
    </div>
  );
};

export default JournalEntryDetail;
