import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";
import type { WeeklyData, TrackData } from "@/features/dashboard/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const since = subWeeks(new Date(), 8);

    const sessions = await prisma.studySession.findMany({
      where: { userId, completedAt: { gte: since } },
      select: {
        completedAt: true,
        minutes: true,
        topic: { select: { name: true } },
      },
    });

    const weeklyStats: WeeklyData[] = Array.from({ length: 8 }, (_, i) => {
      const weekAgo = subWeeks(new Date(), 7 - i);
      const wStart = startOfWeek(weekAgo);
      const wEnd = endOfWeek(weekAgo);
      const minutes = sessions
        .filter((s) => s.completedAt >= wStart && s.completedAt <= wEnd)
        .reduce((sum, s) => sum + s.minutes, 0);
      return { week: format(wStart, "dd/MM"), hours: Math.round(minutes / 60) };
    });

    const trackMap = new Map<string, number>();
    for (const s of sessions) {
      const name = s.topic.name;
      trackMap.set(name, (trackMap.get(name) ?? 0) + s.minutes);
    }
    const trackDistribution: TrackData[] = Array.from(trackMap.entries()).map(
      ([name, minutes]) => ({ name, minutes, hours: Math.round(minutes / 60) }),
    );

    return NextResponse.json({ weeklyStats, trackDistribution });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

