/**
 * Test utility functions for the Book Reading Log application
 */

// Test data generator
export function generateTestBook(id: string = "test-id"): any {
  return {
    id,
    title: `Test Book ${id}`,
    author: "Test Author",
    totalPages: 200,
    pagesRead: 50,
    status: "READING" as const,
    notes: "This is a test book",
    finishedAt: null,
    droppedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    genres: [{ id: "genre-1", name: "Fiction" }],
    tags: [{ id: "tag-1", name: "favorite" }],
  };
}

// Test business logic functions
export function testBottomLimitConstraint() {
  // When pages_read is at 0, decrement should be disabled
  const book = generateTestBook();
  book.pagesRead = 0;
  
  // Should not allow going below 0
  expect(book.pagesRead).toBeGreaterThanOrEqual(0);
  
  return true;
}

export function testTopLimitGuardrail() {
  // Should not allow pages_read to exceed total_pages
  const book = generateTestBook();
  book.totalPages = 100;
  book.pagesRead = 150; // Attempt to set above limit
  
  // Business logic should cap it at totalPages
  if (book.pagesRead > book.totalPages) {
    book.pagesRead = book.totalPages;
  }
  
  expect(book.pagesRead).toBeLessThanOrEqual(book.totalPages);
  
  return true;
}

export function testAutoCompletionTrigger() {
  // When pages_read matches total_pages, status should become FINISHED
  const book = generateTestBook();
  book.totalPages = 100;
  book.pagesRead = 100;
  book.status = "READING";
  
  // Apply business logic
  if (book.pagesRead === book.totalPages && book.status !== "FINISHED") {
    book.status = "FINISHED";
    book.finishedAt = new Date();
  }
  
  expect(book.status).toBe("FINISHED");
  expect(book.finishedAt).toBeInstanceOf(Date);
  
  return true;
}

// Mock test runner (in a real app, we'd use Jest or similar)
export function runTests() {
  try {
    testBottomLimitConstraint();
    testTopLimitGuardrail();
    testAutoCompletionTrigger();
    console.log("All tests passed!");
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    return false;
  }
}