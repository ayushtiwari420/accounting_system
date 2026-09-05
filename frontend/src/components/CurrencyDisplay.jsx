import React from "react";
import { formatCurrency } from "../utils/formatters";

/**
 * CurrencyDisplay Component - Finora ERP Typography System
 * Formats Indian Rupee amounts using Lato font with tabular numerals (font-variant-numeric: tabular-nums).
 */
const CurrencyDisplay = ({
  amount,
  size = "md", // "sm", "md", "lg", "xl", "kpi"
  color = "default", // "default", "blue", "darkblue", "success", "danger", "muted"
  className = "",
  showSymbol = true,
}) => {
  const num = Number(amount) || 0;

  // Strict typography system mappings
  const sizeClasses = {
    sm: "text-[13px] font-bold tabular-nums leading-5",
    md: "text-sm font-bold tabular-nums leading-5", // Financial Amount: 14px / 700 / tabular-nums
    lg: "text-base font-bold tabular-nums leading-6", // Report Total: 16px / 700 / tabular-nums
    xl: "text-xl font-extrabold tabular-nums leading-7",
    kpi: "text-[28px] leading-[36px] font-black tracking-tight tabular-nums", // Financial KPI: 28px / 900 / -0.02em / tabular-nums
  };

  const colorClasses = {
    default: "text-slate-900",
    blue: "text-[#2563EB]",
    darkblue: "text-[#1E3A8A]",
    success: "text-[#1E3A8A]",
    danger: "text-slate-800",
    muted: "text-slate-500",
  };

  return (
    <span className={`${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.default} ${className}`}>
      {formatCurrency(num, showSymbol)}
    </span>
  );
};

export default CurrencyDisplay;
