import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Create S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: Request) {
  try {
    // Verify authentication first
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    // Parse request
    const { fileName, fileType, memberId } = await req.json();

    if (!fileName || !fileType || !memberId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: `File type not allowed: ${fileType}` },
        { status: 400 }
      );
    }

    // Generate a unique key for the file
    const timestamp = Date.now();
    const randomPart = uuidv4().split("-")[0];
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

    const key = `videos/${memberId}/${timestamp}-${randomPart}-${safeFileName}`;

    console.log("Creating signed URL with:", {
      bucket: process.env.AWS_S3_BUCKET_NAME || "profile-videos-miel",
      key,
      contentType: fileType,
    });

    // Create command with specific Content-Type and ACL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "profile-videos-miel",
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
    });

    // Get a signed URL that's valid for 15 minutes
    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 900, // 15 minutes in seconds
    });

    // Construct the final URL where the file will be publicly accessible
    const bucketDomain =
      process.env.AWS_PUBLIC_BUCKET_DOMAIN ||
      "profile-videos-miel.s3.eu-north-1.amazonaws.com";
    const fileUrl = `https://${bucketDomain}/${key}`;

    console.log("Generated signed URL successfully");

    return NextResponse.json({ uploadUrl, fileUrl });
  } catch (err) {
    console.error("Failed to generate signed URL:", err);
    return NextResponse.json(
      {
        error: "Error generating signed URL",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
