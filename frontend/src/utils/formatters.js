/**
 * Utility functions for Indian Rupee currency and financial formatting
 */

/**
 * Formats a numeric value into Indian Rupee currency standard (e.g. ₹94,400.00)
 * @param {number|string} amount 
 * @param {boolean} includeSymbol - Default true
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, includeSymbol = true) => {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return includeSymbol ? `₹${formatted}` : formatted;
};

/**
 * Formats ISO date string to localized Indian date format (e.g. 05 Sep 2026)
 * @param {string|Date} dateStr 
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
