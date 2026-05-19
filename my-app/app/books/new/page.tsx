import { useState } from "react";
import BookForm from "@/components/forms/BookForm";

export default function NewBookPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (bookData: any) => {
    setError(null);
    try {
      // In a real app, this would send data to /api/books
      // For now, we'll simulate success
      alert("Book added successfully! (In a real app, this would redirect to the book list)");
      // router.push("/"); // Would use Next.js navigation in real implementation
    } catch (err) {
      setError("Failed to add book");
      console.error(err);
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

          {/* Form header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Add a New Book
            </h1>
            <p className="mt-2 text-zinc-500">
              Start tracking your reading journey
            </p>
          </div>

          {/* Book form */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <BookForm
                onSubmit={handleSubmit}
                isEditing={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}