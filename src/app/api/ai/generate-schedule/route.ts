import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateScheduleWithGemini } from "@/features/ai/services/geminiScheduleService";
import {
  generateStudyPriorities,
  calculateCoveragePercentage,
} from "@/features/editorials/services/contentCrossingService";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contestId, examDate, weeklyHours = 40, focusAreas } = body;

    if (!contestId || !examDate) {
      return NextResponse.json(
        { error: "Missing required fields: contestId, examDate" },
        { status: 400 },
      );
    }

    const priorities = await generateStudyPriorities(
      contestId,
      session.user.id,
      weeklyHours,
    );

    const coverage = await calculateCoveragePercentage(
      contestId,
      session.user.id,
    );

    if (priorities.length === 0) {
      return NextResponse.json(
        {
          error:
            "No content mappings found. Add editorial items and map content first.",
        },
        { status: 400 },
      );
    }

    const schedule = await generateScheduleWithGemini({
      contestName: "Civil Service Exam",
      priorities,
      weeklyAvailableHours: weeklyHours,
      examDate: new Date(examDate),
      focusAreas,
    });

    return NextResponse.json({
      success: true,
      schedule,
      coverage,
      priorities,
    });
  } catch (error) {
        return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate schedule",
      },
      { status: 500 },
    );
  }
}
