import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateScheduleWithGemini } from "@/features/ai/services/geminiScheduleService";
import { generateStudyPriorities } from "@/features/editorials/services/contentCrossingService";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const contestId = body.contestId as string | null;
    const examDate = body.examDate as string | null;
    const availableHoursPerDay = body.availableHoursPerDay as number | null;

    if (!contestId || !availableHoursPerDay) {
      return NextResponse.json(
        { error: "contestId and availableHoursPerDay are required" },
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
      availableHoursPerDay * 5,
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
      contestName: contest.name,
      priorities,
      weeklyAvailableHours: availableHoursPerDay * 5,
      examDate: effectiveExamDate,
    });

    return NextResponse.json({
      success: true,
      schedule,
      priorities,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate schedule" },
      { status: 500 },
    );
  }
}
