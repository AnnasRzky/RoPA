import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/chat/[id]
 * Mengambil data lengkap untuk 1 ChatSession
 * Termasuk: session, uploaded files, records, brainstorms, dan messages
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  try {
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        uploadedFiles: true, // Semua file yang diupload user
        records: {
          include: {
            sourceFile: true, // Relasi ke file asal yang dianalisis
          },
        },
        brainstorms: true, // Riwayat brainstorming
        messages: true,    // Pesan chat user & AI
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/[id]
 * Menghapus 1 ChatSession beserta semua relasi (cascading delete)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  try {
    // Hapus data berurutan, karena Prisma belum mendukung cascading secara langsung
    await prisma.brainstorm.deleteMany({ where: { sessionId: id } });
    await prisma.chatMessage.deleteMany({ where: { sessionId: id } });
    await prisma.record.deleteMany({ where: { chatSessionId: id } });
    await prisma.uploadedFile.deleteMany({ where: { sessionId: id } });

    // Terakhir, hapus session
    await prisma.chatSession.delete({ where: { id } });

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json(
      { error: "Failed to delete chat session" },
      { status: 500 }
    );
  }
}
