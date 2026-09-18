// Listening History Types
export interface ListeningHistory {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  progress: number; // percentage 0-100
  lastPosition: number; // in seconds
  completed: boolean;
  lastListenedAt: string;
  createdAt: string;
}

export interface CreateListeningHistoryRequest {
  bookId: string;
  chapterId: string;
  progress: number;
  lastPosition: number;
  completed?: boolean;
}

export interface BookMark {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  position: number; // in seconds
  note?: string;
  createdAt: string;
}

export interface CreateBookmarkRequest {
  bookId: string;
  chapterId: string;
  position: number;
  note?: string;
}
