// app/api/record/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

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

    // Upload file hasil ke Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResponse = await cloudinary.uploader.upload(base64File, {
      folder: "ropa/results",
      resource_type: "raw", // XLSX dianggap file raw
      public_id: file.name.replace(/\.[^/.]+$/, ""), // tanpa ekstensi
    });

    // Simpan ke database
    const record = await prisma.record.create({
      data: {
        fileName: file.name,
        resultFileUrl: uploadResponse.secure_url,
        data: JSON.parse(finalJson),
        chatSessionId,
        sourceFileId,
      },
    });

    return NextResponse.json({
      message: "Record created successfully",
      record,
    });
  } catch (error) {
    console.error("Error creating record:", error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
