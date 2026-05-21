import { NextResponse } from "next/server";
import { getUserId } from "@/lib/supabase/getUser";
import { importBooksWithModeration } from "@/lib/import-actions";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const result = await importBooksWithModeration(userId, file);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.reason ?? "Import rejected",
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      booksImported: result.booksImported,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Error importing books:", error);
    return NextResponse.json(
      { error: "Failed to import books" },
      { status: 500 }
    );
  }
}
