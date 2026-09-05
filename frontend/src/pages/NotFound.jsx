import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-mono font-bold text-xl">
        404
      </div>
      <h1 className="text-3xl font-bold text-slate-900">Page Not Found</h1>
      <p className="text-slate-600 max-w-md text-sm">
        The accounting page or document route you requested does not exist or has been moved.
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

export default NotFound;
