interface ApiError {
  response?: { status?: number; data?: { code?: number; message?: string } };
  message?: string;
}

export const getApiErrorMessage = (error: unknown, fallback: string) =>
  (error as ApiError)?.response?.data?.message || fallback;

export const getApiErrorStatus = (error: unknown) => (error as ApiError)?.response?.status;

export const getApiErrorCode = (error: unknown) => (error as ApiError)?.response?.data?.code;

export const isNetworkError = (error: unknown) =>
  !(error as ApiError)?.response && Boolean((error as ApiError)?.message?.includes('Network Error'));
