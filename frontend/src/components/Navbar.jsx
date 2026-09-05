import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Modal from "./Modal.jsx";
import CommandPalette from "./CommandPalette.jsx";

const Navbar = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setIsProfileDropdownOpen(false);
    logout();
  };

  const handleNavigateToTab = (tabName) => {
    setIsProfileDropdownOpen(false);
    navigate(`/profile?tab=${tabName}`);
  };

  const handleQuickCreateClick = (path) => {
    setIsQuickCreateOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Brand Logo & Mobile Menu Hamburger & Search Trigger */}
        <div className="flex items-center space-x-2 sm:space-x-6">
          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden flex items-center justify-center p-2 rounded-xl text-[#1E3A8A] hover:bg-slate-100 min-w-[44px] min-h-[44px] transition-colors"
            title="Open Mobile Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <i className="fa-solid fa-bars text-lg"></i>
          </button>

          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-xs shrink-0">
              <i className="fa-solid fa-chair text-xs"></i>
            </div>
            <span className="text-[22px] font-black text-[#1E3A8A] tracking-[-0.02em] truncate max-w-[160px] sm:max-w-none">
              FINORA <span className="hidden xs:inline text-xs font-semibold text-slate-400 ml-1 tracking-normal font-sans">ERP</span>
            </span>
          </Link>

          {/* Command Palette (Ctrl + K) Search Button - Desktop */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-500 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold transition-all w-64 justify-between"
          >
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
              <span>Quick Search...</span>
            </div>
            <kbd className="font-mono text-[10px] font-bold bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Corner Controls: Mobile Search + Quick Create + Profile Badge */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 min-w-[44px] min-h-[44px] transition-colors"
            title="Quick Search"
            aria-label="Quick Search"
          >
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </button>
          {/* + Quick Create Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1E3A8A] text-white hover:bg-[#152e70] transition-all text-xs font-extrabold shadow-xs"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span className="hidden sm:inline">Quick Create</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-white/80 transition-transform ${isQuickCreateOpen ? "rotate-180" : ""}`}></i>
            </button>

            {isQuickCreateOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Create Document
                </div>

                <button
                  onClick={() => handleQuickCreateClick("/sales-orders/new")}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center space-x-2"
                >
                  <i className="fa-solid fa-file-signature w-4 text-[#1E3A8A]"></i>
                  <span>New Sales Order</span>
                </button>

                <button
                  onClick={() => handleQuickCreateClick("/purchase-orders/new")}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center space-x-2"
                >
                  <i className="fa-solid fa-cart-shopping w-4 text-[#1E3A8A]"></i>
                  <span>New Purchase Order</span>
                </button>

                <button
                  onClick={() => handleQuickCreateClick("/payments")}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center space-x-2"
                >
                  <i className="fa-solid fa-money-bill-transfer w-4 text-[#1E3A8A]"></i>
                  <span>Record Payment Voucher</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>
                <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Add Master Item
                </div>

                <button
                  onClick={() => handleQuickCreateClick("/contacts")}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center space-x-2"
                >
                  <i className="fa-solid fa-address-book w-4 text-[#1E3A8A]"></i>
                  <span>Add New Contact</span>
                </button>

                <button
                  onClick={() => handleQuickCreateClick("/products")}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center space-x-2"
                >
                  <i className="fa-solid fa-couch w-4 text-[#1E3A8A]"></i>
                  <span>Add Furniture Product</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Badge with Dropdown Trigger */}
          {user && (
            <div
              className="relative"
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-3 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#1E3A8A] hover:bg-slate-50 transition-all focus:outline-none shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-[#1E3A8A] font-extrabold uppercase">
                    {user.role}
                  </div>
                </div>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}></i>
              </button>

              {/* Profile & Settings Interactive Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-extrabold text-slate-900">{user.name}</p>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase bg-[#1E3A8A] text-white px-2 py-0.5 rounded">
                      {user.role} ROLE
                    </span>
                  </div>

                  <div className="py-1 text-xs font-bold text-slate-700">
                    <button
                      type="button"
                      onClick={() => handleNavigateToTab("profile")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 hover:text-[#1E3A8A] flex items-center space-x-2.5 transition-colors"
                    >
                      <i className="fa-solid fa-user-gear w-4 text-[#1E3A8A]"></i>
                      <span>My Profile & Info</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigateToTab("settings")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 hover:text-[#1E3A8A] flex items-center space-x-2.5 transition-colors"
                    >
                      <i className="fa-solid fa-sliders w-4 text-[#1E3A8A]"></i>
                      <span>Account Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigateToTab("security")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 hover:text-[#1E3A8A] flex items-center space-x-2.5 transition-colors"
                    >
                      <i className="fa-solid fa-shield-halved w-4 text-[#1E3A8A]"></i>
                      <span>Security & Password</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigateToTab("preferences")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 hover:text-[#1E3A8A] flex items-center space-x-2.5 transition-colors"
                    >
                      <i className="fa-solid fa-palette w-4 text-[#1E3A8A]"></i>
                      <span>ERP Preferences</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-[#1E3A8A] font-extrabold flex items-center space-x-2.5 transition-colors text-xs"
                    >
                      <i className="fa-solid fa-right-from-bracket w-4 text-[#1E3A8A]"></i>
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Confirmation Modal */}
        <Modal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Confirm Sign Out"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center p-2">
            <div className="w-14 h-14 bg-slate-100 text-[#1E3A8A] rounded-2xl flex items-center justify-center mx-auto text-2xl border border-slate-200 shadow-inner">
              <i className="fa-solid fa-right-from-bracket"></i>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900">Are you sure you want to log out?</h4>
              <p className="text-xs font-medium text-slate-500">
                You will be signed out of your current session on Finora ERP. You will need your credentials to log back in.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all border border-[#1E3A8A]"
              >
                Yes, Confirm Logout
              </button>
            </div>
          </div>
        </Modal>
      </header>

      {/* Global Command Palette Component Triggered via Ctrl+K */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};

export default Navbar;
