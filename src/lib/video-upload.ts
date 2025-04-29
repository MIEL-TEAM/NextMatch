import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME, VIDEO_UPLOAD_CONFIG } from "./aws-config";

export async function uploadVideoToS3(
  file: File,
  userId: string
): Promise<string> {
  if (file.size > VIDEO_UPLOAD_CONFIG.maxFileSize) {
    throw new Error("File size exceeds maximum limit");
  }

  if (!VIDEO_UPLOAD_CONFIG.allowedTypes.includes(file.type as any)) {
    throw new Error("Invalid file type");
  }

  const fileExtension = file.name.split(".").pop() || "mp4";
  const fileName = `videos/${userId}-${Date.now()}.${fileExtension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);

  return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
}

export async function deleteVideoFromS3(videoUrl: string): Promise<void> {
  const key = videoUrl.split(".com/")[1];

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}
