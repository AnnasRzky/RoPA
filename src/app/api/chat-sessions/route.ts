import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createChatSessionSchema } from "@/lib/validators";

export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      include: {
        uploadedFiles: true,
        records: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createChatSessionSchema.parse(body);

    const newSession = await prisma.chatSession.create({
      data: {
        title: parsed.title || "Untitled Session",
      },
    });

    return NextResponse.json(newSession);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
