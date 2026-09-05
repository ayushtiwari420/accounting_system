import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-black text-base shadow-sm">
            UF
          </div>
          <span className="text-lg font-black text-[#1E3A8A] tracking-tight">
            Urban Furniture ERP
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <Link
            to="/profile"
            className="flex items-center space-x-3 pr-3 border-r border-slate-200 hover:opacity-80 transition-opacity"
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
          </Link>
        )}

        <button
          onClick={logout}
          className="text-slate-500 hover:text-rose-600 p-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center text-xs font-bold"
          title="Logout"
        >
          <i className="fa-solid fa-right-from-bracket mr-1.5"></i>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
