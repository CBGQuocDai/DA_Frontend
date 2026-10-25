import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import {
  Book,
  BookDetail,
  CreateBookRequest,
  UpdateBookRequest,
  SearchParams,
  PaginatedResponse,
  Category,
} from '@/src/shared/types';

const mapBackendBookPage = (raw: any, sizeValue: number): PaginatedResponse<Book> => {
  const rawList: any[] = Array.isArray(raw?.content)
    ? raw.content
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  const mappedBooks: Book[] = rawList.map((item: any) => {
    const authorName =
      item.authors?.[0]?.author?.fullName ||
      item.author ||
      'Nhiều tác giả';
    const categoryObj = item.categories?.[0]?.category || item.category || {
      id: '1',
      name: 'Sách nói',
      slug: 'sach-noi',
    };

    return {
      id: String(item.id),
      title: item.title || '',
      description: item.description || '',
      coverImage: item.coverImage || '',
      author: authorName,
      narrator: item.voice?.name || item.narrator || 'Giọng đọc AI',
      duration: item.duration || 0,
      audioUrl: item.voice?.exampleAudio || item.contentFile || item.audioUrl || '',
      category: {
        id: String(categoryObj.id || ''),
        name: categoryObj.name || 'Sách nói',
        slug: categoryObj.slug || '',
      },
      tags: item.tags || [],
      price: Number(item.price) || 0,
      rating: Number(item.averageRating || item.rating) || 5.0,
      totalListens: Number(item.totalListens) || 0,
      status: item.status || 'PUBLISHED',
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      voice: item.voice,
      categories: item.categories,
      authors: item.authors,
    } as Book;
  });

  const totalCount = raw?.total ?? mappedBooks.length;
  const totalPages =
    raw?.totalPage ??
    raw?.totalPages ??
    (totalCount > 0 ? Math.ceil(totalCount / sizeValue) : 0);

  return {
    data: mappedBooks,
    total: totalCount,
    page: (raw?.page ?? 0) + 1,
    pageSize: raw?.pageSize ?? sizeValue,
    totalPages: totalPages,
  };
};

export const bookService = {
  /**
   * Get paginated list of books
   */
  getBooks: async (params?: SearchParams): Promise<PaginatedResponse<Book>> => {
    const pageIndex =
      typeof params?.page === 'number' ? Math.max(0, params.page - 1) : 0;
    const sizeValue = params?.pageSize || (params as any)?.size || 10;

    const response = await apiClient.get<any>(API_ENDPOINTS.BOOKS.LIST, {
      params: {
        ...params,
        page: pageIndex,
        size: sizeValue,
      },
    });

    return mapBackendBookPage(response.data, sizeValue);
  },

  /**
   * Get single book detail
   */
  getBookById: async (id: string | number): Promise<BookDetail> => {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.BOOKS.DETAIL(String(id))
    );
    const raw = response.data?.data || response.data;

    const authorName =
      raw?.authors?.[0]?.author?.fullName ||
      raw?.author ||
      'Nhiều tác giả';
    const categoryName =
      raw?.categories?.[0]?.category?.name ||
      raw?.category?.name ||
      'Sách nói';
    const categoryId =
      raw?.categories?.[0]?.category?.id ||
      raw?.category?.id ||
      '';

    const bookPrice =
      raw?.price !== undefined && raw?.price !== null
        ? Number(raw.price)
        : 0;

    return {
      id: String(raw?.id || id),
      title: raw?.title || '',
      description: raw?.description || '',
      coverImage: raw?.coverImage || '',
      author: authorName,
      narrator: raw?.voice?.name || raw?.narrator || 'Giọng đọc AI',
      duration: Number(raw?.duration) || 0,
      audioUrl: raw?.voice?.exampleAudio || raw?.contentFile || raw?.audioUrl || '',
      category: {
        id: String(categoryId),
        name: categoryName,
        slug: '',
      },
      tags: raw?.tags || [],
      price: bookPrice,
      rating: Number(raw?.averageRating || raw?.rating) || 5.0,
      totalListens: Number(raw?.totalListens) || 0,
      status: raw?.status || 'PUBLISHED',
      publishedAt: raw?.publishedAt,
      createdAt: raw?.createdAt || '',
      updatedAt: raw?.updatedAt || '',
      chapters: raw?.chapters || [],
      reviews: raw?.reviews || [],
      voice: raw?.voice,
      categories: raw?.categories,
      authors: raw?.authors,
    } as BookDetail;
  },

  /**
   * Get chapters of a book
   */
  getChapters: async (bookId: string | number): Promise<any[]> => {
    const response = await apiClient.get<any>(
      `/books/${bookId}/chapters`
    );
    const raw = response.data;
    const list: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];

    return list.map((ch: any) => ({
      id: String(ch.id),
      bookId: String(bookId),
      title: ch.title || '',
      orderIndex: ch.chapterOrder || 1,
      duration: ch.duration || 1200,
      audioUrl: ch.audioUrl || '',
      status: ch.status,
      rawText: ch.rawText,
      createdAt: ch.createdAt || '',
    }));
  },

  /**
   * Search books
   */
  searchBooks: async (
    params: SearchParams
  ): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<PaginatedResponse<Book>>(
      API_ENDPOINTS.BOOKS.SEARCH,
      { params }
    );
    return response.data;
  },

  /**
   * Get featured books
   */
  getFeaturedBooks: async (limit = 10): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>(
      API_ENDPOINTS.BOOKS.FEATURED,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get newest books
   */
  getNewestBooks: async (limit = 10): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>(
      API_ENDPOINTS.BOOKS.NEWEST,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get books by category
   */
  getBooksByCategory: async (
    categoryId: string | number,
    params?: SearchParams
  ): Promise<PaginatedResponse<Book>> => {
    const pageIndex =
      typeof params?.page === 'number' ? Math.max(0, params.page - 1) : 0;
    const sizeValue = params?.pageSize || (params as any)?.size || 10;

    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.BOOKS.LIST}/category/${categoryId}`,
      {
        params: {
          ...params,
          page: pageIndex,
          size: sizeValue,
        },
      }
    );

    return mapBackendBookPage(response.data, sizeValue);
  },

  // ===== Admin Methods =====

  /**
   * Create new book (Admin)
   */
  createBook: async (data: CreateBookRequest): Promise<Book> => {
    const response = await apiClient.post<Book>(
      API_ENDPOINTS.BOOKS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update book (Admin)
   */
  updateBook: async (data: UpdateBookRequest): Promise<Book> => {
    const response = await apiClient.put<Book>(
      API_ENDPOINTS.BOOKS.UPDATE(data.id),
      data
    );
    return response.data;
  },

  /**
   * Delete book (Admin)
   */
  deleteBook: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BOOKS.DELETE(id));
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.CATEGORIES.LIST
    );
    const raw = response.data;
    const list: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];

    return list.map((c: any) => ({
      id: String(c.id),
      name: c.name || '',
      slug: c.slug || `category-${c.id}`,
      description: c.description,
      icon: c.icon,
    }));
  },

  /**
   * Create category (Admin)
   */
  createCategory: async (data: {
    name: string;
    slug?: string;
    icon?: string;
  }): Promise<Category> => {
    const response = await apiClient.post<Category>(
      API_ENDPOINTS.CATEGORIES.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update category (Admin)
   */
  updateCategory: async (
    id: string,
    data: { name?: string; slug?: string; icon?: string }
  ): Promise<Category> => {
    const response = await apiClient.put<Category>(
      API_ENDPOINTS.CATEGORIES.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Delete category (Admin)
   */
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  },
};

export default bookService;
