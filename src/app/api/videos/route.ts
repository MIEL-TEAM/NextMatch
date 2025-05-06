import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadVideoToS3 } from "@/lib/video-upload";
import { prisma } from "@/lib/prisma";

// Configure API route to handle large file uploads
export const config = {
  api: {
    bodyParser: false, // Disable the built-in bodyParser to handle large files
    responseLimit: '100mb',
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const memberId = formData.get("memberId") as string | null;

    // Extra debugging info from client
    const filename = (formData.get("filename") as string) || null;
    const filesize = (formData.get("filesize") as string) || null;
    const filetype = (formData.get("filetype") as string) || null;

    // Log information to help debug
    console.log("Received file upload:", {
      filename,
      filesize,
      filetype,
      receivedType: file?.type,
      receivedSize: file?.size,
      memberId,
    });

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

    // Expanded allowed types to include webm which our compression creates
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];

    // Check if file type is in allowed types
    // Also handle cases where filetype might be empty or webm
    const contentType = file.type || filetype || "video/mp4";
    const isAllowedType = allowedTypes.some((type) =>
      contentType.toLowerCase().includes(type.split("/")[1])
    );

    if (!isAllowedType) {
      return NextResponse.json(
        {
          error: `סוג קובץ לא נתמך: ${contentType}. יש להשתמש ב-MP4, MOV או AVI בלבד`,
          receivedType: contentType,
        },
        { status: 400 }
      );
    }

    // Attempt to upload video to S3
    try {
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
    } catch (uploadError) {
      console.error("Error uploading to S3:", uploadError);
      return NextResponse.json(
        {
          error: "שגיאה בהעלאה לשרת",
          details:
            uploadError instanceof Error
              ? uploadError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Video upload error:", error);

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
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת הסרטונים" },
      { status: 500 }
    );
  }
}
