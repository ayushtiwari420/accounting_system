import React from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Account details and operational role configuration.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name || "System User"}</h2>
            <p className="text-sm text-slate-500">{user?.email || "N/A"}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                ROLE: {user?.role || "ADMIN"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {user?.name || "—"}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {user?.email || "—"}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              User ID
            </label>
            <p className="font-mono text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {user?.id || "—"}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Account Status
            </label>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-slate-800">Active & Authorized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
