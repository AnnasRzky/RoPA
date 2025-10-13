import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        uploadedFiles: true,
        records: {
          include: { sourceFile: true },
        },
        brainstorms: true,
        messages: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
  }
}
