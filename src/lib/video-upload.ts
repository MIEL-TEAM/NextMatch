import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME, VIDEO_UPLOAD_CONFIG } from "./aws-config";

export async function uploadVideoToS3(
  file: File,
  userId: string
): Promise<string> {
  if (file.size > VIDEO_UPLOAD_CONFIG.maxFileSize) {
    throw new Error("File size exceeds maximum limit");
  }

  // Get file type, ensure it's valid or use a default
  let fileType = file.type || "video/mp4";

  // Handle the compressed webm case, but use mp4 extension for better compatibility
  if (fileType === "video/webm") {
    fileType = "video/mp4";
  }

  // For safety, check if the file type is in allowed types
  const allowedMimeTypes = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ];
  if (!allowedMimeTypes.includes(fileType)) {
    throw new Error(`Invalid file type: ${fileType}`);
  }

  // Get extension from file name or from mime type
  let fileExtension = "";
  if (file.name.includes(".")) {
    fileExtension = file.name.split(".").pop() || "mp4";
  } else {
    // Extract extension from mime type
    const mimeToExt: Record<string, string> = {
      "video/mp4": "mp4",
      "video/quicktime": "mov",
      "video/x-msvideo": "avi",
      "video/webm": "mp4", // Using mp4 for webm for better compatibility
    };
    fileExtension = mimeToExt[fileType] || "mp4";
  }

  // Ensure extension is lowercase
  fileExtension = fileExtension.toLowerCase();

  // Normalize extension to one of the supported types
  if (!["mp4", "mov", "avi"].includes(fileExtension)) {
    fileExtension = "mp4"; // Default to mp4 for any other extension
  }

  // Create unique filename
  const fileName = `videos/${userId}-${Date.now()}.${fileExtension}`;

  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: fileType,
    });

    await s3Client.send(command);

    // Return the S3 URL
    return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
}

export async function deleteVideoFromS3(videoUrl: string): Promise<void> {
  try {
    // Extract key from URL
    const key = videoUrl.split(".com/")[1];

    if (!key) {
      throw new Error("Invalid video URL format");
    }

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw error;
  }
}
