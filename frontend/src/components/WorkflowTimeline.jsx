import React from "react";

/**
 * WorkflowTimeline component - Strict Blue & White theme
 * @param {Array<{ key: string, label: string }>} steps
 * @param {string} currentStepKey
 * @param {Array<string>} completedKeys
 */
const WorkflowTimeline = ({ steps = [], currentStepKey = "", completedKeys = [] }) => {
  return (
    <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between overflow-x-auto py-1 px-1">
        {steps.map((step, idx) => {
          const isCompleted = completedKeys.includes(step.key);
          const isCurrent = step.key === currentStepKey;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.key || idx}>
              <div className="flex items-center space-x-2 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-blue-600 text-white shadow-sm"
                      : isCurrent
                      ? "bg-blue-900 text-white ring-4 ring-blue-100 font-black"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-xs font-bold tracking-wide ${
                    isCurrent
                      ? "text-blue-900 font-extrabold uppercase"
                      : isCompleted
                      ? "text-blue-700 font-semibold"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`h-0.5 flex-1 min-w-[2rem] mx-3 transition-colors ${
                    isCompleted ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowTimeline;
