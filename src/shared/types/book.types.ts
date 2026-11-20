// Kiểu dữ liệu sách, chương, giọng đọc, tác giả, thể loại (khớp các *Response phía backend)

export interface StoredFile {
  /** Đường dẫn lưu trữ: gửi lại trong request cập nhật để giữ nguyên file này */
  path: string;
  /** URL đã ký để đọc file */
  url: string;
}

export interface Book {
  id: number;
  title: string;
  description?: string;
  coverImage?: StoredFile;
  contentFile?: StoredFile;
  price?: number;
  voice?: Voice;
  status: BookStatus;
  categories?: BookCategory[];
  authors?: BookAuthor[];
  /** Chỉ có trong response chi tiết sách */
  chapters?: Chapter[];
  averageRating?: number;
  ratingCount?: number;
  /** Chỉ có ở danh sách bán chạy: lượt mua trong kỳ đã chọn, tính cả sách miễn phí */
  purchases?: number;
  /** Chỉ có ở danh sách bán chạy: lượt mua của kỳ liền trước; không có khi xem toàn thời gian */
  previousPurchases?: number | null;
}

export interface Chapter {
  id: number;
  title: string;
  chapterOrder: number;
  duration?: number;
  audioUrl?: string;
  /** Tài liệu của trình soạn thảo (JSON), ảnh đã gắn URL ký; rỗng khi chương chưa có nội dung. Chỉ có phía admin */
  content?: string | null;
  status?: ChapterStatus;
  /** Tốc độ đọc của lần tạo audio gần nhất; null với chương tạo trước khi có trường này */
  readingSpeed?: number | null;
}

export interface Voice {
  id: number;
  name: string;
  exampleAudio?: StoredFile;
  /** Lời thoại của file giọng mẫu, có thể trống */
  exampleTranscript?: string | null;
  description?: string;
}

/** Dòng liên kết sách – thể loại (BookCategoryResponse) */
export interface BookCategory {
  id: number;
  category: Category;
}

/** Dòng liên kết sách – tác giả (BookAuthorResponse) */
export interface BookAuthor {
  id: number;
  author: Author;
}

export interface Author {
  id: number;
  fullName?: string;
  avatar?: StoredFile | null;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  /** Chỉ có ở danh sách bán chạy: lượt mua sách thuộc thể loại trong kỳ đã chọn */
  purchases?: number;
  /** Chỉ có ở danh sách bán chạy: lượt mua của kỳ liền trước; không có khi xem toàn thời gian */
  previousPurchases?: number | null;
}

export type BookStatus = 'PROCESSING' | 'UNPUBLISHED' | 'PUBLISHED' | 'FAILED';
export type ChapterStatus = 'FAILED' | 'PROCESSING_AUDIO' | 'AUDIO_READY';

/** Query của GET /books; backend bắt buộc có `page` và `size`. */
export interface GetBooksParams {
  /** Bắt đầu từ 0 */
  page: number;
  size: number;
  bookName?: string;
  categoryId?: number;
  authorId?: number;
  status?: BookStatus;
}

/**
 * Body dùng chung cho tạo (POST) và cập nhật (PUT, thay thế toàn bộ) — BookRequest phía backend.
 * File được upload trước qua uploadService và gửi lên dưới dạng đường dẫn lưu trữ; cả hai file
 * đều bắt buộc, khi cập nhật muốn giữ file cũ thì gửi lại đường dẫn hiện tại.
 */
export interface BookPayload {
  title: string;
  description: string;
  price: number;
  voiceId: number;
  categoryIds: number[];
  authorIds: number[];
  contentFile?: string;
  coverImage?: string;
}

/** Body của POST /books/{bookId}/chapters (ChapterCreateRequest). */
export interface ChapterCreatePayload {
  title: string;
  chapterOrder: number;
}

/** Cập nhật một phần (PATCH): chỉ những trường được gửi mới thay đổi. */
export interface ChapterUpdatePayload {
  title?: string;
  /** Tài liệu của trình soạn thảo (JSON); backend lấy văn bản cho TTS từ đây */
  content?: string;
  /** Vị trí mới; backend dời các chương nằm giữa để thứ tự không trùng nhau */
  chapterOrder?: number;
}

/** Body của PUT .../audio (ChapterUploadAudioRequest). */
export interface ChapterAudioPayload {
  /** Đường dẫn tạm do uploadService trả về (loại AUDIO) */
  audioPath: string;
  /** Thời lượng tính bằng giây, tối thiểu 1 */
  duration: number;
}

/**
 * Body dùng chung cho tạo (POST) và cập nhật (PUT, thay thế toàn bộ) — VoiceRequest phía backend.
 * `exampleAudio` luôn bắt buộc: đường dẫn do uploadService trả về, hoặc đường dẫn hiện tại
 * khi cập nhật mà giữ file mẫu cũ.
 */
export interface VoicePayload {
  name: string;
  description: string;
  exampleAudio?: string;
  /** Tùy chọn: lời thoại khớp đúng nội dung file giọng mẫu */
  exampleTranscript?: string;
}

/**
 * Body dùng chung cho tạo (POST) và cập nhật (PUT, thay thế toàn bộ) — AuthorRequest phía backend.
 * Cả ba trường đều bắt buộc. `avatar` là đường dẫn do uploadService trả về khi đổi ảnh,
 * hoặc đường dẫn hiện tại khi giữ ảnh cũ.
 */
export interface AuthorPayload {
  fullName: string;
  bio: string;
  avatar: string;
}

/** Body dùng chung cho tạo (POST) và cập nhật (PUT, thay thế toàn bộ) — CategoryRequest phía backend. */
export interface CategoryPayload {
  name: string;
  description?: string;
}
