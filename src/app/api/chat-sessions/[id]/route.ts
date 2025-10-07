// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;

//   if (!id) {
//     return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
//   }

//   try {
//     const session = await prisma.chatSession.findUnique({
//       where: { id },
//       include: {
//         uploadedFiles: true, 
//         records: {
//           include: {
//             sourceFile: true, 
//           },
//         },
//         brainstorms: true, 
//         messages: true,  
//       },
//     });

//     if (!session) {
//       return NextResponse.json({ error: "Session not found" }, { status: 404 });
//     }

//     return NextResponse.json(session, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching chat session:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch chat session" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;

//   if (!id) {
//     return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
//   }

//   try {
//     await prisma.brainstorm.deleteMany({ where: { sessionId: id } });
//     await prisma.chatMessage.deleteMany({ where: { sessionId: id } });
//     await prisma.record.deleteMany({ where: { chatSessionId: id } });
//     await prisma.uploadedFile.deleteMany({ where: { sessionId: id } });

//     await prisma.chatSession.delete({ where: { id } });

//     return NextResponse.json({ message: "Session deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting chat session:", error);
//     return NextResponse.json(
//       { error: "Failed to delete chat session" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  try {
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        uploadedFiles: true,
        records: {
          include: {
            sourceFile: true,
          },
        },
        brainstorms: true,
        messages: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 }
    );
  }
}