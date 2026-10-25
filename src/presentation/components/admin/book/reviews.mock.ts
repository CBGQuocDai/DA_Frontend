// Sample reviews until the backend exposes a reviews endpoint
import type { Book, Review } from '@/src/shared/types';

const SAMPLE_REVIEWS: Record<number, Review[]> = {
  1: [
    {
      id: 101,
      bookId: 1,
      userId: 1,
      userName: 'Nguyễn Văn An',
      rating: 5,
      comment: 'Cuốn sách rất hay và ý nghĩa. Giọng đọc AI truyền cảm, phát âm rõ ràng, nghe rất thư thái.',
      createdAt: '2026-09-28 14:30',
    },
    {
      id: 102,
      bookId: 1,
      userId: 2,
      userName: 'Trần Thị Mai',
      rating: 5,
      comment: 'Nội dung sâu sắc, nhiều bài học nhân sinh quý giá. Đã nghe hết 14 chương.',
      createdAt: '2026-09-29 09:15',
    },
    {
      id: 103,
      bookId: 1,
      userId: 3,
      userName: 'Lê Hoàng Minh',
      rating: 4,
      comment: 'Chất lượng âm thanh rất tốt, tuy nhiên ở một số đoạn nhịp đọc hơi nhanh một chút.',
      createdAt: '2026-10-01 20:00',
    },
  ],
  2: [
    {
      id: 201,
      bookId: 2,
      userId: 4,
      userName: 'Phạm Quỳnh Chi',
      rating: 5,
      comment: 'Tác phẩm kinh điển, bản sách nói này biên soạn rất mượt và dễ tiếp thu.',
      createdAt: '2026-09-25 11:20',
    },
    {
      id: 202,
      bookId: 2,
      userId: 5,
      userName: 'Vũ Đức Thịnh',
      rating: 4,
      comment: 'Giọng đọc nam trầm ấm rất hợp với văn phong triết lý của sách.',
      createdAt: '2026-09-27 16:45',
    },
  ],
  3: [
    {
      id: 301,
      bookId: 3,
      userId: 6,
      userName: 'Đoàn Thu Hà',
      rating: 5,
      comment: 'Rất đáng nghe cho ai muốn rèn luyện tư duy và quyết định trong công việc!',
      createdAt: '2026-09-20 18:30',
    },
  ],
};

/** Sample reviews for the book, or two generated ones matching its average rating. */
export const getSampleReviews = (book: Book): Review[] => {
  if (SAMPLE_REVIEWS[book.id]) return SAMPLE_REVIEWS[book.id];

  // If book has averageRating, generate demo reviews matching the rating
  if (typeof book.averageRating === 'number' && book.averageRating > 0) {
    return [
      {
        id: book.id * 100 + 1,
        bookId: book.id,
        userId: 11,
        userName: 'Hồ Hoàng Khang',
        rating: Math.round(book.averageRating),
        comment: 'Giọng đọc nghe tự nhiên và truyền cảm, nội dung đầy đủ.',
        createdAt: '2026-10-01 10:15',
      },
      {
        id: book.id * 100 + 2,
        bookId: book.id,
        userId: 12,
        userName: 'Bùi Lan Anh',
        rating: 5,
        comment: 'Rất hài lòng với chất lượng sách nói này, mong có thêm nhiều tác phẩm tương tự!',
        createdAt: '2026-09-30 19:40',
      },
    ];
  }

  return [];
};
