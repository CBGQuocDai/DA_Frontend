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
    ADMIN_CHANGE_PASSWORD: '/admin/change-password',
  },

  STATISTICS: {
    OVERVIEW: '/admin/statistics',
    PURCHASES: '/admin/statistics/purchases',
  },

  BOOKS: {
    LIST: '/books',
    DETAIL: (id: string | number) => `/books/${id}`,
    CREATE: '/books',
    UPDATE: (id: string | number) => `/books/${id}`,
    DELETE: (id: string | number) => `/books/${id}`,
    PUBLISH: (id: string | number) => `/books/${id}/publish`,
    UNPUBLISH: (id: string | number) => `/books/${id}/unpublish`,
    BESTSELLERS: '/books/bestsellers',
  },

  CATEGORIES: {
    LIST: '/categories',
    SEARCH: '/categories/search',
    DETAIL: (id: string | number) => `/categories/${id}`,
    BESTSELLERS: '/categories/bestsellers',
  },

  AUTHORS: {
    LIST: '/authors',
    PAGE: '/authors/page',
    SEARCH: '/authors/search',
    DETAIL: (id: string | number) => `/authors/${id}`,
  },

  VOICES: {
    LIST: '/voice',
    DETAIL: (voiceId: string | number) => `/voice/${voiceId}`,
  },

  UPLOADS: {
    SIGN_URL: '/uploads/sign-url',
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
  },

  CUSTOMER_BOOKS: {
    LIST: '/books/catalog',
    OVERVIEW: (bookId: string | number) => `/books/${bookId}/overview`,
    CHAPTERS: (bookId: string | number) => `/books/${bookId}/chapters/page`,
    CHECK_OWNERSHIP: (bookId: string | number) => `/customer/books/${bookId}/check`,
  },
  
  BOOK_FAVORITES: {
    CHECK: (bookId: string | number) => `/book-favorite/${bookId}/check`,
    TOGGLE: (bookId: string | number) => `/book-favorite/${bookId}/toggle`,
  },

  REVIEWS: {
    CREATE: '/review',
    PAGE: (bookId: number) => `/review/${bookId}/page`,
    SUMMARY: (bookId: number) => `/review/${bookId}/summary`,
    MINE: (bookId: number) => `/review/${bookId}/me`,
  },
} as const;
