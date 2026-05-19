"use client";

import { useState, useEffect } from "react";
import BookForm from "@/components/forms/BookForm";
import { Book } from "@/types";

export default function EditBookPage({ params }: { params: { id: string } }) {
  const [initialData, setInitialData] = useState<Partial<Book> & {
    genres: string[];
    tags: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch book data for editing - in a real app, this would come from API
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      // Mock book data for editing - in reality, this would fetch from /api/books/[id]
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
      
      setInitialData({
        title: mockBook.title,
        author: mockBook.author,
        totalPages: mockBook.totalPages,
        pagesRead: mockBook.pagesRead,
        status: mockBook.status,
        notes: mockBook.notes,
        genres: mockBook.genres.map(g => g.name) as any,
        tags: mockBook.tags.map(t => t.name) as any,
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [params.id]);

  const handleSubmit = async (bookData: any) => {
    setError(null);
    try {
      // In a real app, this would send data to PUT /api/books/[id]
      // For now, we'll simulate success
      alert("Book updated successfully! (In a real app, this would redirect to the book list)");
      // router.push(`/books/${params.id}`); // Would use Next.js navigation in real implementation
    } catch (err) {
      setError("Failed to update book");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-zinc-500">Loading book data...</p>
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

  if (!initialData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <p className="text-zinc-500">Book not found</p>
      </div>
    );
  }

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

          {/* Form header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Edit Book
            </h1>
            <p className="mt-2 text-zinc-500">
              Update your book details
            </p>
          </div>

          {/* Book form */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <BookForm
                onSubmit={handleSubmit}
                initialData={initialData}
                isEditing={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}