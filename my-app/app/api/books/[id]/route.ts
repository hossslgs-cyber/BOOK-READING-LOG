import { NextResponse } from "next/server";
import { getUserId } from "@/lib/supabase/getUser";
import { getBook, updateBook as updateBookDb, deleteBook as deleteBookDb } from "@/lib/supabase/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserId();
    const book = await getBook(id, userId);

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserId();
    const body = await request.json();

    const { genres, tags, totalPages, pagesRead, status, notes, title, author } = body;

    const book = await updateBookDb(id, userId, {
      ...(title !== undefined && { title }),
      ...(author !== undefined && { author }),
      ...(totalPages !== undefined && { totalPages }),
      ...(pagesRead !== undefined && { pagesRead }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(genres !== undefined && { genres }),
      ...(tags !== undefined && { tags }),
    });

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserId();
    await deleteBookDb(id, userId);

    return NextResponse.json({ message: "Book deleted" });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
