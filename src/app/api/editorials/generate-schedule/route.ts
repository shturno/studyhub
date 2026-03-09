import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateScheduleWithGemini } from "@/features/ai/services/scheduleGenerationService";
import { generateStudyPriorities } from "@/features/editorials/services/contentCrossingService";
import { prisma } from "@/lib/prisma";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const contestId = body.contestId as string | null;
    const examDate = body.examDate as string | null;
    const dailyAvailableHours = body.dailyAvailableHours as Record<string, number> | null;

    if (!contestId || !dailyAvailableHours) {
      return NextResponse.json(
        { error: "contestId and dailyAvailableHours are required" },
        { status: 400 },
      );
    }

    const weeklyTotal = Object.values(dailyAvailableHours).reduce((a, b) => a + b, 0);
    if (weeklyTotal <= 0) {
      return NextResponse.json(
        { error: "At least one day must have available hours" },
        { status: 400 },
      );
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (contest?.userId !== session.user.id) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const priorities = await generateStudyPriorities(
      contestId,
      session.user.id,
      weeklyTotal,
    );

    if (priorities.length === 0) {
      return NextResponse.json(
        { error: "No topics found to generate schedule" },
        { status: 400 },
      );
    }

    const effectiveExamDate = examDate
      ? new Date(examDate)
      : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);

    const schedule = await generateScheduleWithGemini({
      contestsInfo: [{ id: contest.id, name: contest.name, examDate: contest.examDate }],
      priorities,
      weeklyAvailableHours: weeklyTotal,
      dailyAvailableHours: dailyAvailableHours as Record<
        "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
        number
      >,
      examDate: effectiveExamDate,
    });

    return NextResponse.json({
      success: true,
      schedule: {
        ...schedule,
        priorities,
      },
    });
  } catch (error) {
    console.error("Generate schedule error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate schedule";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
