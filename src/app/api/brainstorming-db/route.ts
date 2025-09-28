import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const brainstorms = await prisma.brainstorm.findMany({
      include: { session: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(brainstorms);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch brainstorms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const brainstorming = await prisma.brainstorm.create({
      data: {
        question: body.question,
        answer: body.answer,
        updatedData: body.updatedData || null,
        sessionId: body.sessionId,
      },
    });

    return NextResponse.json(brainstorming);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
