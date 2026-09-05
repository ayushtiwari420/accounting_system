import React from "react";
import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-900">403 - Access Denied</h1>
      <p className="text-slate-600 max-w-md text-sm">
        You do not have permission to access this module or complete this action with your current role privileges.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
      >
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default Forbidden;
