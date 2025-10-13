import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, question, answer, updatedData } = body;

    if (!sessionId || !question || !answer) {
      return NextResponse.json(
        { error: "sessionId, question, dan answer diperlukan" },
        { status: 400 }
      );
    }

    const brainstorm = await prisma.brainstorm.create({
      data: {
        sessionId,
        question,
        answer,
        updatedData: updatedData ? JSON.stringify(updatedData) : undefined,
      },
    });

    return NextResponse.json({ brainstorm }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to save brainstorm", message: error.message },
      { status: 500 }
    );
  }
}
