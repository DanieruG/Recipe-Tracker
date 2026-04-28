import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-300/90" />

      {/* Content — sits above backdrop, has its own solid bg */}
      <div className="relative flex items-center justify-center h-full p-4">
        <div
          className="w-full max-w-3xl mx-0 sm:mx-4 max-h-[90vh] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-sm text-zinc-500 hover:text-zinc-900"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="p-5 max-h-[calc(90vh-73px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
