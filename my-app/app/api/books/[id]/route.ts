import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/supabase/getUser";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserId();

    const book = await prisma.book.findFirst({
      where: { id, userId },
      include: { genres: true, tags: true },
    });

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

    const existing = await prisma.book.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    const { genres, tags, totalPages, pagesRead, status, notes, title, author } = body;

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(author !== undefined && { author }),
        ...(totalPages !== undefined && { totalPages }),
        ...(pagesRead !== undefined && { pagesRead }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        genres: genres
          ? {
              connectOrCreate: (genres as string[]).map((name: string) => ({
                where: { userId_name: { userId, name } },
                create: { name, userId },
              })),
            }
          : undefined,
        tags: tags
          ? {
              connectOrCreate: (tags as string[]).map((name: string) => ({
                where: { userId_name: { userId, name } },
                create: { name, userId },
              })),
            }
          : undefined,
      },
      include: { genres: true, tags: true },
    });

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

    const existing = await prisma.book.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    await prisma.book.delete({ where: { id } });

    return NextResponse.json({ message: "Book deleted" });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
