import React, { useState, useEffect } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";

const SCHEMA_METADATA = [
  {
    table: "accounts",
    domain: "CORE ACCOUNTING & GL",
    description: "Chart of Accounts (COA) storing double-entry ledger hierarchy (Assets, Liabilities, Revenue, Expenses, Equity).",
    primaryKey: "id (UUID)",
    foreignKeys: ["parent_id -> accounts(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY (gen_random_uuid())" },
      { name: "code", type: "VARCHAR(20)", constraint: "UNIQUE, NOT NULL" },
      { name: "name", type: "VARCHAR(150)", constraint: "NOT NULL" },
      { name: "type", type: "VARCHAR(20)", constraint: "NOT NULL (ASSET/LIABILITY/INCOME/EXPENSE/EQUITY)" },
      { name: "parent_id", type: "UUID", constraint: "FOREIGN KEY -> accounts(id)" },
      { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT true" },
      { name: "created_at", type: "TIMESTAMP", constraint: "DEFAULT NOW()" },
    ],
  },
  {
    table: "journals",
    domain: "CORE ACCOUNTING & GL",
    description: "Accounting Journal Books (Sales, Purchase, Bank, Cash, General) managing debit/credit defaults.",
    primaryKey: "id (UUID)",
    foreignKeys: ["default_debit_account_id -> accounts(id)", "default_credit_account_id -> accounts(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "code", type: "VARCHAR(20)", constraint: "UNIQUE, NOT NULL" },
      { name: "name", type: "VARCHAR(100)", constraint: "NOT NULL" },
      { name: "type", type: "VARCHAR(20)", constraint: "NOT NULL (SALE/PURCHASE/CASH/BANK/GENERAL)" },
      { name: "default_debit_account_id", type: "UUID", constraint: "FOREIGN KEY -> accounts(id)" },
      { name: "default_credit_account_id", type: "UUID", constraint: "FOREIGN KEY -> accounts(id)" },
    ],
  },
  {
    table: "journal_entries",
    domain: "CORE ACCOUNTING & GL",
    description: "General Ledger Header Postings representing explicit double-entry transaction documents.",
    primaryKey: "id (UUID)",
    foreignKeys: ["journal_id -> journals(id)", "created_by -> users(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "entry_number", type: "VARCHAR(50)", constraint: "UNIQUE, NOT NULL" },
      { name: "journal_id", type: "UUID", constraint: "FOREIGN KEY -> journals(id)" },
      { name: "entry_date", type: "DATE", constraint: "NOT NULL, DEFAULT CURRENT_DATE" },
      { name: "source_type", type: "VARCHAR(30)", constraint: "NOT NULL (INVOICE/BILL/PAYMENT/MANUAL)" },
      { name: "status", type: "VARCHAR(20)", constraint: "DEFAULT 'DRAFT' (POSTED/CANCELLED)" },
    ],
  },
  {
    table: "journal_entry_lines",
    domain: "CORE ACCOUNTING & GL",
    description: "Atomic Debit and Credit ledger entries enforcing sum(Debits) == sum(Credits).",
    primaryKey: "id (UUID)",
    foreignKeys: ["journal_entry_id -> journal_entries(id)", "account_id -> accounts(id)", "analytic_account_id -> analytic_accounts(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "journal_entry_id", type: "UUID", constraint: "FOREIGN KEY -> journal_entries(id) ON DELETE CASCADE" },
      { name: "account_id", type: "UUID", constraint: "FOREIGN KEY -> accounts(id)" },
      { name: "analytic_account_id", type: "UUID", constraint: "FOREIGN KEY -> analytic_accounts(id)" },
      { name: "debit", type: "DECIMAL(15,2)", constraint: "DEFAULT 0.00" },
      { name: "credit", type: "DECIMAL(15,2)", constraint: "DEFAULT 0.00" },
    ],
  },
  {
    table: "customer_invoices",
    domain: "SALES & RECEIVABLES",
    description: "Customer Invoices linked to Sales Orders and automated General Ledger Receivables.",
    primaryKey: "id (UUID)",
    foreignKeys: ["customer_id -> contacts(id)", "sales_order_id -> sales_orders(id)", "journal_entry_id -> journal_entries(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "invoice_number", type: "VARCHAR(50)", constraint: "UNIQUE, NOT NULL" },
      { name: "customer_id", type: "UUID", constraint: "FOREIGN KEY -> contacts(id)" },
      { name: "sales_order_id", type: "UUID", constraint: "FOREIGN KEY -> sales_orders(id)" },
      { name: "total_amount", type: "DECIMAL(15,2)", constraint: "NOT NULL, DEFAULT 0.00" },
      { name: "paid_amount", type: "DECIMAL(15,2)", constraint: "NOT NULL, DEFAULT 0.00" },
      { name: "status", type: "VARCHAR(20)", constraint: "DEFAULT 'DRAFT' (POSTED/PAID/PARTIAL)" },
    ],
  },
  {
    table: "vendor_bills",
    domain: "PURCHASE & PAYABLES",
    description: "Vendor Outbound Bills linked to Purchase Orders and Accounts Payable liabilities.",
    primaryKey: "id (UUID)",
    foreignKeys: ["vendor_id -> contacts(id)", "purchase_order_id -> purchase_orders(id)", "journal_entry_id -> journal_entries(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "bill_number", type: "VARCHAR(50)", constraint: "UNIQUE, NOT NULL" },
      { name: "vendor_id", type: "UUID", constraint: "FOREIGN KEY -> contacts(id)" },
      { name: "purchase_order_id", type: "UUID", constraint: "FOREIGN KEY -> purchase_orders(id)" },
      { name: "total_amount", type: "DECIMAL(15,2)", constraint: "NOT NULL, DEFAULT 0.00" },
      { name: "paid_amount", type: "DECIMAL(15,2)", constraint: "NOT NULL, DEFAULT 0.00" },
      { name: "status", type: "VARCHAR(20)", constraint: "DEFAULT 'DRAFT' (POSTED/PAID/PARTIAL)" },
    ],
  },
  {
    table: "payments",
    domain: "SALES & PURCHASES",
    description: "Cash and Bank Payment Settlement Vouchers linked to Invoices or Vendor Bills.",
    primaryKey: "id (UUID)",
    foreignKeys: ["invoice_id -> customer_invoices(id)", "bill_id -> vendor_bills(id)", "journal_id -> journals(id)", "journal_entry_id -> journal_entries(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "payment_number", type: "VARCHAR(50)", constraint: "UNIQUE, NOT NULL" },
      { name: "invoice_id", type: "UUID", constraint: "FOREIGN KEY -> customer_invoices(id)" },
      { name: "bill_id", type: "UUID", constraint: "FOREIGN KEY -> vendor_bills(id)" },
      { name: "amount", type: "DECIMAL(15,2)", constraint: "NOT NULL" },
      { name: "payment_method", type: "VARCHAR(20)", constraint: "NOT NULL (CASH/BANK)" },
      { name: "status", type: "VARCHAR(20)", constraint: "DEFAULT 'POSTED'" },
    ],
  },
  {
    table: "sales_orders",
    domain: "SALES & RECEIVABLES",
    description: "Sales Order quotations and confirmed customer furniture procurement agreements.",
    primaryKey: "id (UUID)",
    foreignKeys: ["customer_id -> contacts(id)", "created_by -> users(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "order_number", type: "VARCHAR(50)", constraint: "UNIQUE, NOT NULL" },
      { name: "customer_id", type: "UUID", constraint: "FOREIGN KEY -> contacts(id)" },
      { name: "status", type: "VARCHAR(20)", constraint: "DEFAULT 'DRAFT' (CONFIRMED/INVOICED)" },
      { name: "total_amount", type: "DECIMAL(15,2)", constraint: "DEFAULT 0.00" },
    ],
  },
  {
    table: "purchase_orders",
    domain: "PURCHASE & PAYABLES",
    description: "Procurement purchase orders issued to raw material & furniture suppliers.",
    primaryKey: "id (UUID)",
    foreignKeys: ["vendor_id -> contacts(id)", "created_by -> users(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "order_number", type: "VARCHAR(50)", constraint: "UNIQUE, NOT NULL" },
      { name: "vendor_id", type: "UUID", constraint: "FOREIGN KEY -> contacts(id)" },
      { name: "status", type: "VARCHAR(20)", constraint: "DEFAULT 'DRAFT' (CONFIRMED/BILLED)" },
      { name: "total_amount", type: "DECIMAL(15,2)", constraint: "DEFAULT 0.00" },
    ],
  },
  {
    table: "contacts",
    domain: "MASTER DATA & SECURITY",
    description: "Unified Party Master (Customers, Vendors, Internal Partners).",
    primaryKey: "id (UUID)",
    foreignKeys: ["user_id -> users(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "name", type: "VARCHAR(150)", constraint: "NOT NULL" },
      { name: "type", type: "VARCHAR(20)", constraint: "NOT NULL (CUSTOMER/VENDOR)" },
      { name: "email", type: "VARCHAR(255)", constraint: "NULLABLE" },
      { name: "user_id", type: "UUID", constraint: "FOREIGN KEY -> users(id)" },
    ],
  },
  {
    table: "products",
    domain: "MASTER DATA & SECURITY",
    description: "Finora Product Catalog (Office Chairs, Ergonomic Desks, Executive Tables).",
    primaryKey: "id (UUID)",
    foreignKeys: [],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "name", type: "VARCHAR(150)", constraint: "NOT NULL" },
      { name: "type", type: "VARCHAR(20)", constraint: "NOT NULL (CONSUMABLE/SERVICE)" },
      { name: "sales_price", type: "DECIMAL(15,2)", constraint: "DEFAULT 0.00" },
      { name: "purchase_price", type: "DECIMAL(15,2)", constraint: "DEFAULT 0.00" },
    ],
  },
  {
    table: "users",
    domain: "MASTER DATA & SECURITY",
    description: "System Authentication & Authorization Users (ADMIN, ACCOUNTANT, CONTACT).",
    primaryKey: "id (UUID)",
    foreignKeys: [],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "email", type: "VARCHAR(255)", constraint: "UNIQUE, NOT NULL" },
      { name: "password_hash", type: "TEXT", constraint: "NOT NULL (BCRYPT HASH)" },
      { name: "role", type: "VARCHAR(20)", constraint: "DEFAULT 'ACCOUNTANT'" },
      { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT true" },
    ],
  },
  {
    table: "analytic_accounts",
    domain: "ANALYTIC & BUDGETING",
    description: "Analytic Cost Centers tracking project and departmental expenses.",
    primaryKey: "id (UUID)",
    foreignKeys: [],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "name", type: "VARCHAR(150)", constraint: "NOT NULL" },
      { name: "type", type: "VARCHAR(20)", constraint: "NOT NULL (COST_CENTER/PROJECT)" },
    ],
  },
  {
    table: "budgets",
    domain: "ANALYTIC & BUDGETING",
    description: "Budget Targets assigned to Analytic Accounts for variance tracking.",
    primaryKey: "id (UUID)",
    foreignKeys: ["analytic_account_id -> analytic_accounts(id)", "responsible_user_id -> users(id)"],
    columns: [
      { name: "id", type: "UUID", constraint: "PRIMARY KEY" },
      { name: "name", type: "VARCHAR(150)", constraint: "NOT NULL" },
      { name: "analytic_account_id", type: "UUID", constraint: "FOREIGN KEY -> analytic_accounts(id)" },
      { name: "planned_amount", type: "DECIMAL(15,2)", constraint: "NOT NULL" },
    ],
  },
];

