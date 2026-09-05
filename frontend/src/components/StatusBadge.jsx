import React from "react";

/**
 * StatusBadge Component - Subtle ERP badges with Blue & White primary theme
 */
const StatusBadge = ({ status = "DRAFT", size = "normal" }) => {
  const normalized = String(status).toUpperCase();

  const badgeStyles = {
    DRAFT: "bg-blue-50 text-blue-700 border-blue-200",
    CONFIRMED: "bg-blue-100 text-blue-900 border-blue-300 font-extrabold",
    POSTED: "bg-blue-50 text-blue-800 border-blue-200 font-bold",
    PARTIALLY_PAID: "bg-sky-50 text-blue-900 border-sky-200 font-bold",
    PAID: "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold",
    ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold",
    OVERDUE: "bg-rose-50 text-rose-800 border-rose-200 font-bold",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200 font-semibold",
    INACTIVE: "bg-slate-100 text-slate-600 border-slate-200 font-semibold",
  };

  const labels = {
    DRAFT: "Draft",
    CONFIRMED: "Confirmed",
    POSTED: "Posted",
    PARTIALLY_PAID: "Partially Paid",
    PAID: "Paid",
    ACTIVE: "Active",
    OVERDUE: "Overdue",
    CANCELLED: "Cancelled",
    INACTIVE: "Inactive",
  };

  const style = badgeStyles[normalized] || "bg-blue-50 text-blue-700 border-blue-200";
  const label = labels[normalized] || normalized;

  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded-md border uppercase ${sizeClass} ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current opacity-75 bg-current"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
