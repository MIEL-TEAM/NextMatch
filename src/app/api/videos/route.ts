import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadVideoToS3 } from "@/lib/video-upload";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const memberId = formData.get("memberId") as string | null;

    if (!file || !memberId) {
      return NextResponse.json(
        { error: "חסרים קובץ וזיהוי חבר" },
        { status: 400 }
      );
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "הקובץ גדול מדי" }, { status: 400 });
    }

    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "סוג קובץ לא נתמך. יש להשתמש ב-MP4, MOV או AVI בלבד" },
        { status: 400 }
      );
    }

    const videoUrl = await uploadVideoToS3(file, session.user.id);

    const video = await prisma.video.create({
      data: {
        url: videoUrl,
        memberId,
        duration: 0,
        isApproved: true,
      },
    });

    return NextResponse.json(video, {
      status: 201,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "שגיאה בהעלאת וידאו";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "נדרש זיהוי חבר" }, { status: 400 });
    }

    const videos = await prisma.video.findMany({
      where: {
        memberId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(videos, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "שגיאה בטעינת הסרטונים" },
      { status: 500 }
    );
  }
}
