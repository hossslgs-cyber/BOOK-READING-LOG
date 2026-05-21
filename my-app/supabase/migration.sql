-- Run this in the Supabase SQL editor (https://supabase.com/dashboard/project/_/sql/new)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  total_pages INTEGER,
  pages_read INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'READING' NOT NULL CHECK (status IN ('READING', 'FINISHED', 'DROPPED')),
  notes TEXT,
  finished_at TIMESTAMPTZ,
  dropped_at TIMESTAMPTZ,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'manual' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Genres table
CREATE TABLE genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- Tags table
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- Junction table: books ↔ genres
CREATE TABLE book_genres (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);

-- Junction table: books ↔ tags
CREATE TABLE book_tags (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_genres_user_id ON genres(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_book_genres_book_id ON book_genres(book_id);
CREATE INDEX idx_book_genres_genre_id ON book_genres(genre_id);
CREATE INDEX idx_book_tags_book_id ON book_tags(book_id);
CREATE INDEX idx_book_tags_tag_id ON book_tags(tag_id);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own data
CREATE POLICY "Users can manage their own books"
  ON books FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own genres"
  ON genres FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tags"
  ON tags FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own book_genres"
  ON book_genres FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = book_genres.book_id AND books.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = book_genres.book_id AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own book_tags"
  ON book_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = book_tags.book_id AND books.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = book_tags.book_id AND books.user_id = auth.uid()
    )
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
