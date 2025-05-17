import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const { url, memberId } = await req.json();

    if (!url || !memberId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: {
        url,
        memberId,
        duration: 0, // Optional: update later with metadata if needed
        isApproved: true,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error saving video metadata:", error);
    return NextResponse.json(
      { error: "שגיאה בשמירת הווידאו" },
      { status: 500 }
    );
  }
}
