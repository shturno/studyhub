import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { difficultSubjects?: string[] };
    const difficultSubjects = body.difficultSubjects || [];

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentSettings =
      typeof user.settings === "object" && user.settings !== null
        ? user.settings
        : {};

    const updatedSettings = {
      ...currentSettings,
      difficultSubjects,
    };

    const today = format(new Date(), "yyyy-MM-dd");

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { settings: updatedSettings },
      }),
      prisma.dailyObligation.deleteMany({
        where: { userId: session.user.id, date: today },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
