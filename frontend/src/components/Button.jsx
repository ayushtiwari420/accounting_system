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
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-100 border border-transparent",
    secondary:
      "bg-white hover:bg-blue-50 text-blue-600 border border-blue-600 active:bg-blue-100",
    outline:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300",
    ghost:
      "bg-transparent hover:bg-blue-50 text-blue-600 border border-transparent",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white border border-transparent",
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
