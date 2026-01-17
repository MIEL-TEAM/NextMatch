import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ type: "email" }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accounts: {
          select: { provider: true },
        },
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ type: "email" }, { status: 200 });
    }

    const isOAuthUser = user.accounts.length > 0;

    return NextResponse.json(
      { type: isOAuthUser ? "oauth" : "email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CHECK_USER_TYPE] Error:", error);
    return NextResponse.json({ type: "email" }, { status: 200 });
  }
}
