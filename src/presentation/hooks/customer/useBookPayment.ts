'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentService } from '@/src/infrastructure/api/services';
import { PAYMENT_POLL_INTERVAL_MS, ROUTES } from '@/src/shared/constants';
import type { Payment } from '@/src/shared/types';
import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorStatus,
  isPaymentPaid,
} from '@/src/shared/utils';
import { useAsyncData } from '../common';

const UNAUTHORIZED_CODE = 4010;

/** Ownership check plus the SePay/VietQR flow: create (or reuse) a payment, then poll until it is paid. */
export const useBookPayment = (bookId: number, isAuthenticated: boolean) => {
  const router = useRouter();

  const loadOwnership = useCallback(
    () =>
      isAuthenticated
        ? paymentService.hasPurchased(bookId).catch(() => false)
        : Promise.resolve(false),
    [bookId, isAuthenticated]
  );
  const { data: ownedOnServer } = useAsyncData(loadOwnership);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaid = isPaymentPaid(payment);
  const isPurchased = Boolean(ownedOnServer) || isPaid;

  const redirectToLogin = useCallback(() => {
    router.push(ROUTES.CUSTOMER.LOGIN_THEN(ROUTES.CUSTOMER.BOOK_DETAIL(bookId)));
  }, [bookId, router]);

  const openPayment = useCallback(async () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    setError(null);
    setIsModalOpen(true);
    setIsCreating(true);
    try {
      setPayment(await paymentService.createPayment(bookId));
    } catch (err) {
      if (getApiErrorStatus(err) === 401 || getApiErrorCode(err) === UNAUTHORIZED_CODE) {
        setIsModalOpen(false);
        redirectToLogin();
      } else {
        setError(getApiErrorMessage(err, 'Không thể tải thông tin thanh toán'));
      }
    } finally {
      setIsCreating(false);
    }
  }, [bookId, isAuthenticated, redirectToLogin]);

  const closePayment = useCallback(() => setIsModalOpen(false), []);

  const paymentId = payment?.id;
  useEffect(() => {
    if (!isModalOpen || isPaid || paymentId == null) return;

    const timer = setInterval(async () => {
      try {
        const latest = await paymentService.getPayment(paymentId);
        if (isPaymentPaid(latest)) setPayment(latest);
      } catch {
        // Keep polling on the next tick
      }
    }, PAYMENT_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isModalOpen, isPaid, paymentId]);

  return {
    isPurchased,
    isModalOpen,
    payment,
    isPaid,
    isCreating,
    error,
    openPayment,
    closePayment,
  };
};
