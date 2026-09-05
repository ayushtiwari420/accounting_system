import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

/**
 * PageHeader Component - Finora ERP Typography System
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  status,
  actions,
}) => {
  return (
    <div className="bg-white border-b border-[#E2E8F0] px-6 py-5 mb-6 shadow-xs">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-[13px] text-[#64748B] mb-2 font-normal">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300">/</span>}
              {item.path ? (
                <Link
                  to={item.path}
                  className="text-[#2563EB] hover:text-[#1E3A8A] font-bold transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#0F172A] font-bold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-[28px] leading-[36px] font-bold tracking-tight text-[#0F172A]">
              {title}
            </h1>
            {status && <StatusBadge status={status} />}
          </div>
          {subtitle && (
            <p className="text-sm leading-5 font-normal text-[#64748B] mt-1">{subtitle}</p>
          )}
        </div>

        {/* Contextual Actions */}
        {actions && <div className="flex items-center space-x-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
