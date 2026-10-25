// Receiving account for SePay / VietQR bank transfers
export const PAYMENT_BANK_INFO = {
  BANK_NAME: 'Vietcombank (VCB)',
  BANK_CODE: 'Vietcombank',
  ACCOUNT_NUMBER: 'SBSEPAYL39V6TXCOZQD',
  ACCOUNT_HOLDER: 'AudioBook',
} as const;

export const PAYMENT_POLL_INTERVAL_MS = 2500;

/** Fallback QR image when the backend does not return `qrUrl`. */
export const buildVietQrUrl = (amount: number, description: string) =>
  `https://vietqr.app/img?bank=${PAYMENT_BANK_INFO.BANK_CODE}&acc=${PAYMENT_BANK_INFO.ACCOUNT_NUMBER}` +
  `&template=compact&amount=${amount}&des=${encodeURIComponent(description)}`;
