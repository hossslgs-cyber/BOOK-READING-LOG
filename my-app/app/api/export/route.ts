import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import {
  Document as WordDoc,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
} from "docx";
import { getUserId } from "@/lib/supabase/getUser";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "pdf";
    const userId = await getUserId();

    const books = await prisma.book.findMany({
      where: { userId },
      include: { genres: true, tags: true },
      orderBy: { updatedAt: "desc" },
    });

    if (format === "docx") {
      const doc = new WordDoc({
        sections: [
          {
            children: [
              new Paragraph({ children: [new TextRun({ text: "Book Reading Log - Library Export", bold: true, size: 32 })] }),
              new Paragraph({ text: `Exported on ${new Date().toLocaleDateString()}`, spacing: { after: 400 } }),
              ...books.map(
                (b) =>
                  new Table({
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Title", bold: true })] })] }),
                          new TableCell({ children: [new Paragraph(b.title)] }),
                        ],
                      }),
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Author", bold: true })] })] }),
                          new TableCell({ children: [new Paragraph(b.author)] }),
                        ],
                      }),
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
                          new TableCell({ children: [new Paragraph(b.status)] }),
                        ],
                      }),
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Progress", bold: true })] })] }),
                          new TableCell({ children: [new Paragraph(`${b.pagesRead} / ${b.totalPages ?? "N/A"} pages`)] }),
                        ],
                      }),
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Genres", bold: true })] })] }),
                          new TableCell({ children: [new Paragraph(b.genres.map((g) => g.name).join(", "))] }),
                        ],
                      }),
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tags", bold: true })] })] }),
                          new TableCell({ children: [new Paragraph(b.tags.map((t) => t.name).join(", "))] }),
                        ],
                      }),
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Notes", bold: true })] })] }),
                          new TableCell({ children: [new Paragraph(b.notes ?? "")] }),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="book-library-export.docx"`,
        },
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve) => {
      doc.on("end", () => resolve());

      doc.fontSize(20).text("Book Reading Log - Library Export", { align: "center" });
      doc.fontSize(10).text(`Exported on ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown();

      for (const b of books) {
        const progress = b.totalPages ? Math.round((b.pagesRead / b.totalPages) * 100) : 0;
        doc.fontSize(14).font("Helvetica-Bold").text(b.title);
        doc.fontSize(10).font("Helvetica").text(`by ${b.author}`);
        doc.text(`Status: ${b.status}  |  Progress: ${b.pagesRead} / ${b.totalPages ?? "N/A"} (${progress}%)`);
        doc.text(`Genres: ${b.genres.map((g) => g.name).join(", ") || "—"}`);
        doc.text(`Tags: ${b.tags.map((t) => t.name).join(", ") || "—"}`);
        if (b.notes) doc.text(`Notes: ${b.notes}`);
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#ccc").stroke();
        doc.moveDown();
      }

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="book-library-export.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting books:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
