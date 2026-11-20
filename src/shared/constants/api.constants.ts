// Khóa lưu trữ trong localStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "da_access_token",
  REFRESH_TOKEN: "da_refresh_token",
  USER: "da_user",
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api";

type Id = string | number;

/**
 * Đường dẫn API, mỗi nhóm ứng với một controller phía backend
 * (DA_Backend: com.backend.presentation.controller).
 */
export const API_ENDPOINTS = {
  // AdminController
  ADMIN: {
    LOGIN: "/admin/login",
    STATISTICS: "/admin/statistics",
    PURCHASE_TREND: "/admin/statistics/purchases",
    // Stream SSE báo trạng thái OCR của sách và trạng thái gen audio của chương
    EVENTS: "/admin/events",
  },

  // AuthController: dùng chung cho mọi loại tài khoản
  AUTH: {
    LOGOUT: "/auth/logout",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // CustomerController
  CUSTOMER: {
    LOGIN: "/customer/login",
    REGISTER: "/customer/register",
    PROFILE: "/customer/profile",
    CHANGE_PASSWORD: "/customer/profile/change-password",
    BOOK_OWNERSHIP: (bookId: Id) => `/customer/books/${bookId}/check`,
    // GET: tiến trình nghe của cả cuốn sách
    LISTENING_PROGRESS: (bookId: Id) => `/customer/books/${bookId}/progress`,
    // PUT: lưu vị trí đang nghe của một chương
    SAVE_LISTENING_PROGRESS: (bookId: Id, chapterId: Id) =>
      `/customer/books/${bookId}/chapters/${chapterId}/progress`,
  },

  // BookController
  BOOKS: {
    ROOT: "/books",
    DETAIL: (bookId: Id) => `/books/${bookId}`,
    PUBLISH: (bookId: Id) => `/books/${bookId}/publish`,
    UNPUBLISH: (bookId: Id) => `/books/${bookId}/unpublish`,
    BESTSELLERS: "/books/bestsellers",
    // Các endpoint công khai cho khách hàng
    CATALOG: "/books/catalog",
    OVERVIEW: (bookId: Id) => `/books/${bookId}/overview`,
    CHAPTER_LIST: (bookId: Id) => `/books/${bookId}/chapters/list`,
    // Sách liên quan do backend chọn theo tác giả và thể loại
    RECOMMENDATIONS: (bookId: Id) => `/books/${bookId}/recommendations`,
  },

  // ChapterController (chỉ admin)
  CHAPTERS: {
    ROOT: (bookId: Id) => `/books/${bookId}/chapters`,
    DETAIL: (bookId: Id, chapterId: Id) =>
      `/books/${bookId}/chapters/${chapterId}`,
    // POST: gộp các chương liền nhau vào chương đứng đầu
    MERGE: (bookId: Id) => `/books/${bookId}/chapters/merge`,
    // POST: tạo audio bằng AI, PUT: gán file audio đã upload
    AUDIO: (bookId: Id, chapterId: Id) =>
      `/books/${bookId}/chapters/${chapterId}/audio`,
    // GET (admin và người nghe): file PDF ảnh và bảng của chương; người chưa mua chỉ mở được chương miễn phí
    ATTACHMENTS: (bookId: Id, chapterId: Id) =>
      `/books/${bookId}/chapters/${chapterId}/attachments`,
  },

  // CategoryController
  CATEGORIES: {
    ROOT: "/categories",
    SEARCH: "/categories/search",
    DETAIL: (categoryId: Id) => `/categories/${categoryId}`,
    BESTSELLERS: "/categories/bestsellers",
  },

  // AuthorController
  AUTHORS: {
    ROOT: "/authors",
    SEARCH: "/authors/search",
    DETAIL: (authorId: Id) => `/authors/${authorId}`,
  },

  // VoiceController
  VOICES: {
    ROOT: "/voice",
    DETAIL: (voiceId: Id) => `/voice/${voiceId}`,
  },

  // UploadController
  UPLOADS: {
    SIGN_URL: "/uploads/sign-url",
  },

  // PaymentController
  PAYMENTS: {
    ROOT: "/payments",
    DETAIL: (paymentId: Id) => `/payments/${paymentId}`,
  },

  CUSTOMER_BOOKS: {
    LIST: "/books/catalog",
    RECOMMENDATIONS: "/books/recommendations",
    OVERVIEW: (bookId: string | number) => `/books/${bookId}/overview`,
    CHAPTERS: (bookId: string | number) => `/books/${bookId}/chapters/list`,
    RELATED: (bookId: string | number) => `/books/${bookId}/recommendations`,
    PROGRESS: (bookId: number) => `/customer/books/${bookId}/progress`,
    SAVE_PROGRESS: (bookId: number, chapterId: number) =>
      `/customer/books/${bookId}/chapters/${chapterId}/progress`,
    CHECK_OWNERSHIP: (bookId: string | number) =>
      `/customer/books/${bookId}/check`,
  },

  BOOK_FAVORITES: {
    CHECK: (bookId: Id) => `/book-favorite/${bookId}/check`,
    TOGGLE: (bookId: Id) => `/book-favorite/${bookId}/toggle`,
  },

  // ReviewController
  REVIEWS: {
    ROOT: "/reviews",
    PAGE: (bookId: Id) => `/reviews/${bookId}/page`,
    SUMMARY: (bookId: Id) => `/reviews/${bookId}/summary`,
    MINE: (bookId: Id) => `/reviews/${bookId}/me`,
  },
} as const;
