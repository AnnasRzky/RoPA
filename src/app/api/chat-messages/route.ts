import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, sender, text } = body;

    if (!sessionId || !sender || !text) {
      return NextResponse.json(
        { error: "sessionId, sender, dan text wajib diisi" },
        { status: 400 }
      );
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender,
        text,
      },
    });

    return NextResponse.json(
      { message: "Chat message saved successfully", data: newMessage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating chat message:", error);
    return NextResponse.json(
      { error: "Failed to create chat message", message: error.message },
      { status: 500 }
    );
  }
}
