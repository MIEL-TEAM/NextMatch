import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "@/lib/aws-config";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const body = await req.json();
    const { fileType, fileExtension } = body;

    const fileName = `videos/${session.user.id}-${Date.now()}.${
      fileExtension || "mp4"
    }`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType || "video/mp4",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    return NextResponse.json({
      uploadUrl: presignedUrl,
      fileKey: fileName,
      fileUrl: `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`,
    });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json(
      { error: "שגיאה ביצירת קישור להעלאה" },
      { status: 500 }
    );
  }
}