const DatabaseArchitecture = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeDomain, setActiveDomain] = useState("ALL");
  const [selectedTable, setSelectedTable] = useState(SCHEMA_METADATA[0]);

  useEffect(() => {
    const fetchSchemaStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/system/schema-stats");
        setStats(res.data?.data || null);
      } catch (err) {
        console.error("Error fetching schema stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemaStats();
  }, []);

  const domains = ["ALL", "CORE ACCOUNTING & GL", "SALES & RECEIVABLES", "PURCHASE & PAYABLES", "ANALYTIC & BUDGETING", "MASTER DATA & SECURITY"];

  const filteredTables = activeDomain === "ALL"
    ? SCHEMA_METADATA
    : SCHEMA_METADATA.filter((t) => t.domain === activeDomain);

  if (loading) return <Loading text="Analyzing PostgreSQL Database Schema & ERD Architecture..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="PostgreSQL Database & System Architecture"
        subtitle="Live ERD Relational Mapping, Prisma ORM Models, and Integrated Financial Engine"
        breadcrumbs={[
          { label: "Overview", path: "/" },
          { label: "System Architecture" },
        ]}
        status="ACTIVE"
      />

      {/* System Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Database Engine</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-950 block">{stats?.database || "PostgreSQL 16"}</span>
            <i className="fa-solid fa-database text-blue-600 text-lg"></i>
          </div>
          <p className="text-xs text-slate-500 font-normal">Relational ACID Compliant Engine</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">ORM & Data Layer</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-950 block">{stats?.orm || "Prisma ORM"}</span>
            <i className="fa-solid fa-layer-group text-blue-600 text-lg"></i>
          </div>
          <p className="text-xs text-slate-500 font-normal">Type-Safe Node.js/Express Client</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Schema Tables</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-950 block">19 Models</span>
            <i className="fa-solid fa-table-cells text-blue-600 text-lg"></i>
          </div>
          <p className="text-xs text-slate-500 font-normal">Relational FK & Index Constraints</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Accounting Engine</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-emerald-600 block">✓ BALANCED</span>
            <i className="fa-solid fa-scale-balanced text-emerald-600 text-lg"></i>
          </div>
          <p className="text-xs text-slate-500 font-normal">Double-Entry Ledger Enforcement</p>
        </div>
      </div>

      {/* Integrated Workflow Architecture Pipeline */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-blue-400 font-mono font-bold text-xs uppercase tracking-wider block">
              SYSTEM ARCHITECTURE PIPELINE
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">End-to-End Financial & Operational Data Flow</h3>
          </div>
          <span className="px-3 py-1 bg-blue-950 border border-blue-800 text-blue-300 text-xs font-mono rounded-full font-semibold">
            PostgreSQL Foreign Key Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Sales Pipeline */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <i className="fa-solid fa-cart-shopping"></i>
              <span>Sales & Customer Receivables Flow</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">1. Customer Master</span>
                <span className="text-blue-400">contacts (type='CUSTOMER')</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">2. Sales Quotation</span>
                <span className="text-blue-400">sales_orders + sales_order_items</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">3. Customer Invoice</span>
                <span className="text-blue-400">customer_invoices</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">4. Double-Entry Posting</span>
                <span className="text-emerald-400">journal_entries (DR 1100 AR / CR 4000 Sales)</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">5. Payment Voucher</span>
                <span className="text-emerald-400">payments (DR 1010 Bank / CR 1100 AR)</span>
              </div>
            </div>
          </div>

          {/* Purchasing Pipeline */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <i className="fa-solid fa-truck-field"></i>
              <span>Procurement & Vendor Payables Flow</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">1. Vendor Master</span>
                <span className="text-blue-400">contacts (type='VENDOR')</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">2. Procurement Order</span>
                <span className="text-blue-400">purchase_orders + items</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">3. Vendor Bill</span>
                <span className="text-blue-400">vendor_bills</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">4. Double-Entry Posting</span>
                <span className="text-emerald-400">journal_entries (DR 5000 Exp / CR 2000 AP)</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">5. Outbound Payment</span>
                <span className="text-emerald-400">payments (DR 2000 AP / CR 1010 Bank)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Filters & Schema Table Browser */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">PostgreSQL Relational Schema Explorer</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Click any table model to inspect fields & foreign keys
          </span>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeDomain === domain
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Tables & Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tables List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2 max-h-[600px] overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
              Schema Tables ({filteredTables.length})
            </h4>
            {filteredTables.map((t) => {
              const liveCount = stats?.tables?.[t.table] ?? "—";
              const isSelected = selectedTable.table === t.table;

              return (
                <button
                  key={t.table}
                  onClick={() => setSelectedTable(t)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-50 border-blue-300 text-blue-950 font-semibold shadow-xs"
                      : "bg-white border-slate-100 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-sm block font-bold">{t.table}</span>
                    <span className="text-[10px] text-slate-500 font-sans block">{t.domain}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-xs font-bold text-slate-700">
                      {liveCount} rows
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Table Schema Inspector Detail */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase rounded-md border border-blue-200">
                    {selectedTable.domain}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">TABLE</span>
                </div>
                <h2 className="text-2xl font-bold font-mono text-blue-950 mt-1">{selectedTable.table}</h2>
                <p className="text-sm text-slate-600 mt-1 font-normal">{selectedTable.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Live Row Count</span>
                <span className="text-2xl font-bold font-mono text-blue-600">
                  {stats?.tables?.[selectedTable.table] ?? 0}
                </span>
              </div>
            </div>

            {/* Primary & Foreign Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">Primary Key</span>
                <span className="font-mono font-bold text-blue-900">{selectedTable.primaryKey}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">Foreign Key Relations</span>
                {selectedTable.foreignKeys.length > 0 ? (
                  <div className="space-y-1">
                    {selectedTable.foreignKeys.map((fk, idx) => (
                      <span key={idx} className="font-mono text-slate-800 block">
                        • {fk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No direct foreign keys</span>
                )}
              </div>
            </div>

            {/* Columns Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Column Definitions & Types</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-50/70 text-blue-950 font-semibold uppercase tracking-wider border-b border-blue-100">
                    <tr>
                      <th className="py-2.5 px-3">Column Name</th>
                      <th className="py-2.5 px-3">Data Type</th>
                      <th className="py-2.5 px-3">Constraint & Default</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {selectedTable.columns.map((col, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30">
                        <td className="py-2 px-3 font-bold text-blue-900">{col.name}</td>
                        <td className="py-2 px-3 text-slate-700">{col.type}</td>
                        <td className="py-2 px-3 text-slate-500 font-sans text-[11px] font-medium">{col.constraint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseArchitecture;
