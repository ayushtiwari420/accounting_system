import React from "react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-3 sm:p-4 text-center">
        <div
          className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-xs"
          onClick={onClose}
        ></div>

        <div
          className={`inline-block w-full ${maxWidth} p-4 sm:p-6 my-auto overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl z-10 max-h-[90vh] flex flex-col`}
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 focus:outline-none p-2 rounded-xl hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              title="Close modal"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          <div className="mt-3.5 overflow-y-auto custom-scrollbar flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
