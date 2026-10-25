import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/src/presentation/components/ui';
import { ROUTES } from '@/src/shared/constants';

export const BookNotFound: React.FC<{ bookId: number }> = ({ bookId }) => (
  <div className="space-y-6">
    <Link
      href={ROUTES.ADMIN.MANAGE_BOOK}
      className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Quay lại danh sách
    </Link>
    <div className="bg-surface rounded-2xl border border-border p-12 text-center">
      <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
        <BookOpen className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary">Không tìm thấy thông tin sách</h3>
      <p className="text-sm text-text-secondary mt-1 mb-4">
        Sách có thể đã bị xóa hoặc không tồn tại với ID: {bookId}.
      </p>
      <Button onClick={() => (window.location.href = ROUTES.ADMIN.MANAGE_BOOK)}>
        Về danh sách sách
      </Button>
    </div>
  </div>
);
