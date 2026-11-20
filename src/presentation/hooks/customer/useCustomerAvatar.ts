'use client';

import { useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/src/shared/utils';
import { CustomerAccountError } from '@/src/domain/customer/account';
import { customerAccount } from '@/src/composition/customerAccount';

export const useCustomerAvatar = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const uploadAvatar = async (file: File) => {
    if (controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsUploading(true);
    setMessage(null);
    try {
      await customerAccount.updateAvatar(file, controller.signal);
      setMessage({ type: 'success', text: 'Đã cập nhật ảnh đại diện.' });
    } catch (error) {
      if (!controller.signal.aborted) {
        setMessage({ type: 'error', text: error instanceof CustomerAccountError
          ? error.message
          : getApiErrorMessage(error, 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại.') });
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setIsUploading(false);
      }
    }
  };

  return { uploadAvatar, isUploading, message };
};
