"use client";

import { useState } from "react";
import { Book } from "@/types";

// Predefined genres and tags from PRD
const predefinedGenres = [
  "Fiction",
  "Non-Fiction",
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Romance",
  "Thriller",
  "Biography",
  "History",
  "Self-Help",
  "Science",
  "Philosophy",
  "Poetry",
  "Classic",
  "Contemporary",
];

const predefinedTags = [
  "must-read",
  "favorite",
  "re-read",
  "audiobook",
  "ebook",
  "paperback",
  "hardcover",
  "library",
  "owned",
  "wishlist",
  "recommended",
];

interface BookFormProps {
  onSubmit: (bookData: Omit<Book, "id" | "createdAt" | "updatedAt" | "finishedAt" | "droppedAt" | "userId" | "genres" | "tags"> & {
    genres: string[];
    tags: string[];
  }) => void;
  initialData?: Partial<Book> & {
    genres: string[];
    tags: string[];
  };
  isEditing?: boolean;
}

export default function BookForm({
  onSubmit,
  initialData,
  isEditing = false,
}: BookFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [author, setAuthor] = useState(initialData?.author ?? "");
  const [totalPages, setTotalPages] = useState(
    initialData?.totalPages ?? null
  );
  const [pagesRead, setPagesRead] = useState(
    initialData?.pagesRead ?? 0
  );
  const [status, setStatus] = useState(
    initialData?.status ?? "READING"
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialData?.genres ?? []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags ?? []
  );
  const [newGenre, setNewGenre] = useState("");
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle genre input
  const handleGenreKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newGenre.trim()) {
      e.preventDefault();
      const trimmed = newGenre.trim();
      if (!selectedGenres.includes(trimmed)) {
        setSelectedGenres([...selectedGenres, trimmed]);
      }
      setNewGenre("");
    }
  };

  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      const trimmed = newTag.trim();
      if (!selectedTags.includes(trimmed)) {
        setSelectedTags([...selectedTags, trimmed]);
      }
      setNewTag("");
    }
  };

  // Remove genre
  const removeGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Basic validation
    if (!title.trim()) {
      setError("Title is required");
      setIsSubmitting(false);
      return;
    }

    if (!author.trim()) {
      setError("Author is required");
      setIsSubmitting(false);
      return;
    }

    // Prepare data for submission
    const bookData = {
      title: title.trim(),
      author: author.trim(),
      totalPages: totalPages ?? undefined,
      pagesRead: pagesRead ?? 0,
      status,
      notes: notes.trim() || undefined,
      genres: selectedGenres,
      tags: selectedTags,
    };

    try {
      await onSubmit(bookData);
      // In a real app, we would redirect or show success message
      alert("Book saved successfully!");
    } catch (err) {
      setError("Failed to save book");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Author
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Total Pages (Optional)
          </label>
          <input
            type="number"
            min={0}
            value={totalPages ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              const parsed = parseInt(value, 10);
              setTotalPages(value === "" ? null : isNaN(parsed) ? null : parsed);
            }}
            className="w-full px-4 py-2 border border-input rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
            placeholder="Leave blank for manual progress"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Pages Read
          </label>
          <input
            type="number"
            min={0}
            value={pagesRead ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              const parsed = parseInt(value, 10);
              setPagesRead(value === "" ? 0 : isNaN(parsed) ? 0 : parsed);
            }}
            className="w-full px-4 py-2 border border-input rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "READING" | "FINISHED" | "DROPPED")}
          className="w-full px-4 py-2 border border-input rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
        >
          <option value="READING">Reading</option>
          <option value="FINISHED">Finished</option>
          <option value="DROPPED">Dropped</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 h-24"
          placeholder="Your thoughts, takeaways, or reflections..."
        />
      </div>

      {/* Genres Section */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Genres
        </label>
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {predefinedGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  if (!selectedGenres.includes(genre)) {
                    setSelectedGenres([...selectedGenres, genre]);
                  }
                }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedGenres.includes(genre)
                    ? "bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedGenres.map((genre) => (
              <div key={genre} className="flex items-center gap-1">
                <span className="px-3 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                  {genre}
                </span>
                <button
                  type="button"
                  onClick={() => removeGenre(genre)}
                  className="p-1 text-zinc-500 hover:text-zinc-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex">
          <input
            type="text"
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            onKeyDown={handleGenreKeyDown}
            placeholder="Add new genre..."
            className="flex-1 px-3 py-2 border border-input rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => {
              if (newGenre.trim()) {
                const trimmed = newGenre.trim();
                if (!selectedGenres.includes(trimmed)) {
                  setSelectedGenres([...selectedGenres, trimmed]);
                }
                setNewGenre("");
              }
            }}
            disabled={isSubmitting}
            className="ml-3 px-4 py-2 border border-input rounded-md bg-white hover:bg-accent disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Tags
        </label>
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {predefinedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (!selectedTags.includes(tag)) {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <div key={tag} className="flex items-center gap-1">
                <span className="px-3 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                  {tag}
                </span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="p-1 text-zinc-500 hover:text-zinc-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add new tag..."
            className="flex-1 px-3 py-2 border border-input rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => {
              if (newTag.trim()) {
                const trimmed = newTag.trim();
                if (!selectedTags.includes(trimmed)) {
                  setSelectedTags([...selectedTags, trimmed]);
                }
                setNewTag("");
              }
            }}
            disabled={isSubmitting}
            className="ml-3 px-4 py-2 border border-input rounded-md bg-white hover:bg-accent disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm ${
            isEditing
              ? "bg-primary text-primary-foreground hover:bg-primary/80"
              : "bg-background text-zinc-900 border border-input hover:bg-accent"
          }`}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Book" : "Add Book"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}