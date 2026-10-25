// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'da_access_token',
  REFRESH_TOKEN: 'da_refresh_token',
  USER: 'da_user',
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: '/admin/login',
    CUSTOMER_LOGIN: '/customer/login',
    CUSTOMER_REGISTER: '/customer/register',
    CUSTOMER_PROFILE: '/customer/profile',
    CHANGE_PASSWORD: '/customer/profile/change-password',
  },

  BOOKS: {
    LIST: '/books',
    DETAIL: (id: string | number) => `/books/${id}`,
    CREATE: '/books',
    UPDATE: (id: string | number) => `/books/${id}`,
    DELETE: (id: string | number) => `/books/${id}`,
    PUBLISH: (id: string | number) => `/books/${id}/publish`,
    UNPUBLISH: (id: string | number) => `/books/${id}/unpublish`,
    BY_CATEGORY: (categoryId: string | number) => `/books/category/${categoryId}`,
  },

  CATEGORIES: '/categories',
  AUTHORS: '/authors',

  VOICES: {
    LIST: '/voice',
    DETAIL: (voiceId: string | number) => `/voice/${voiceId}`,
  },

  CHAPTERS: {
    LIST: (bookId: string | number) => `/books/${bookId}/chapters`,
    CREATE: (bookId: string | number) => `/books/${bookId}/chapters`,
    UPDATE: (bookId: string | number, chapterId: string | number) =>
      `/books/${bookId}/chapters/${chapterId}`,
    DELETE: (bookId: string | number, chapterId: string | number) =>
      `/books/${bookId}/chapters/${chapterId}`,
    GENERATE_AUDIO: (bookId: string | number, chapterId: string | number) =>
      `/books/${bookId}/chapters/${chapterId}/audio`,
  },

  PAYMENTS: {
    CREATE: '/payments',
    DETAIL: (paymentId: string | number) => `/payments/${paymentId}`,
    CHECK: (bookId: string | number) => `/payments/check/${bookId}`,
  },
} as const;
