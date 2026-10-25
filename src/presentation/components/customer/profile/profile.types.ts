export type ProfileTab = 'profile' | 'favorites' | 'purchased' | 'password';

export interface FavoriteBookItem {
  id: number;
  title: string;
  author: string;
  category: string;
  coverImage?: string;
  duration: string;
}

export interface PurchasedBookItem {
  id: number;
  orderCode: string;
  title: string;
  author: string;
  coverImage?: string;
  purchaseDate: string;
  totalChapters: number;
}
