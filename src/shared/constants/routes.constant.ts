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
    LOGIN: '/customer/login',
    /** Login page that sends the user back to `path` afterwards. */
    LOGIN_THEN: (path: string) => `/customer/login?redirect=${encodeURIComponent(path)}`,
    REGISTER: '/customer/register',
    FORGOT_PASSWORD: '/customer/forgot-password',
    STORE: '/customer/store',
    AUTHORS: '/customer/authors',
    PROFILE: '/customer/profile',
    BOOK_DETAIL: (id: number | string) => `/customer/books/${id}`,
  },
} as const;
