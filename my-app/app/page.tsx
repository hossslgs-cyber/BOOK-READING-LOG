import { useState, useEffect } from "react";
import Image from "next/image";
import StatsBar from "./components/StatsBar";
import FilterTabs from "./components/FilterTabs";
import SearchBar from "./components/SearchBar";
import BookCard from "./components/BookCard";
import { BookStatusCounts, Book } from "./types";
import { updateBook, deleteBook } from "@/lib/bookService";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<BookStatusCounts>({
    total: 0,
    reading: 0,
    finished: 0,
    dropped: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "READING" | "FINISHED" | "DROPPED"
  >("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from books
  useEffect(() => {
    if (books.length > 0) {
      const total = books.length;
      const reading = books.filter((b) => b.status === "READING").length;
      const finished = books.filter((b) => b.status === "FINISHED").length;
      const dropped = books.filter((b) => b.status === "DROPPED").length;
      setStats({ total, reading, finished, dropped });
    }
  }, [books]);

  // Filter books based on search and status
  const filteredBooks = books
    .filter((book) => {
      if (filterStatus !== "ALL" && book.status !== filterStatus) return false;
      if (
        searchTerm &&
        !book.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        !book.author
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        !book.genres.some((g) =>
          g.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) &&
        !book.tags.some((t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
        return false;
      return true;
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  // Simulate loading data - in a real app, this would fetch from API
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      // Mock data for development - will be replaced with actual API calls
      const mockBooks: Book[] = [
        {
          id: "1",
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
        },
        {
          id: "2",
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          totalPages: 281,
          pagesRead: 281,
          status: "FINISHED",
          notes: "Classic novel about racial injustice",
          finishedAt: new Date(Date.now() - 86400000),
          droppedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          genres: [{ id: "g3", name: "Fiction" }, { id: "g4", name: "Classic" }],
          tags: [{ id: "t3", name: "must-read" }, { id: "t4", name: "paperback" }],
        },
        {
          id: "3",
          title: "1984",
          author: "George Orwell",
          totalPages: 328,
          pagesRead: 50,
          status: "DROPPED",
          notes: "Found it too dystopian for my taste",
          finishedAt: null,
          droppedAt: new Date(Date.now() - 172800000),
          createdAt: new Date(),
          updatedAt: new Date(),
          genres: [{ id: "g5", name: "Fiction" }, { id: "g6", name: "Sci-Fi" }],
          tags: [{ id: "t5", name: "re-read" }],
        },
      ];
      setBooks(mockBooks);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateBook = async (
    updates: Partial<Book> & { id: string }
  ) => {
    try {
      const updatedBook = await updateBook(updates.id, updates);
      setBooks((prev) =>
        prev.map((book) =>
          book.id === updatedBook.id ? updatedBook : book
        )
      );
    } catch (err) {
      setError("Failed to update book");
      console.error(err);
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((book) => book.id !== id));
    } catch (err) {
      setError("Failed to delete book");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-zinc-500">Loading your library...</p>
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex flex-col flex-1 items-center justify-between py-12 px-4 sm:px-6 lg:px-8">
        <header className="w-full max-w-4xl">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Book Reading Log
          </h1>
          
          <StatsBar stats={stats} />
          <FilterTabs onFilterChange={setFilterStatus} />
          <SearchBar
            onSearchChange={setSearchTerm}
            onClearFilters={() => {
              setSearchTerm("");
              setFilterStatus("ALL");
            }}
          />
          
          {filteredBooks.length === 0 && filterStatus !== "ALL" ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">
                No books here yet! Keep on reading!
              </p>
              <button
                onClick={() => {
                  // Navigate to add book page in real implementation
                  alert("Navigate to add book page");
                }}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Add a Book
              </button>
            </div>
          ) : (
            <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                />
              ))}
            </div>
          )}
        </header>
      </div>
    </div>
  );
}