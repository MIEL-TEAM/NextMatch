import { S3Client } from "@aws-sdk/client-s3";

export type AllowedVideoType =
  | "video/mp4"
  | "video/quicktime"
  | "video/x-msvideo";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const S3_BUCKET_NAME =
  process.env.AWS_S3_BUCKET_NAME || "profile-videos-miel";

export const VIDEO_UPLOAD_CONFIG = {
  maxFileSize: 100 * 1024 * 1024,
  allowedTypes: [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
  ] as AllowedVideoType[],
  maxDuration: 60,
};
