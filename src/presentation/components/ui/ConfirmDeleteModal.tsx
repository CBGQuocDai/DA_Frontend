"use client";

import React, { useEffect } from "react";
import { Button } from "./Button";
import { Trash2, X } from "lucide-react";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  description,
  itemName,
  confirmText = "Xóa",
  cancelText = "Hủy",
  isLoading = false,
}) => {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6 transform transition-all animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary hover:bg-bg rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Texts */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h3 className="text-lg font-bold text-text-primary tracking-tight">
                {title}
              </h3>
              <div className="mt-2 text-sm text-text-secondary leading-relaxed">
                {description ? (
                  description
                ) : itemName ? (
                  <p>
                    Bạn có chắc chắn muốn xóa{" "}
                    <span className="font-semibold text-text-primary">
                      "{itemName}"
                    </span>
                    ? Hành động này không thể hoàn tác.
                  </p>
                ) : (
                  <p>
                    Bạn có chắc chắn muốn xóa mục này? Hành động này không thể
                    hoàn tác.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4 h-10 cursor-pointer"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onConfirm}
              disabled={isLoading}
              className="rounded-xl px-5 h-10 shadow-sm hover:shadow cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isLoading ? "Đang xóa..." : confirmText}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
