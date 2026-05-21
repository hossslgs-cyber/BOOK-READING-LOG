export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages?: number;
  pagesRead: number;
  status: 'READING' | 'FINISHED' | 'DROPPED';
  notes?: string;
  finishedAt?: Date | null;
  droppedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  genres: Genre[];
  tags: Tag[];
}

export interface Genre {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface BookStatusCounts {
  total: number;
  reading: number;
  finished: number;
  dropped: number;
  finishedThisYear: number;
  totalPagesRead: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ImportResult {
  success: number;
  errors: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'READING' | 'FINISHED' | 'DROPPED';
}