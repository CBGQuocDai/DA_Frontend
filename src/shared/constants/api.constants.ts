// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'da_access_token',
  REFRESH_TOKEN: 'da_refresh_token',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: '/admin/login',
    CUSTOMER_LOGIN: '/customer/login',
  },

  BOOKS: {
    LIST: '/books',
    DETAIL: (id: string) => `/books/${id}`,
    CREATE: '/books',
    UPDATE: (id: string) => `/books/${id}`,
    DELETE: (id: string) => `/books/${id}`,
    CATEGORIES: '/books/categories',
  },

  CHAPTERS: {
    LIST: (bookId: string | number) => `/books/${bookId}/chapters`,
    CREATE: (bookId: string | number) => `/books/${bookId}/chapters`,
    DELETE: (bookId: string | number, chapterId: string | number) =>
      `/books/${bookId}/chapters/${chapterId}`,
    GENERATE_AUDIO: (bookId: string | number, chapterId: string | number) =>
      `/books/${bookId}/chapters/${chapterId}/audio`,
  },
} as const;
