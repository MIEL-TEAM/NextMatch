import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("📦 Webhook received:", body);

  if (body.notification_type !== "moderation") {
    return new Response("Ignored (not moderation)", { status: 200 });
  }

  const publicId = body.public_id;
  const moderationStatus = body.moderation_status;

  const isApproved = moderationStatus === "approved";

  try {
    await prisma.photo.update({
      where: { publicId },
      data: { isApproved },
    });

    console.log(`✅ Updated photo ${publicId} to isApproved = ${isApproved}`);
    return new Response("Success", { status: 200 });
  } catch (err) {
    console.error("❌ Error updating photo:", err);
    return new Response("Error", { status: 500 });
  }
}
