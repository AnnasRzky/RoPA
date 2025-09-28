// app/api/brainstorming-db/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ChatSession ID is required" }, { status: 400 });
    }

    const brainstorms = await prisma.brainstorm.findMany({
      where: {
        sessionId: id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      message: "Brainstorming history fetched successfully",
      brainstorms,
    });
  } catch (error) {
    console.error("Error fetching brainstorm history:", error);
    return NextResponse.json({ error: "Failed to fetch brainstorming history" }, { status: 500 });
  }
}
