import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { getAIQuotaStatus } from "@/lib/aiQuota";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.aIConversation.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 50,
        },
      },
    });

    const quotaStatus = await getAIQuotaStatus(userId);
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
      dailyUsage: quotaStatus.limit - quotaStatus.remaining,
      remaining: quotaStatus.remaining,
      limit: quotaStatus.limit,
      tier: quotaStatus.tier,
    });
  } catch (error: any) {
    console.error("AI History Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
