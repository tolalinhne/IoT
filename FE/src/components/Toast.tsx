import React from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className="pointer-events-auto bg-white shadow-xl rounded-2xl p-3.5 flex items-center justify-between gap-3 border-l-4 border-[#a33563] animate-in slide-in-from-bottom-5 fade-in duration-200 border border-[#efdee4]/80"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#fbe9f0] flex items-center justify-center text-[#a33563] shrink-0">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <p className="text-[13px] font-semibold text-[#22191d]">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#887177] hover:text-[#22191d] p-1 transition-colors cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
