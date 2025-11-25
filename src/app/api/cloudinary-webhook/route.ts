import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const signature = headersList.get("x-cld-signature");
  const timestamp = headersList.get("x-cld-timestamp");

  if (!signature || !timestamp) {
    return new Response("Missing signature headers", { status: 401 });
  }

  const rawBody = await req.text();

  // Verify Cloudinary signature
  const expectedSignature = crypto
    .createHash("sha256")
    .update(rawBody + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("❌ Invalid Cloudinary webhook signature");
    return new Response("Invalid signature", { status: 401 });
  }

  let bodyObj: any;
  try {
    bodyObj = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ Failed to parse JSON body:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  if (bodyObj.notification_type !== "moderation") {
    return new Response("Ignored (not moderation)", { status: 200 });
  }

  const publicId = bodyObj.public_id;
  const moderationStatus = bodyObj.moderation_status;
  const isApproved = moderationStatus === "approved";

  try {
    await prisma.photo.update({
      where: { publicId },
      data: { isApproved },
    });

    console.log(
      `✅ Updated photo ${publicId}: ${isApproved ? "Approved" : "Rejected"}`
    );

    return new Response("Success", { status: 200 });
  } catch (err) {
    console.error("❌ Error updating photo:", err);
    return new Response("Database update error", { status: 500 });
  }
}
