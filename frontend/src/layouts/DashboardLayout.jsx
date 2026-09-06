import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import AIChatAssistant from "../components/AIChatAssistant.jsx";

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)} />
      <div className="flex flex-1 relative">
        <Sidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>
      <AIChatAssistant />
    </div>
  );
};

export default DashboardLayout;
