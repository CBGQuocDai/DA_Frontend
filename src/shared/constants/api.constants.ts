// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'da_access_token',
  REFRESH_TOKEN: 'da_refresh_token',
  USER: 'da_user',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/auth/admin/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
  },

  // Users
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  // Books
  BOOKS: {
    LIST: '/books',
    DETAIL: (id: string) => `/books/${id}`,
    CREATE: '/books',
    UPDATE: (id: string) => `/books/${id}`,
    DELETE: (id: string) => `/books/${id}`,
    SEARCH: '/books/search',
    FEATURED: '/books/featured',
    NEWEST: '/books/newest',
    CATEGORIES: '/books/categories',
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  // Reviews
  REVIEWS: {
    LIST: (bookId: string) => `/books/${bookId}/reviews`,
    CREATE: (bookId: string) => `/books/${bookId}/reviews`,
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
  },

  // Purchases
  PURCHASES: {
    LIST: '/purchases',
    CREATE: '/purchases',
    CHECK: (bookId: string) => `/purchases/check/${bookId}`,
  },

  // Listening History
  LISTENING_HISTORY: {
    LIST: '/listening-history',
    UPSERT: '/listening-history',
    BOOK: (bookId: string) => `/listening-history/book/${bookId}`,
  },

  // Bookmarks
  BOOKMARKS: {
    LIST: '/bookmarks',
    CREATE: '/bookmarks',
    UPDATE: (id: string) => `/bookmarks/${id}`,
    DELETE: (id: string) => `/bookmarks/${id}`,
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    TOP_BOOKS: '/dashboard/top-books',
    RECENT_REVIEWS: '/dashboard/recent-reviews',
  },

  // Narrators
  NARRATORS: {
    LIST: '/narrators',
    DETAIL: (id: string) => `/narrators/${id}`,
  },
} as const;
