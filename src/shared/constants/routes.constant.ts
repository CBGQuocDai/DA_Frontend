// Routes
export const ROUTES = {
  ADMIN: {
    LOGIN: '/admin/login',
    MANAGE_BOOK: '/admin/manage-book',
    BOOK_DETAIL: (id: number | string) => `/admin/books/${id}`,
    MANAGE_VOICE: '/admin/manage-voice',
    STATISTICS: '/admin/statistics',
  },
  CUSTOMER: {
    HOME: '/customer',
    LIBRARY: '/customer/library',
    HISTORY: '/customer/history',
    BOOK_DETAIL: (id: number) => `/customer/book/${id}`,
  },
} as const;
