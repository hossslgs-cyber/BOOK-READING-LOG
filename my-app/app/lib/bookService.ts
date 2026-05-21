import { Book } from "@/types";

// Update book with business logic applied
export async function updateBook(
  bookId: string,
  updates: Partial<Book> & { id: string }
): Promise<Book> {
  // In a real app, this would make an API call to /api/books/[id]
  // For now, we'll simulate with mock data and business logic
  
  // This is where we'd apply business logic like:
  // - Bottom limit constraint (can't go below 0)
  // - Top limit guardrail (can't exceed totalPages)
  // - Auto-completion trigger
  // - Accidental click protection
  // - Status reversion rule
  
  // For now, we'll return a mock updated book
  // In a real implementation, this would call the API
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // Mock implementation - in reality this would update via API
  const mockUpdatedBook: Book = {
    id: bookId,
    title: "Mock Book",
    author: "Mock Author",
    totalPages: 300,
    pagesRead: updates.pagesRead ?? 150,
    status: updates.status ?? "READING",
    notes: updates.notes ?? "Mock notes",
    finishedAt: updates.status === "FINISHED" ? new Date() : null,
    droppedAt: updates.status === "DROPPED" ? new Date() : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    genres: [{ id: "g1", name: "Fiction" }],
    tags: [{ id: "t1", name: "favorite" }],
  };
  
  // Apply business logic
  let processedBook = applyBusinessLogic(mockUpdatedBook, updates);
  
  return processedBook;
}

// Apply business logic to book updates
function applyBusinessLogic(
  book: Book,
  updates: Partial<Book> & { id: string }
): Book {
  const processedBook = { ...book, ...updates };
  
  // 4.1 The Bottom Limit Constraint
  // When a book's pages_read is at 0, the decrement control (-) 
  // immediately transitions to a greyed-out disabled state
  // (handled in UI, but we ensure data integrity)
  if (processedBook.pagesRead < 0) {
    processedBook.pagesRead = 0;
  }
  
  // 4.2 The Top Limit Guardrail
  // If a user attempts to manually type a numeric page entry 
  // that is strictly higher than the book's total_pages, 
  // the system rejects the operation
  if (
    processedBook.totalPages !== null && 
    processedBook.totalPages !== undefined &&
    processedBook.pagesRead > processedBook.totalPages
  ) {
    processedBook.pagesRead = processedBook.totalPages;
  }
  
  // 4.3 The Auto-Completion Trigger
  // When pages_read matches total_pages perfectly via either 
  // numeric input or stepping forward with the + button, 
  // the system automatically marks the book status as finished
  if (
    processedBook.totalPages !== null && 
    processedBook.totalPages !== undefined &&
    processedBook.pagesRead === processedBook.totalPages &&
    processedBook.status !== "FINISHED"
  ) {
    processedBook.status = "FINISHED";
    processedBook.finishedAt = new Date();
  }
  
  // 4.4 Accidental Click Protection
  // If a user mistakenly triggers the finished threshold via 
  // an extra click, the + and - buttons remain fully interactive 
  // on the finished card, permitting them to step backwards 
  // to easily fix mistakes. The status reverts to reading if 
  // pages_read drops below total_pages.
  if (
    processedBook.status === "FINISHED" &&
    processedBook.totalPages !== null &&
    processedBook.totalPages !== undefined &&
    processedBook.pagesRead < processedBook.totalPages
  ) {
    processedBook.status = "READING";
    processedBook.finishedAt = null;
  }
  
  // 4.5 Status Reversion Rule
  // If a book is marked finished or dropped and the user later 
  // updates pages_read or changes status back to reading, 
  // the system clears the finished_at / dropped_at timestamps 
  // and resumes normal tracking.
  
  // Status reversion: if status changed to reading from finished/dropped
  if (
    processedBook.status === "READING" &&
    (book.status === "FINISHED" || book.status === "DROPPED")
  ) {
    processedBook.finishedAt = null;
    processedBook.droppedAt = null;
  }
  
  return processedBook;
}

// Delete book
export async function deleteBook(bookId: string): Promise<void> {
  // In a real app, this would make an API call to DELETE /api/books/[id]
  // For now, we'll simulate with a delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  // Simulate successful deletion
}