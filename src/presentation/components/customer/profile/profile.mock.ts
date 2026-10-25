import type { FavoriteBookItem, PurchasedBookItem } from './profile.types';

// Placeholder data: the backend has no favourites / purchase-history endpoints yet

export const MOCK_FAVORITES: FavoriteBookItem[] = [
  {
    id: 35,
    title: 'Đắc nhân tâm',
    author: 'Dale Carnegie',
    category: 'Tâm lý học',
    duration: '02 giờ 45 phút',
    coverImage: 'https://storage.googleapis.com/do_an/books/35/cover/cover.jpg',
  },
];

export const MOCK_PURCHASED: PurchasedBookItem[] = [
  {
    id: 35,
    orderCode: 'ORD2026102401',
    title: 'Đắc nhân tâm',
    author: 'Dale Carnegie',
    purchaseDate: '24/10/2026',
    totalChapters: 12,
    coverImage: 'https://storage.googleapis.com/do_an/books/35/cover/cover.jpg',
  },
  {
    id: 36,
    orderCode: 'ORD2026102008',
    title: 'Nghĩ giàu & Làm giàu',
    author: 'Napoleon Hill',
    purchaseDate: '20/10/2026',
    totalChapters: 15,
    coverImage: 'https://storage.googleapis.com/do_an/books/36/cover/cover.jpg',
  },
];
