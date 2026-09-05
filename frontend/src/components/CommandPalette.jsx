import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commandItems = [
    { label: "Dashboard Overview", category: "Navigation", path: "/", icon: "fa-chart-pie" },
    { label: "Sales Orders Ledger", category: "Sales", path: "/sales-orders", icon: "fa-file-signature" },
    { label: "Create New Sales Order", category: "Sales Action", path: "/sales-orders/new", icon: "fa-plus" },
    { label: "Customer Invoices (AR 1100)", category: "Sales", path: "/invoices", icon: "fa-file-invoice-dollar" },
    { label: "Customer Payments Received", category: "Sales", path: "/payments?type=customer", icon: "fa-money-bill-wave" },
    { label: "Purchase Orders Ledger", category: "Purchases", path: "/purchase-orders", icon: "fa-cart-shopping" },
    { label: "Create New Purchase Order", category: "Purchases Action", path: "/purchase-orders/new", icon: "fa-plus" },
    { label: "Vendor Bills (AP 2000)", category: "Purchases", path: "/bills", icon: "fa-receipt" },
    { label: "Vendor Payments Outbound", category: "Purchases", path: "/payments?type=vendor", icon: "fa-hand-holding-dollar" },
    { label: "Record Cash / Bank Payment Voucher", category: "Payment Action", path: "/payments", icon: "fa-money-bill-transfer" },
    { label: "Financial Statements & P&L", category: "Reports", path: "/reports", icon: "fa-chart-line" },
    { label: "Chart of Accounts (COA)", category: "Accounting", path: "/accounts", icon: "fa-sitemap" },
    { label: "Journals & General Ledger", category: "Accounting", path: "/journals", icon: "fa-book" },
    { label: "Journal Entries Log", category: "Accounting", path: "/journal-entries", icon: "fa-book-bookmark" },
    { label: "Contacts & Master Directory", category: "Configuration", path: "/contacts", icon: "fa-address-book" },
    { label: "Products & Furniture Catalog", category: "Configuration", path: "/products", icon: "fa-couch" },
    { label: "User Profile & Account Settings", category: "Settings", path: "/profile", icon: "fa-user-gear" },
    { label: "Security & Password Management", category: "Settings", path: "/profile?tab=security", icon: "fa-shield-halved" },
  ];

  const filteredItems = commandItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state trigger
        }
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          navigate(filteredItems[selectedIndex].path);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-20 px-4 text-center">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

        {/* Command Box */}
        <div className="inline-block w-full max-w-xl bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="relative border-b border-slate-100 px-4 py-3.5 flex items-center bg-slate-50/50">
            <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm mr-3"></i>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ERP pages, quick actions, documents... (Press Esc to close)"
              className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase border border-slate-300 ml-2 shrink-0">
              ESC
            </span>
          </div>

          {/* Filtered List */}
          <div className="max-h-80 overflow-y-auto py-2 px-2">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs font-semibold text-slate-400">
                No matching ERP pages or actions found for "{query}".
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    index === selectedIndex
                      ? "bg-[#1E3A8A] text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`fa-solid ${item.icon} w-4 text-center ${index === selectedIndex ? "text-white" : "text-[#1E3A8A]"}`}></i>
                    <span className="font-extrabold">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    index === selectedIndex
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                    {item.category}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="border-t border-slate-100 px-4 py-2 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <div className="flex items-center space-x-3">
              <span><kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-700">↑↓</kbd> Navigate</span>
              <span><kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-700">↵</kbd> Select</span>
            </div>
            <span>Urban Furniture ERP Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
