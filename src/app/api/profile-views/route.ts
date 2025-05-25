import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/app/actions/authActions";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all profile views for the current user
    const profileViews = await prisma.profileView.findMany({
      where: {
        viewedId: userId, // Corrected field name based on schema
      },
      orderBy: {
        viewedAt: "desc", // Corrected field name based on schema
      },
      include: {
        viewer: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      take: 50, // Limit to most recent 50 views
    });

    // Map to the expected format
    const formattedViews = profileViews.map((view) => ({
      id: view.id,
      name: view.viewer?.name || "משתמש אנונימי",
      image: view.viewer?.image || undefined,
      viewedAt: view.viewedAt.toISOString(),
      seen: false, // Default value as it might not exist in schema
    }));

    return NextResponse.json(formattedViews);
  } catch (error) {
    console.error("Error fetching profile views:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
