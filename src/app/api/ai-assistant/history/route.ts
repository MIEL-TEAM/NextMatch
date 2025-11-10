import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/app/actions/authActions";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active conversation
    const conversation = await prisma.aIConversation.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 50, // Limit to last 50 messages
        },
      },
    });

    // Get daily usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyUsage = await prisma.aIUsageLog.count({
      where: {
        userId,
        action: "chat",
        createdAt: { gte: today },
      },
    });

    const messages = conversation?.messages || [];

    return NextResponse.json({
      conversationId: conversation?.id || null,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
        createdAt: msg.createdAt,
      })),
      dailyUsage,
    });
  } catch (error: any) {
    console.error("AI History Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
