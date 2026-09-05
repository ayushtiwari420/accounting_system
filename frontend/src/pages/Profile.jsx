import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import PageHeader from "../components/PageHeader";

const Profile = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const [notification, setNotification] = useState(null);

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: "+91 98765 43210",
    city: "Mumbai",
    state: "Maharashtra",
    company: "Finora Financial Systems Pvt Ltd",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferencesForm, setPreferencesForm] = useState({
    defaultPaymentMethod: "BANK",
    defaultFiscalPeriod: "ALL",
    currencySymbol: "INR (₹)",
    themePalette: "Strict Dark Blue #1E3A8A & Pure White",
    emailInvoiceAlerts: true,
    emailBillReminders: true,
  });

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setNotification(null);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setNotification({ type: "success", text: "✓ Profile information updated successfully!" });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotification({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setNotification({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setNotification({ type: "success", text: "✓ Account password changed successfully!" });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setNotification({ type: "success", text: "✓ ERP Account preferences saved successfully!" });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="User Profile & Account Settings"
        subtitle="Manage your identity credentials, security controls, and ERP system preferences"
      />

      {/* Alert Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center justify-between shadow-xs ${
            notification.type === "success"
              ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
              : "bg-slate-100 text-slate-900 border-slate-300"
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="ml-4 font-bold">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white px-4 pt-2 rounded-2xl border shadow-xs gap-2">
        <button
          onClick={() => handleTabChange("profile")}
          className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "profile"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <i className="fa-solid fa-user-gear mr-2"></i>
          My Profile Overview
        </button>

        <button
          onClick={() => handleTabChange("settings")}
          className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "settings"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <i className="fa-solid fa-sliders mr-2"></i>
          Account Settings
        </button>

        <button
          onClick={() => handleTabChange("security")}
          className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "security"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <i className="fa-solid fa-shield-halved mr-2"></i>
          Security & Password
        </button>

        <button
          onClick={() => handleTabChange("preferences")}
          className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "preferences"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <i className="fa-solid fa-palette mr-2"></i>
          ERP Preferences
        </button>
      </div>

      {/* TAB 1: PROFILE OVERVIEW */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 rounded-2xl bg-[#1E3A8A] text-white font-black text-3xl flex items-center justify-center shadow-md border-2 border-white">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{user?.name || "System Administrator"}</h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{user?.email || "admin@finora.com"}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="bg-[#1E3A8A] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                    ROLE: {user?.role || "ADMIN"}
                  </span>
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">
                    ✓ ACTIVE AUTHORIZED SESSION
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleTabChange("settings")}
              className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-extrabold text-xs rounded-xl transition-all shadow-xs"
            >
              <i className="fa-solid fa-pen-to-square mr-1.5"></i>
              Edit Profile Info
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-[#1E3A8A] tracking-wider border-b border-slate-100 pb-2">
                Identity & Contact Information
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Full User Name</span>
                  <span className="font-bold text-slate-900 text-sm">{user?.name || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Primary Email Address</span>
                  <span className="font-bold text-slate-900">{user?.email || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Registered Phone / Mobile</span>
                  <span className="font-mono font-bold text-slate-800">{profileForm.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Primary Operating Location</span>
                  <span className="font-bold text-slate-800">{profileForm.city}, {profileForm.state}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-[#1E3A8A] tracking-wider border-b border-slate-100 pb-2">
                ERP Authority & Security
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">System Access Level</span>
                  <span className="font-bold text-slate-900">{user?.role || "ADMIN"} (Full General Ledger & Booking Authority)</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Account Record ID</span>
                  <span className="font-mono font-bold text-slate-600 text-[11px]">{user?.id || "0000-0000-0000-0000"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Company Division</span>
                  <span className="font-bold text-slate-800">{profileForm.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Security Status</span>
                  <span className="font-mono text-[11px] font-bold text-[#1E3A8A] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                    JWT Session Authenticated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: ACCOUNT SETTINGS */}
      {activeTab === "settings" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900">Update Profile & Contact Settings</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Update your administrative profile details used across Purchase Orders, Invoices, and Audit logs.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Phone / Mobile Number
                </label>
                <input
                  type="text"
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Operating City
                </label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  State / Region
                </label>
                <input
                  type="text"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Company / Division Name
              </label>
              <input
                type="text"
                value={profileForm.company}
                onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#152e70] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
              >
                Save Profile Settings
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* TAB 3: SECURITY & PASSWORD */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900">Change Account Security Password</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ensure your account is using a strong password to protect General Ledger and financial transactions.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#152e70] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
              >
                Update Password
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* TAB 4: ERP PREFERENCES */}
      {activeTab === "preferences" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900">ERP System & Operational Preferences</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Customize default transaction booking accounts, reporting filters, and visual theme settings.
            </p>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Default Payment Account
                </label>
                <select
                  value={preferencesForm.defaultPaymentMethod}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, defaultPaymentMethod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value="BANK">BANK (1010 HDFC Bank Account)</option>
                  <option value="CASH">CASH (1000 Physical Cash Account)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Default Financial Report Period
                </label>
                <select
                  value={preferencesForm.defaultFiscalPeriod}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, defaultFiscalPeriod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value="ALL">All Time Operating Period</option>
                  <option value="THIS_MONTH">Current Month</option>
                  <option value="THIS_QUARTER">Current Quarter</option>
                  <option value="THIS_YEAR">Current Fiscal Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Design System Theme Palette
              </label>
              <input
                type="text"
                disabled
                value={preferencesForm.themePalette}
                className="w-full bg-slate-100 border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono"
              />
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase text-[#1E3A8A] tracking-wider">
                System Alerts & Notifications
              </h4>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferencesForm.emailInvoiceAlerts}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, emailInvoiceAlerts: e.target.checked })}
                  className="w-4 h-4 text-[#1E3A8A] rounded border-slate-300 focus:ring-[#1E3A8A]"
                />
                <span className="text-xs font-bold text-slate-800">Email alerts when Customer Payments are received</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferencesForm.emailBillReminders}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, emailBillReminders: e.target.checked })}
                  className="w-4 h-4 text-[#1E3A8A] rounded border-slate-300 focus:ring-[#1E3A8A]"
                />
                <span className="text-xs font-bold text-slate-800">Email reminders when Vendor Bills reach due date</span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#152e70] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
