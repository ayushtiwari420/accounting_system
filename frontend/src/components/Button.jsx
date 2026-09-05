import React from "react";

/**
 * Button Component - Strict Blue & White Theme
 */
const Button = ({
  children,
  variant = "primary", // "primary", "secondary", "outline", "danger"
  size = "md", // "sm", "md", "lg"
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm leading-5 font-bold",
    md: "px-4 py-2.5 text-sm leading-5 font-bold",
    lg: "px-6 py-3 text-sm leading-5 font-bold",
  };

  const variantClasses = {
    primary:
      "bg-[#1E3A8A] hover:bg-[#152e70] active:bg-[#0f2254] text-white shadow-sm border border-transparent font-bold",
    secondary:
      "bg-white hover:bg-slate-50 text-[#1E3A8A] border border-[#1E3A8A] font-bold",
    outline:
      "bg-white hover:bg-slate-50 text-[#1E3A8A] border border-[#1E3A8A] font-bold",
    ghost:
      "bg-transparent hover:bg-slate-100 text-[#1E3A8A] border border-transparent font-bold",
    danger:
      "bg-[#1E3A8A] hover:bg-[#152e70] text-white border border-transparent font-bold",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
