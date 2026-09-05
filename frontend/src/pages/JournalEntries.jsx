import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import CurrencyDisplay from "../components/CurrencyDisplay";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/formatters";

const JournalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterJournal, setFilterJournal] = useState("");
  const [filterSourceType, setFilterSourceType] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, journalsRes] = await Promise.all([
        api.get("/journal-entries"),
        api.get("/journals"),
      ]);
      setEntries(entriesRes.data.data || []);
      setJournals(journalsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching journal entries:", err);
      setError(err.response?.data?.message || "Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    if (filterJournal && entry.journal_id !== filterJournal) return false;
    if (filterSourceType && entry.source_type !== filterSourceType) return false;
    return true;
  });

  const columns = [
    {
      header: "Voucher Number",
      accessor: (row) => (
        <Link
          to={`/journal-entries/${row.id}`}
          className="font-mono text-blue-600 font-extrabold hover:underline"
        >
          {row.entry_number}
        </Link>
      ),
    },
    {
      header: "Posting Date",
      accessor: (row) => formatDate(row.entry_date),
    },
    {
      header: "Journal Book",
      accessor: (row) => (
        <span className="font-bold text-slate-800">
          {row.journals?.name || "General Ledger"}
        </span>
      ),
    },
    {
      header: "Journal Code",
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.journals?.code || "GJ"}
        </span>
      ),
    },
    {
      header: "Source Type",
      accessor: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase">
          {row.source_type || "MANUAL"}
        </span>
      ),
    },
    {
      header: "Reference",
      accessor: (row) => (
        <span className="text-slate-600 font-mono text-xs">{row.reference || "—"}</span>
      ),
    },
    {
      header: "Total Debit (₹)",
      accessor: (row) => {
        const lines = row.journal_entry_lines || [];
        const totalDebit = lines.reduce(
          (sum, line) => sum + (Number(line.debit) || 0),
          0
        );
        return <CurrencyDisplay amount={totalDebit} size="sm" color="default" />;
      },
    },
    {
      header: "Total Credit (₹)",
      accessor: (row) => {
        const lines = row.journal_entry_lines || [];
        const totalCredit = lines.reduce(
          (sum, line) => sum + (Number(line.credit) || 0),
          0
        );
        return <CurrencyDisplay amount={totalCredit} size="sm" color="default" />;
      },
    },
    {
      header: "Lines",
      accessor: (row) => (
        <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-mono font-bold text-xs border border-blue-200">
          {row.journal_entry_lines?.length || 0} Lines
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status || "POSTED"} />,
    },
    {
      header: "Action",
      accessor: (row) => (
        <Link
          to={`/journal-entries/${row.id}`}
          className="text-xs font-bold text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200"
        >
          View Log &rarr;
        </Link>
      ),
    },
  ];

  if (loading) return <Loading text="Loading General Ledger double-entry audit log..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Ledger Journal Entries"
        subtitle="Double-entry financial accounting ledger log"
        actions={
          <Link
            to="/journal-entries/new"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Post Manual Journal Entry</span>
          </Link>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Filter by Journal Book
          </label>
          <select
            value={filterJournal}
            onChange={(e) => setFilterJournal(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Journals</option>
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name} ({j.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Filter by Transaction Source
          </label>
          <select
            value={filterSourceType}
            onChange={(e) => setFilterSourceType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sources</option>
            <option value="MANUAL">Manual Journal</option>
            <option value="SALES_INVOICE">Sales Invoice</option>
            <option value="PURCHASE_BILL">Purchase Bill</option>
            <option value="CUSTOMER_PAYMENT">Customer Payment</option>
            <option value="VENDOR_PAYMENT">Vendor Payment</option>
          </select>
        </div>

        {(filterJournal || filterSourceType) && (
          <button
            onClick={() => {
              setFilterJournal("");
              setFilterSourceType("");
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold self-end pb-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <EmptyState
          icon="fa-book-bookmark"
          title="No Journal Entries Found"
          description="System entries generated from invoices/payments and manual adjustments will appear here."
          actionLabel="Create Manual Entry"
          onAction={() => (window.location.href = "/journal-entries/new")}
        />
      ) : (
        <DataTable columns={columns} data={filteredEntries} emptyMessage="No journal entries found." />
      )}
    </div>
  );
};

export default JournalEntries;
