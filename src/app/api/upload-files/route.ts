// app/api/upload-files/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const sessionId = formData.get("sessionId") as string;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadedResults = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

      // Upload ke Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(base64File, {
        folder: "ropa/uploads",
        resource_type: "auto",
      });

      // Simpan di database
      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          fileName: file.name,
          fileUrl: uploadResponse.secure_url,
          fileType: file.type,
          sessionId,
        },
      });

      uploadedResults.push(uploadedFile);
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedResults,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
