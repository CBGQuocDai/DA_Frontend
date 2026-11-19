'use client';

import { useState } from 'react';
import { getApiErrorMessage } from '@/src/shared/utils';
import { showAlert } from '@/src/presentation/components/common';

interface Options<T> {
  /** Gọi API xóa; lỗi ném ra sẽ được hiển thị bằng hộp thoại cảnh báo */
  remove: (item: T) => Promise<void>;
  /** Chạy sau khi xóa thành công, vd: tải lại danh sách */
  onDeleted: (item: T) => void;
  /** Thông báo dùng khi backend không trả về lý do cụ thể */
  errorMessage: string;
}

/** Trạng thái cho luồng "chọn mục → xác nhận → xóa" của các trang quản lý, dùng với ConfirmDeleteModal. */
export const useDeleteConfirm = <T>({ remove, onDeleted, errorMessage }: Options<T>) => {
  const [target, setTarget] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setIsDeleting(true);
    try {
      await remove(target);
      setTarget(null);
      onDeleted(target);
    } catch (error) {
      console.error('Error deleting item:', error);
      // Đóng modal xác nhận trước để hộp thoại lỗi không bị che
      setTarget(null);
      showAlert(getApiErrorMessage(error, errorMessage));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    /** Mục đang chờ xác nhận xóa, null khi modal đóng */
    target,
    isDeleting,
    ask: setTarget,
    cancel: () => setTarget(null),
    confirm,
  };
};
