import { useState } from "react";
import { Book } from "@/types";
import { updateBook, deleteBook } from "@/lib/bookService";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIncrement = async () => {
    if (book.pagesRead < (book.totalPages ?? Infinity)) {
      setIsUpdating(true);
      try {
        await updateBook(book.id, {
          id: book.id,
          pagesRead: book.pagesRead + 1,
        });
        // In a real app, we would update the book state from the API response
        // For now, we'll optimistically update the UI
      } catch (err) {
        setError("Failed to update progress");
        console.error(err);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDecrement = async () => {
    if (book.pagesRead > 0) {
      setIsUpdating(true);
      try {
        await updateBook(book.id, {
          id: book.id,
          pagesRead: book.pagesRead - 1,
        });
        // In a real app, we would update the book state from the API response
        // For now, we'll optimistically update the UI
      } catch (err) {
        setError("Failed to update progress");
        console.error(err);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      setIsDeleting(true);
      try {
        await deleteBook(book.id);
        // In a real app, we would remove the book from the list after successful deletion
        // For now, we'll optimistically remove it from UI
      } catch (err) {
        setError("Failed to delete book");
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

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
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium">{book.title}</h3>
            <p className="text-sm text-zinc-500">{book.author}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
            book.status
          )}`}>
            {book.status}
          </span>
        </div>

        {book.notes && (
          <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{book.notes}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {book.genres.map((genre) => (
            <span
              key={genre.id}
              className="px-2 py-0.5 text-xs rounded-full bg-gray-100"
            >
              {genre.name}
            </span>
          ))}
          {book.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 text-xs rounded-full bg-gray-200"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <button
                onClick={handleDecrement}
                disabled={isUpdating || book.pagesRead <= 0}
                className={`mr-2 h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                -
              </button>
              <span className="mx-2 font-medium">{book.pagesRead}</span>
              <button
                onClick={handleIncrement}
                disabled={
                  isUpdating ||
                  (book.totalPages && book.pagesRead >= book.totalPages)
                }
                className={`ml-2 h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                +
              </button>
            </div>

            {book.totalPages && book.totalPages > 0 ? (
              <div className="mt-2 h-2 w-full bg-gray-200 rounded overflow-hidden">
                <div
                  className={`${getProgressColor(
                    getProgressPercentage()
                  )} h-2 w-${getProgressPercentage()}% transition-width duration-300`}
                ></div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">
                Total pages not set
              </p>
            )}
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`ml-4 h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {/* Trash icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}