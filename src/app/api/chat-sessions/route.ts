import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createChatSessionSchema } from "@/lib/validators";

export async function GET() {
  try {
    console.log("🔹 [GET] Fetching all chat sessions...");

    const sessions = await prisma.chatSession.findMany({
      include: {
        uploadedFiles: true,
        records: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ [GET] Fetched ${sessions.length} sessions successfully`);
    return NextResponse.json(sessions, { status: 200 });
  } catch (error: any) {
    console.error("[GET] Error fetching chat sessions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch chat sessions",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log("🔹 [POST] Incoming request to create chat session");

    const body = await req.json();
    console.log("[POST] Request body:", body);

    const parsed = createChatSessionSchema.parse(body);
    console.log("[POST] Parsed body after validation:", parsed);

    const newSession = await prisma.chatSession.create({
      data: {
        title: parsed.title || "Untitled Session", 
      },
    });

    console.log("✅ [POST] Successfully created new session:", newSession);

    return NextResponse.json(newSession, { status: 201 });

  } catch (error: any) {
    console.error("[POST] Error creating chat session:", error);

    return NextResponse.json(
      {
        error: "Failed to create chat session",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}