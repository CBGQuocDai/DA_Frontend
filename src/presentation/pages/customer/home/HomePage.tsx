'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '@/src/presentation/layouts';
import { bookService } from '@/src/infrastructure/api/services';
import type { Book, Category } from '@/src/shared/types';
import { ROUTES } from '@/src/shared/constants';

export const CustomerHomePage = () => {
  const [featuredBook, setFeaturedBook] = useState<Book | null>(null);
  const [newestBooks, setNewestBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, categoriesData] = await Promise.all([
          bookService.getBooks({ page: 0, size: 10 }),
          bookService.getCategories(),
        ]);

        if (booksData.content.length > 0) {
          setFeaturedBook(booksData.content[0]);
          setNewestBooks(booksData.content.slice(1, 7));
        }
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}p`;
    }
    return `${minutes} phút`;
  };

  return (
    <CustomerLayout>
      {/* Hero Section */}
      {featuredBook && (
        <section className="bg-surface border-b border-border">
          <div className="container py-12">
            <div className="flex gap-8 items-center">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                <div className="w-48 h-72 bg-bg border border-border rounded-xl overflow-hidden shadow-lg">
                  {featuredBook.coverImage ? (
                    <img
                      src={featuredBook.coverImage}
                      alt={featuredBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Book Info */}
              <div className="flex-1">
                <span className="badge badge-primary mb-3">Nổi bật</span>
                <h1 className="text-3xl font-bold text-text-primary mb-3">
                  {featuredBook.title}
                </h1>
                <p className="text-text-secondary mb-4 line-clamp-3 max-w-2xl">
                  {featuredBook.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-6 text-sm text-text-secondary mb-6">
                  {featuredBook.voice && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      {featuredBook.voice.name}
                    </span>
                  )}
                  {featuredBook.price !== undefined && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {featuredBook.price > 0 ? `${featuredBook.price.toLocaleString()}đ` : 'Miễn phí'}
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={ROUTES.CUSTOMER.BOOK_DETAIL(featuredBook.id)}
                    className="btn btn-primary btn-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Nghe ngay
                  </Link>
                  <button className="btn btn-secondary btn-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm vào thư viện
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-10 border-b border-border">
          <div className="container">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Danh mục</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/customer/category/${category.id}`}
                  className="flex flex-col items-center p-4 bg-surface rounded-xl border border-border hover:border-accent hover:shadow-md transition-all text-center"
                >
                  <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm text-text-primary font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newest Books Section */}
      {newestBooks.length > 0 && (
        <section className="py-10 border-b border-border">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Sách mới nhất</h2>
              <Link href="/customer/books" className="text-sm text-accent hover:underline">
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {newestBooks.map((book) => (
                <Link
                  key={book.id}
                  href={ROUTES.CUSTOMER.BOOK_DETAIL(book.id)}
                  className="group"
                >
                  <div className="aspect-[3/4] bg-bg border border-border rounded-lg overflow-hidden mb-3">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                    {book.title}
                  </h3>
                  {book.voice && (
                    <p className="text-xs text-text-muted mt-1">{book.voice.name}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="container py-20">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-text-secondary">Đang tải...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && newestBooks.length === 0 && (
        <div className="container py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">Chưa có sách nào</h3>
            <p className="text-text-secondary">Hãy quay lại sau để khám phá những cuốn sách thú vị.</p>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CustomerHomePage;
