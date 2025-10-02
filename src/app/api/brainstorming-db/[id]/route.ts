import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "ChatSession ID is required" }, { status: 400 });
  }

  try {
    const brainstorms = await prisma.brainstorm.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(brainstorms, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch brainstorms", message: error.message },
      { status: 500 }
    );
  }
}
