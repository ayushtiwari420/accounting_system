import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isCollapsed: externalCollapsed, onToggle, isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const userRole = (user?.role || "ADMIN").toUpperCase();

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

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
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

  const renderContent = (collapsedState, isMobileDrawer = false) => (
    <div className="flex flex-col h-full">
      {/* Top Header Row */}
      <div className={`flex items-center pb-3 mb-2 border-b border-blue-800/50 ${collapsedState ? "justify-center" : "justify-between"}`}>
        {!collapsedState && (
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.06em] px-1">
            Navigation
          </span>
        )}
        
        {isMobileDrawer ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-800/60 text-blue-100 hover:bg-white hover:text-[#1E3A8A] transition-all min-w-[44px] min-h-[44px]"
            title="Close Menu"
            aria-label="Close Mobile Menu"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center justify-center rounded-xl bg-blue-800/60 text-blue-100 hover:bg-white hover:text-[#1E3A8A] transition-all duration-200 focus:outline-none cursor-pointer shadow-sm ${
              collapsedState ? "w-10 h-10" : "w-7 h-7"
            }`}
            title={collapsedState ? "Expand Sidebar (Right)" : "Collapse Sidebar (Left)"}
            aria-label={collapsedState ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i
              className={`fa-solid ${
                collapsedState ? "fa-chevron-right text-xs" : "fa-chevron-left text-xs"
              } transition-transform duration-200`}
            ></i>
          </button>
        )}
      </div>

      {/* Navigation Menu List */}
      <div className="space-y-4 overflow-y-auto pr-0.5 custom-scrollbar flex-1">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            {!collapsedState ? (
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.06em] mb-1.5 px-3">
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
                  onClick={handleNavClick}
                  title={collapsedState ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center text-sm font-bold rounded-xl transition-all duration-200 min-h-[44px] ${
                      collapsedState
                        ? "w-10 h-10 mx-auto justify-center min-h-0"
                        : "px-3 py-2.5"
                    } ${
                      isActive
                        ? "bg-white text-[#1E3A8A] shadow-md font-bold"
                        : "text-blue-100/90 hover:bg-blue-800/60 hover:text-white"
                    }`
                  }
                >
                  <i
                    className={`fa-solid ${item.icon} text-center ${
                      collapsedState ? "text-base" : "w-5 mr-2.5 text-xs"
                    }`}
                  ></i>
                  {!collapsedState && <span className="truncate">{item.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Visible on md and larger) */}
      <aside
        className={`hidden md:flex relative bg-[#1E3A8A] text-white border-r border-blue-900 min-h-[calc(100vh-4rem)] flex-col shrink-0 shadow-lg transition-all duration-300 select-none ${
          isCollapsed ? "w-16 px-2 py-4" : "w-64 p-4"
        }`}
      >
        {renderContent(isCollapsed, false)}
      </aside>

      {/* 2. MOBILE DRAWER OVERLAY (Visible on screens < md when open) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Sliding Drawer Container */}
          <aside className="relative w-72 max-w-[85vw] bg-[#1E3A8A] text-white p-4 h-full shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-250 select-none">
            {renderContent(false, true)}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
