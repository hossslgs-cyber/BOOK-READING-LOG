import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectBooksFromInternet } from "@/lib/bookCollector";
import { getUserId } from "@/lib/supabase/getUser";

export async function POST(request: Request) {
  try {
    const { count = 5 } = await request.json();
    const userId = await getUserId();

    const collected = await collectBooksFromInternet(userId, count);

    let added = 0;
    for (const book of collected) {
      const existing = await prisma.book.findFirst({
        where: { title: book.title, author: book.author, userId },
      });
      if (existing) continue;

      const genres = book.genres.map((name: string) => ({
        where: { userId_name: { userId, name } },
        create: { name, userId },
      }));

      await prisma.book.create({
        data: {
          title: book.title,
          author: book.author,
          totalPages: book.totalPages,
          pagesRead: 0,
          status: "READING",
          notes: book.description.slice(0, 500),
          userId,
          source: "ai_collected",
          genres: { connectOrCreate: genres },
        },
      });
      added++;
    }

    return NextResponse.json({ added, total_collected: collected.length });
  } catch (error) {
    console.error("Error collecting books:", error);
    return NextResponse.json(
      { error: "Failed to collect books" },
      { status: 500 }
    );
  }
}
