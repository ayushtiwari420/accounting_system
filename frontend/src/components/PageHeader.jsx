import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

/**
 * PageHeader Component - Strict Blue & White Theme
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  status,
  actions,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-5 mb-6 shadow-xs">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-2 font-medium">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300">/</span>}
              {item.path ? (
                <Link
                  to={item.path}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-800 font-bold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-[32px] font-bold leading-[1.2] tracking-tight text-blue-950">
              {title}
            </h1>
            {status && <StatusBadge status={status} />}
          </div>
          {subtitle && (
            <p className="text-sm font-normal text-slate-500 mt-1 leading-normal">{subtitle}</p>
          )}
        </div>

        {/* Contextual Actions */}
        {actions && <div className="flex items-center space-x-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
