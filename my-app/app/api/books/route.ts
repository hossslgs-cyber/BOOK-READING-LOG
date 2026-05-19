import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/supabase/getUser";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as "READING" | "FINISHED" | "DROPPED" | null;

    const userId = await getUserId();

    const whereClause: any = {
      userId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { genres: { some: { name: { contains: search, mode: "insensitive" } } } },
        { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [books, totalCount] = await prisma.$transaction([
      prisma.book.findMany({
        where: whereClause,
        include: {
          genres: true,
          tags: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.book.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, totalPages, status, notes, genres, tags } = body;

    const userId = await getUserId();

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        totalPages: totalPages ?? null,
        pagesRead: 0,
        status: status ?? "READING",
        notes: notes ?? null,
        userId,
        genres: {
          connectOrCreate: (genres ?? []).map((genreName: string) => ({
            where: { userId_name: { userId, name: genreName } },
            create: { name: genreName, userId },
          })),
        },
        tags: {
          connectOrCreate: (tags ?? []).map((tagName: string) => ({
            where: { userId_name: { userId, name: tagName } },
            create: { name: tagName, userId },
          })),
        },
      },
      include: {
        genres: true,
        tags: true,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
