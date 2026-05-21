"use client";

import { useState, useEffect } from "react";
import { Book } from "@/types";
import { updateBook, deleteBook } from "@/lib/bookService";

interface BookDetailProps {
  params: { id: string };
}

export default function BookDetail({ params }: BookDetailProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch book data - in a real app, this would come from API
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      // Mock book data - in reality, this would fetch from /api/books/[id]
      const mockBook: Book = {
        id: params.id,
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt, David Thomas",
        totalPages: 352,
        pagesRead: 150,
        status: "READING",
        notes: "Great book about software development practices",
        finishedAt: null,
        droppedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        genres: [{ id: "g1", name: "Non-Fiction" }, { id: "g2", name: "Technology" }],
        tags: [{ id: "t1", name: "favorite" }, { id: "t2", name: "recommended" }],
      };
      setBook(mockBook);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [params.id]);

  const handleUpdate = async (updates: Partial<Book>) => {
    setIsUpdating(true);
    try {
      const updatedBook = await updateBook(params.id, { id: params.id, ...updates });
      setBook(updatedBook);
    } catch (err) {
      setError("Failed to update book");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      setIsDeleting(true);
      try {
        await deleteBook(params.id);
        // In a real app, we would redirect to the books list
        alert("Book deleted successfully! Redirecting to book list...");
        // router.push("/"); // Would use Next.js navigation in real implementation
      } catch (err) {
        setError("Failed to delete book");
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-zinc-500">Loading book details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 text-red-100 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <p className="text-zinc-500">Book not found</p>
      </div>
    );
  }

  const getProgressPercentage = () => {
    if (!book.totalPages || book.totalPages === 0) return 0;
    return Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 0 && percentage <= 33) {
      return "bg-red-500";
    } else if (percentage >= 34 && percentage <= 66) {
      return "bg-yellow-500";
    } else if (percentage >= 67 && percentage <= 99) {
      return "bg-blue-500";
    } else {
      return "bg-green-500";
    }
  };

  const getStatusBadgeClass = (status: Book["status"]) => {
    switch (status) {
      case "READING":
        return "bg-blue-100 text-blue-800";
      case "FINISHED":
        return "bg-green-100 text-green-800";
      case "DROPPED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex flex-col flex-1 items-center justify-between py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Back button */}
          <div className="mb-6">
            <button
              onClick={() => {
                // In a real app, this would navigate back
                alert("Navigate back to book list");
              }}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              ← Back to Library
            </button>
          </div>

          {/* Book detail content */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{book.title}</h1>
                  <p className="text-sm text-zinc-500">by {book.author}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusBadgeClass(
                  book.status
                )}`}>
                  {book.status}
                </span>
              </div>

              {/* Progress section */}
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Reading Progress</h2>
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => {
                      if (book.pagesRead > 0) {
                        handleUpdate({ pagesRead: book.pagesRead - 1 });
                      }
                    }}
                    disabled={isUpdating || book.pagesRead <= 0}
                    className={`mr-3 h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    –
                  </button>
                  <span className="mx-4 font-mono text-xl">{book.pagesRead}</span>
                  <button
                    onClick={() => {
                      handleUpdate({ pagesRead: book.pagesRead + 1 });
                    }}
                    disabled={
                      isUpdating ||
                      (book.totalPages != null && book.pagesRead >= book.totalPages)
                    }
                    className={`ml-3 h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    +
                  </button>
                </div>

                {book.totalPages && book.totalPages > 0 ? (
                  <>
                    <div className="mt-2 h-2.5 w-full bg-gray-200 rounded overflow-hidden">
                      <div
                        className={`${getProgressColor(
                          getProgressPercentage()
                        )} h-2.5 w-${getProgressPercentage()}% transition-width duration-300`}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 text-right">
                      {getProgressPercentage()}% of {book.totalPages} pages
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-zinc-500">
                    Total pages not set - use manual progress tracking
                  </p>
                )}
              </div>

              {/* Notes section */}
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Notes</h2>
                {book.notes ? (
                  <p className="text-zinc-600">{book.notes}</p>
                ) : (
                  <p className="text-zinc-400 italic">No notes added yet</p>
                )}
              </div>

              {/* Genres and Tags */}
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Genres & Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {book.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-800"
                    >
                      {genre.name}
                    </span>
                  ))}
                  {book.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-sm text-zinc-500 border-t pt-4">
                <p>
                  Created: {new Date(book.createdAt).toLocaleDateString()}
                </p>
                <p>
                  Updated: {new Date(book.updatedAt).toLocaleDateString()}
                </p>
                {book.finishedAt && (
                  <p>
                    Finished: {new Date(book.finishedAt).toLocaleDateString()}
                  </p>
                )}
                {book.droppedAt && (
                  <p>
                    Dropped: {new Date(book.droppedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row sm:gap-3">
            <button
              onClick={() => {
                // Navigate to edit page
                alert("Navigate to edit book page");
              }}
              disabled={isUpdating}
              className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              Edit Book
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-transparent bg-background px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              Delete Book
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }