import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = "profile-videos-miel";

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, memberId } = await req.json();

    const key = `videos/${memberId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({
      uploadUrl,
      fileUrl: `https://${BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

// חובה כדי למנוע שגיאת 413 (קובץ גדול מדי)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "200mb",
    },
  },
};
