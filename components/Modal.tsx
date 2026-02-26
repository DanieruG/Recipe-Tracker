import React, { useState } from "react";

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
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-300/90" />

      {/* Content — sits above backdrop, has its own solid bg */}
      <div className="relative flex items-center justify-center h-full">
        {children}
      </div>
    </div>
  );
};
