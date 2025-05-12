import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const body = await req.json();
    const { fileUrl, memberId } = body;

    if (!fileUrl || !memberId) {
      return NextResponse.json(
        { error: "חסרים פרטי קובץ או זיהוי חבר" },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        url: fileUrl,
        memberId,
        duration: 0,
        isApproved: true,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error saving video:", error);
    return NextResponse.json(
      { error: "שגיאה בשמירת פרטי וידאו" },
      { status: 500 }
    );
  }
}
