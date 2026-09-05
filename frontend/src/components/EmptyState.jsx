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
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center my-6 space-y-4 shadow-xs">
      <div className="w-16 h-16 bg-slate-50 text-[#1E3A8A] rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner border border-slate-200">
        <i className={`fa-solid ${icon}`}></i>
      </div>

      <div className="max-w-sm mx-auto space-y-1">
        <h3 className="text-lg font-extrabold text-[#1E3A8A]">{title}</h3>
        <p className="text-sm font-medium text-slate-500">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#152e70] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
