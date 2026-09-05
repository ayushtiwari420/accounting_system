import React from "react";

/**
 * EmptyState Component
 * Contextual empty state with guidance and actionable next steps.
 */
const EmptyState = ({
  icon = "fa-folder-open",
  title = "No Records Found",
  description = "Get started by creating your first entry.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center my-6 space-y-4">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner border border-blue-100">
        <i className={`fa-solid ${icon}`}></i>
      </div>

      <div className="max-w-sm mx-auto space-y-1">
        <h3 className="text-lg font-bold text-blue-950">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
