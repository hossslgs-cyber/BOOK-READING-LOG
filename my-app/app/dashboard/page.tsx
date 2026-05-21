"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatsBar from "@/components/StatsBar";
import FilterTabs from "@/components/FilterTabs";
import SearchBar from "@/components/SearchBar";
import BookCard from "@/components/BookCard";
import { BookStatusCounts, Book, ImportResult } from "@/types";
import { updateBook, deleteBook } from "@/lib/bookService";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<BookStatusCounts>({
    total: 0,
    reading: 0,
    finished: 0,
    dropped: 0,
    finishedThisYear: 0,
    totalPagesRead: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "READING" | "FINISHED" | "DROPPED"
  >("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) {
        router.replace("/");
        return;
      }
      setUser({ email: u.email ?? "", name: u.user_metadata?.name });
      setAuthLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (authLoading) return;
    if (books.length > 0) {
      const total = books.length;
      const reading = books.filter((b) => b.status === "READING").length;
      const finished = books.filter((b) => b.status === "FINISHED").length;
      const dropped = books.filter((b) => b.status === "DROPPED").length;
      const now = new Date();
      const thisYear = now.getFullYear();
      const finishedThisYear = books.filter(
        (b) => b.status === "FINISHED" && b.finishedAt && new Date(b.finishedAt).getFullYear() === thisYear
      ).length;
      const totalPagesRead = books.reduce((sum, b) => sum + (b.pagesRead || 0), 0);
      setStats({ total, reading, finished, dropped, finishedThisYear, totalPagesRead });
    }
  }, [books, authLoading]);

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

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    const timer = setTimeout(() => {
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
  }, [authLoading]);

  const handleUpdateBook = async (updates: Partial<Book> & { id: string }) => {
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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Book Reading Log
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {user?.name ?? user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <a
              href="/api/export?format=pdf"
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Export PDF
            </a>
            <a
              href="/api/export?format=docx"
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Export Word
            </a>
            <button
              onClick={async () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".txt,.md";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  const res = await fetch("/api/import", { method: "POST", body: formData });
                  const result: ImportResult = await res.json();
                  alert(`Imported ${result.success} books${result.errors.length ? `, ${result.errors.length} errors` : ""}`);
                  window.location.reload();
                };
                input.click();
              }}
              className="px-3 py-1.5 text-xs font-medium bg-zinc-200 text-zinc-800 rounded-md hover:bg-zinc-300"
            >
              Import
            </button>
            <button
              onClick={async () => {
                const res = await fetch("/api/books/collect", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ count: 5 }),
                });
                const data = await res.json();
                if (data.added > 0) {
                  alert(`AI collected ${data.added} new books from the internet!`);
                  window.location.reload();
                } else {
                  alert("No new books found to collect");
                }
              }}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              AI Collect Books
            </button>
          </div>

          <StatsBar stats={stats} />
          <Suspense fallback={<div className="h-10" />}>
            <FilterTabs onFilterChange={setFilterStatus} />
          </Suspense>
          <Suspense fallback={<div className="h-10" />}>
            <SearchBar
              onSearchChange={setSearchTerm}
              onClearFilters={() => {
                setSearchTerm("");
                setFilterStatus("ALL");
              }}
            />
          </Suspense>

          {filteredBooks.length === 0 && filterStatus !== "ALL" ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">
                No books here yet! Keep on reading!
              </p>
              <button
                onClick={() => {
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
