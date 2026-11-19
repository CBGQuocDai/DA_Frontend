interface BookDetailError {
  code?: string;
  response?: { status?: number; data?: { code?: number } };
}

/** Missing books and temporary load failures need different recovery actions. */
export const getBookDetailError = (error: unknown) => {
  const failure = error as BookDetailError | null | undefined;
  const status = failure?.response?.status;
  const isNotFound = status === 404 || (status === 400 && failure?.response?.data?.code === 4006);
  const isTimeout = failure?.code === 'ECONNABORTED' || failure?.code === 'ETIMEDOUT';
  return {
    isNotFound,
    message: isTimeout
      ? 'Tải thông tin sách mất quá lâu. Vui lòng thử lại.'
      : 'Không thể tải thông tin sách. Vui lòng kiểm tra kết nối và thử lại.',
  };
};
