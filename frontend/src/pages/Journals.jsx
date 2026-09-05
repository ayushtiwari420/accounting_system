import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import Loading from "../components/Loading.jsx";
import DataTable from "../components/DataTable.jsx";

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/journals");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data || []);
      setJournals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Code",
      accessor: "code",
      render: (r) => <span className="font-mono font-bold text-blue-600">{r.code}</span>,
    },
    {
      header: "Journal Name",
      accessor: "name",
      render: (r) => <span className="font-semibold text-gray-900">{r.name}</span>,
    },
    {
      header: "Journal Type",
      accessor: "type",
      render: (r) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          {r.type}
        </span>
      ),
    },
    {
      header: "Default Debit Account",
      accessor: "accounts_journals_default_debit_account_idToaccounts",
      render: (r) => {
        const acc = r.accounts_journals_default_debit_account_idToaccounts;
        return acc ? `${acc.code} - ${acc.name}` : "-";
      },
    },
    {
      header: "Default Credit Account",
      accessor: "accounts_journals_default_credit_account_idToaccounts",
      render: (r) => {
        const acc = r.accounts_journals_default_credit_account_idToaccounts;
        return acc ? `${acc.code} - ${acc.name}` : "-";
      },
    },
  ];

  if (loading) return <Loading message="Loading Accounting Journals..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accounting Journals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Standard Sales, Purchase, Cash, and Bank Journals
        </p>
      </div>

      <DataTable columns={columns} data={journals} emptyMessage="No journals found" />
    </div>
  );
};

export default Journals;
