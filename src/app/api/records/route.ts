// // app/api/record/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import cloudinary from "@/lib/cloudinary";

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();

//     const chatSessionId = formData.get("chatSessionId") as string;
//     const sourceFileId = formData.get("sourceFileId") as string;
//     const finalJson = formData.get("finalJson") as string;
//     const file = formData.get("file") as File;

//     if (!chatSessionId || !sourceFileId || !file || !finalJson) {
//       return NextResponse.json(
//         { error: "chatSessionId, sourceFileId, finalJson, and file are required" },
//         { status: 400 }
//       );
//     }

//     // Upload file hasil ke Cloudinary
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

//     const uploadResponse = await cloudinary.uploader.upload(base64File, {
//       folder: "ropa/results",
//       resource_type: "raw", // XLSX dianggap file raw
//       public_id: file.name.replace(/\.[^/.]+$/, ""), // tanpa ekstensi
//     });

//     // Simpan ke database
//     const record = await prisma.record.create({
//       data: {
//         fileName: file.name,
//         resultFileUrl: uploadResponse.secure_url,
//         data: JSON.parse(finalJson),
//         chatSessionId,
//         sourceFileId,
//       },
//     });

//     return NextResponse.json({
//       message: "Record created successfully",
//       record,
//     });
//   } catch (error) {
//     console.error("Error creating record:", error);
//     return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
//   }
// }
  
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

/**
 * GET /api/records
 * Mengambil semua record beserta relasi sourceFile dan chatSession
 */
export async function GET() {
  try {
    console.log("🔥 [GET] /api/records endpoint hit");

    const records = await prisma.record.findMany({
      include: {
        sourceFile: true,
        chatSession: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`✅ Records fetched: ${records.length} items`);
    return NextResponse.json(records, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching records:", error);
    return NextResponse.json(
      { error: "Failed to fetch records", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/records
 * Simpan hasil analisis ke database dan upload file hasil ke Cloudinary
 */
export async function POST(req: Request) {
  try {
    console.log("🔥 [POST] /api/records endpoint hit");

    const formData = await req.formData();
    const chatSessionId = formData.get("chatSessionId") as string;
    const sourceFileId = formData.get("sourceFileId") as string;
    const finalJson = formData.get("finalJson") as string;
    const file = formData.get("file") as File;

    console.log("📥 Received Data:", {
      chatSessionId,
      sourceFileId,
      finalJsonExists: !!finalJson,
      fileName: file?.name || null,
    });

    // Validasi input
    if (!chatSessionId || !sourceFileId || !file || !finalJson) {
      return NextResponse.json(
        { error: "chatSessionId, sourceFileId, finalJson, and file are required" },
        { status: 400 }
      );
    }

    // Convert file ke Base64 untuk upload ke Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    console.log(`📤 Uploading file "${file.name}" to Cloudinary...`);

    const uploadResponse = await cloudinary.uploader.upload(base64File, {
      folder: "ropa/results",
      resource_type: "raw",
      public_id: file.name.replace(/\.[^/.]+$/, ""), // tanpa ekstensi
    });

    console.log("✅ File uploaded to Cloudinary:", {
      url: uploadResponse.secure_url,
      size: uploadResponse.bytes,
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
      include: {
        sourceFile: true,
        chatSession: true,
      },
    });

    console.log("✅ Record saved successfully:", record.id);

    return NextResponse.json(
      { message: "Record created successfully", record },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error creating record:", error);
    return NextResponse.json(
      { error: "Failed to create record", message: error.message },
      { status: 500 }
    );
  }
}
