import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isCollapsed: externalCollapsed, onToggle }) => {
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    return localStorage.getItem("uf_sidebar_collapsed") === "true";
  });

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggle = () => {
    const nextState = !isCollapsed;
    setInternalCollapsed(nextState);
    localStorage.setItem("uf_sidebar_collapsed", String(nextState));
    if (onToggle) onToggle(nextState);
  };

  const menuSections = [
    {
      title: "OVERVIEW",
      items: [
        { name: "Dashboard", path: "/", icon: "fa-chart-pie" },
      ],
    },
    {
      title: "SALES",
      items: [
        { name: "Sales Orders", path: "/sales-orders", icon: "fa-file-signature" },
        { name: "Customer Invoices", path: "/invoices", icon: "fa-file-invoice-dollar" },
        { name: "Customer Payments", path: "/payments?type=customer", icon: "fa-money-bill-wave" },
      ],
    },
    {
      title: "PURCHASES",
      items: [
        { name: "Purchase Orders", path: "/purchase-orders", icon: "fa-cart-shopping" },
        { name: "Vendor Bills", path: "/bills", icon: "fa-receipt" },
        { name: "Vendor Payments", path: "/payments?type=vendor", icon: "fa-hand-holding-dollar" },
      ],
    },
    {
      title: "ACCOUNTING",
      items: [
        { name: "Chart of Accounts", path: "/accounts", icon: "fa-sitemap" },
        { name: "Journals", path: "/journals", icon: "fa-book" },
        { name: "Journal Entries", path: "/journal-entries", icon: "fa-book-bookmark" },
      ],
    },
    {
      title: "PLANNING",
      items: [
        { name: "Analytic Accounts", path: "/analytic-accounts", icon: "fa-layer-group" },
        { name: "Budgets", path: "/budgets", icon: "fa-calculator" },
      ],
    },
    {
      title: "REPORTS",
      items: [
        { name: "Financial Statements", path: "/reports", icon: "fa-chart-line" },
      ],
    },
    {
      title: "CONFIGURATION",
      items: [
        { name: "Contacts Master", path: "/contacts", icon: "fa-address-book" },
        { name: "Products Master", path: "/products", icon: "fa-couch" },
      ],
    },
  ];

  return (
    <aside
      className={`relative bg-[#1E3A8A] text-white border-r border-blue-900 min-h-[calc(100vh-4rem)] flex flex-col shrink-0 shadow-lg transition-all duration-300 select-none ${
        isCollapsed ? "w-16 px-2 py-4" : "w-64 p-4"
      }`}
    >
      {/* Top Header Row with Arrow Collapser in Top-Right Corner */}
      <div className={`flex items-center pb-3 mb-2 border-b border-blue-800/50 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-200/90 px-1">
            Navigation
          </span>
        )}
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center justify-center rounded-xl bg-blue-800/60 text-blue-100 hover:bg-white hover:text-[#1E3A8A] transition-all duration-200 focus:outline-none cursor-pointer shadow-sm ${
            isCollapsed ? "w-10 h-10" : "w-7 h-7"
          }`}
          title={isCollapsed ? "Expand Sidebar (Right)" : "Collapse Sidebar (Left)"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <i
            className={`fa-solid ${
              isCollapsed ? "fa-chevron-right text-xs" : "fa-chevron-left text-xs"
            } transition-transform duration-200`}
          ></i>
        </button>
      </div>

      {/* Navigation Menu List */}
      <div className="space-y-4 overflow-y-auto pr-0.5 custom-scrollbar">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed ? (
              <h4 className="text-[10px] font-black text-blue-200/90 uppercase tracking-widest mb-1.5 px-3 opacity-90">
                {section.title}
              </h4>
            ) : idx > 0 ? (
              <div className="border-t border-blue-800/40 my-2 mx-2" />
            ) : null}

            <nav className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center text-sm font-medium rounded-xl transition-all duration-200 ${
                      isCollapsed
                        ? "w-10 h-10 mx-auto justify-center"
                        : "px-3 py-2"
                    } ${
                      isActive
                        ? "bg-white text-[#1E3A8A] shadow-md font-extrabold"
                        : "text-blue-100/80 hover:bg-blue-800/60 hover:text-white"
                    }`
                  }
                >
                  <i
                    className={`fa-solid ${item.icon} text-center ${
                      isCollapsed ? "text-base" : "w-5 mr-2.5 text-xs"
                    }`}
                  ></i>
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
