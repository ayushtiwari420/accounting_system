import React from "react";

/**
 * StatusBadge Component - Subtle ERP badges with Blue & White primary theme
 */
const StatusBadge = ({ status = "DRAFT", size = "normal" }) => {
  const normalized = String(status).toUpperCase();

  const badgeStyles = {
    DRAFT: "bg-white text-[#1E3A8A] border-[#1E3A8A]",
    CONFIRMED: "bg-[#1E3A8A] text-white border-[#1E3A8A] font-extrabold",
    POSTED: "bg-[#1E3A8A] text-white border-[#1E3A8A] font-bold",
    PARTIALLY_PAID: "bg-white text-[#1E3A8A] border-[#1E3A8A] font-bold",
    PAID: "bg-[#1E3A8A] text-white border-[#1E3A8A] font-bold",
    ACTIVE: "bg-[#1E3A8A] text-white border-[#1E3A8A] font-bold",
    OVERDUE: "bg-white text-[#1E3A8A] border-[#1E3A8A] font-bold",
    CANCELLED: "bg-white text-slate-500 border-slate-300 font-semibold",
    INACTIVE: "bg-white text-slate-500 border-slate-300 font-semibold",
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
