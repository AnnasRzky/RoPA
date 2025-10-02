import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

function makeSafePublicId(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, "")   
    .replace(/\s+/g, "_")      
    .replace(/[^a-zA-Z0-9_-]/g, ""); 
}

export async function GET() {
  try {
    const records = await prisma.record.findMany({
      include: { sourceFile: true, chatSession: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(records, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch records", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const chatSessionId = formData.get("chatSessionId") as string;
    const sourceFileId = formData.get("sourceFileId") as string;
    const finalJson = formData.get("finalJson") as string;
    const file = formData.get("file") as File;

    if (!chatSessionId || !sourceFileId || !file || !finalJson) {
      return NextResponse.json(
        { error: "chatSessionId, sourceFileId, finalJson, and file are required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString("base64")}`;

    const safeName = makeSafePublicId(file.name);

    const uploadResponse = await cloudinary.uploader.upload(base64File, {
      folder: "ropa/results",
      resource_type: "raw",
      public_id: `${safeName}.xlsx`, 
      format: "xlsx",                 
      overwrite: true,
    });

    const record = await prisma.record.create({
      data: {
        fileName: `${safeName}.xlsx`, 
        resultFileUrl: uploadResponse.secure_url,
        data: JSON.parse(finalJson),
        chatSessionId,
        sourceFileId,
      },
      include: { sourceFile: true, chatSession: true },
    });

    return NextResponse.json(
      { message: "Record created successfully", record },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating record:", error);
    return NextResponse.json(
      { error: "Failed to create record", message: error.message },
      { status: 500 }
    );
  }
}