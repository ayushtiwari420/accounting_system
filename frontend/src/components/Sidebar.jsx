import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
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
    <aside className="w-64 bg-[#1E3A8A] text-white border-r border-blue-900 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 shadow-lg">
      <div className="space-y-6 overflow-y-auto">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2 px-3 opacity-80">
              {section.title}
            </h4>
            <nav className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md font-semibold"
                        : "text-blue-100/80 hover:bg-blue-800/60 hover:text-white"
                    }`
                  }
                >
                  <i className={`fa-solid ${item.icon} w-5 mr-2.5 text-center text-xs`}></i>
                  <span>{item.name}</span>
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
