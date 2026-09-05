import React from "react";
import { formatCurrency } from "../utils/formatters";

/**
 * CurrencyDisplay Component - Blue & White Theme
 * Renders Indian Rupee amounts in dark blue, blue, or clean neutral colors.
 */
const CurrencyDisplay = ({
  amount,
  size = "md", // "sm", "md", "lg", "xl"
  color = "default", // "default", "blue", "darkblue", "success", "danger", "muted"
  className = "",
  showSymbol = true,
}) => {
  const num = Number(amount) || 0;

  const sizeClasses = {
    sm: "text-xs font-semibold font-mono",
    md: "text-base font-semibold font-mono",
    lg: "text-xl font-bold font-mono",
    xl: "text-[30px] font-bold font-mono tracking-tight leading-tight",
  };

  const colorClasses = {
    default: "text-slate-900",
    blue: "text-[#1E3A8A]",
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
