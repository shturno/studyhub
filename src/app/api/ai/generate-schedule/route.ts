import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateScheduleWithGemini } from "@/features/ai/services/scheduleGenerationService";
import { getMultiContestScheduleData } from "@/features/contests/actions";
import {
  computeMultiContestPriorities,
} from "@/features/study-cycle/services/multiContestPriorityService";
import type { DayKey } from "@/features/ai/types";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      contestIds,
      // Legacy single-contest support (fallback)
      contestId,
      examDate,
      weeklyHours = 40,
      focusAreas,
      dailyHours,
    } = body as {
      contestIds?: string[];
      contestId?: string;
      examDate?: string;
      weeklyHours?: number;
      focusAreas?: string[];
      dailyHours?: Partial<Record<DayKey, number>>;
    };

    const resolvedContestIds =
      contestIds && contestIds.length > 0
        ? contestIds
        : contestId
          ? [contestId]
          : null;

    if (!resolvedContestIds || resolvedContestIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: contestIds" },
        { status: 400 },
      );
    }

    // Fetch enriched contest data (subjects, topics, studied minutes)
    const contestsData = await getMultiContestScheduleData(resolvedContestIds);
    if (contestsData.length === 0) {
      return NextResponse.json(
        { error: "No contests found for the provided IDs." },
        { status: 400 },
      );
    }

    // Determine exam date: use provided or pick the LATEST across all contests.
    // The schedule should cover the full prep period — even after the first exam
    // the user continues studying for the remaining contests.
    let resolvedExamDate: Date;
    if (examDate) {
      resolvedExamDate = new Date(examDate);
    } else {
      const dates = contestsData
        .map((c) => c.examDate)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());

      if (dates.length === 0) {
        // Default to 6 months from now if no exam date is set
        resolvedExamDate = new Date();
        resolvedExamDate.setMonth(resolvedExamDate.getMonth() + 6);
      } else {
        resolvedExamDate = dates[dates.length - 1];
      }
    }

    // Compute priorities across all contests
    const priorities = computeMultiContestPriorities(contestsData, weeklyHours);

    if (priorities.length === 0) {
      return NextResponse.json(
        {
          error:
            "No topics found. Add subjects and topics to your contests first.",
        },
        { status: 400 },
      );
    }

    // Build daily hours map
    const defaultDailyHours = weeklyHours / 5;
    const dailyAvailableHours: Record<DayKey, number> = {
      monday: dailyHours?.monday ?? defaultDailyHours,
      tuesday: dailyHours?.tuesday ?? defaultDailyHours,
      wednesday: dailyHours?.wednesday ?? defaultDailyHours,
      thursday: dailyHours?.thursday ?? defaultDailyHours,
      friday: dailyHours?.friday ?? defaultDailyHours,
      saturday: dailyHours?.saturday ?? 0,
      sunday: dailyHours?.sunday ?? 0,
    };

    const schedule = await generateScheduleWithGemini({
      contestsInfo: contestsData.map((c) => ({
        id: c.id,
        name: c.name,
        examDate: c.examDate,
      })),
      priorities,
      weeklyAvailableHours: weeklyHours,
      dailyAvailableHours,
      examDate: resolvedExamDate,
      focusAreas,
    });

    return NextResponse.json({
      success: true,
      schedule,
      priorities,
      contests: contestsData.map((c) => ({
        id: c.id,
        name: c.name,
        examDate: c.examDate?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    console.error("[Generate Schedule] Error:", error);
    const errorDetails =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[Generate Schedule] Details: ${errorDetails}`);

    return NextResponse.json(
      { error: "Failed to generate schedule" },
      { status: 500 },
    );
  }
}
