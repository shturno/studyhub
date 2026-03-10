import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  type ScheduleRequest,
  type GeneratedSchedule,
} from "@/features/ai/types";
import { type StudyAreaPriority } from "@/features/editorials/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateScheduleChunk(
  contestsDescription: string,
  priorities: StudyAreaPriority[],
  startDate: Date,
  endDate: Date,
  dailyAvailableHours: Record<
    "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
    number
  >,
  chunkNumber: number,
): Promise<GeneratedSchedule> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prioritiesText = priorities
      .map(
        (p) => {
          const contestTag = p.contestName ? ` [${p.contestName}]` : "";
          return `- ${p.topicName}${contestTag} (${p.subjectName ?? ""}): ${p.priority} priority (${p.recommendedHours}h/semana) - ${p.reason}`;
        },
      )
      .join("\n");

    const daysUntilExamEnd = Math.ceil(
      (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    const dayNames = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;
    const dayLabels = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ] as const;
    const dailyBreakdown = dayNames
      .map((day, idx) => {
        const hours = dailyAvailableHours[day] || 0;
        return `- ${dayLabels[idx]}: ${hours}h`;
      })
      .join("\n");

    const prompt = buildScheduleChunkPrompt(
      contestsDescription,
      prioritiesText,
      dailyBreakdown,
      daysUntilExamEnd,
      startDate,
      endDate,
      chunkNumber,
    );

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const schedule = JSON.parse(jsonMatch[0]) as GeneratedSchedule;
    return schedule;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate schedule chunk";
    throw new Error(`Failed to generate schedule chunk ${chunkNumber}: ${message}`);
  }
}

export async function generateScheduleWithGemini(
  request: ScheduleRequest,
): Promise<GeneratedSchedule> {
  try {
    const startDate = new Date();
    const endDate = request.examDate;
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const CHUNK_DAYS = 28;
    // Ensure at least 1 chunk even if exam date is very close or in the past
    const chunkCount = Math.max(1, Math.ceil(totalDays / CHUNK_DAYS));

    // Build human-readable contest description for the Gemini prompt
    const contestsDescription = request.contestsInfo
      .map((c) => {
        const examStr = c.examDate
          ? `(prova: ${c.examDate.toLocaleDateString("pt-BR")})`
          : "(sem data definida)";
        return `${c.name} ${examStr}`;
      })
      .join(", ");

    const chunkPromises = [];
    for (let i = 0; i < chunkCount; i++) {
      const chunkStartDate = new Date(
        startDate.getTime() + i * CHUNK_DAYS * 24 * 60 * 60 * 1000,
      );
      let chunkEndDate = new Date(
        chunkStartDate.getTime() + CHUNK_DAYS * 24 * 60 * 60 * 1000,
      );

      if (chunkEndDate > endDate) {
        chunkEndDate = endDate;
      }

      chunkPromises.push(
        generateScheduleChunk(
          contestsDescription,
          request.priorities,
          chunkStartDate,
          chunkEndDate,
          request.dailyAvailableHours,
          i + 1,
        ),
      );
    }

    const chunkResults = await Promise.all(chunkPromises);

    const mergedSchedule = mergeScheduleChunks(chunkResults, request.examDate);
    return mergedSchedule;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate schedule";
    throw new Error(`Failed to generate schedule: ${message}`);
  }
}

function mergeScheduleChunks(
  chunks: GeneratedSchedule[],
  examDate: Date,
): GeneratedSchedule {
  const allDailySessions = chunks.flatMap((c) => c.dailySessions);
  const allWeeklySummaries = chunks.flatMap((c) => c.weeklySummary);
  const allMonthlySummaries = chunks.flatMap((c) => c.monthlySummary);

  const totalHours = allDailySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
  const uniqueDays = new Set(allDailySessions.map((s) => s.day.split(" ")[0])).size;

  const topicCoverageMap = new Map<
    string,
    { sessions: number; totalHours: number }
  >();
  for (const session of allDailySessions) {
    for (const topic of session.topics) {
      const existing = topicCoverageMap.get(topic) || {
        sessions: 0,
        totalHours: 0,
      };
      existing.sessions += 1;
      existing.totalHours += session.duration / 60;
      topicCoverageMap.set(topic, existing);
    }
  }

  const weeklySessions = allWeeklySummaries.sort(
    (a, b) => b.totalHours - a.totalHours,
  );
  const peakWeek = weeklySessions[0]?.week || 1;

  return {
    weeks: Math.ceil(allWeeklySummaries.length),
    totalHours,
    dailySessions: allDailySessions,
    weeklySummary: allWeeklySummaries,
    monthlySummary: allMonthlySummaries,
    fullScheduleOverview: {
      totalDaysOfStudy: uniqueDays,
      averageDailyHours: parseFloat(
        (totalHours / Math.max(uniqueDays, 1)).toFixed(1),
      ),
      peakIntensityWeek: peakWeek,
      topicsCoverage: Array.from(topicCoverageMap.entries()).map(
        ([topic, data]) => ({
          topic,
          sessions: data.sessions,
          totalHours: parseFloat(data.totalHours.toFixed(1)),
          priority: "medium" as const,
        }),
      ),
    },
    keyMilestones: [
      `Week ${Math.ceil(allWeeklySummaries.length / 4)}: Key review phases`,
      `Final week: Intensive review & mock exams before ${examDate.toLocaleDateString("pt-BR")}`,
    ],
    tips: [
      "Review high-frequency topics daily",
      "Practice questions for topics learned 3-4 days prior",
      "Increase intensity in final weeks",
    ],
  };
}

function buildScheduleChunkPrompt(
  contestsDescription: string,
  prioritiesText: string,
  dailyBreakdown: string,
  daysUntilExamEnd: number,
  startDate: Date,
  endDate: Date,
  chunkNumber: number,
): string {
  return `
You are an expert study planner helping a Brazilian civil service exam candidate prepare for: ${contestsDescription}.

THIS IS CHUNK ${chunkNumber} of a multi-part study schedule.
Period: ${startDate.toLocaleDateString("pt-BR")} to ${endDate.toLocaleDateString("pt-BR")} (approximately 4 weeks / 28 days)

## Study Priorities (weighted by exam proximity, subject weight and current progress):
${prioritiesText}

## CRITICAL: Topic Names Rule
You MUST use the EXACT topic names as listed above (including contest tag like [Concurso X]).
Do NOT paraphrase, abbreviate or invent topic names.

## Study Parameters for this chunk:
Daily Study Availability:
${dailyBreakdown}
- Time until nearest exam: ${daysUntilExamEnd} days remaining
- Days with 0h are rest days — DO NOT schedule sessions on these days

## Critical Rules:
1. **FOCUS ON THIS PERIOD ONLY**: Generate sessions ONLY between ${startDate.toLocaleDateString("pt-BR")} and ${endDate.toLocaleDateString("pt-BR")}
2. **DAILY SESSIONS**: Create ONE entry per day with specific times and durations
3. **SPACED REPETITION**: High-priority topics should repeat 2-3 times within this chunk
4. **PROGRESSION**: Build on previous weeks' topics (assume prior chunks covered foundations if chunk > 1)
5. **MULTI-CONTEST BALANCE**: Distribute topics across contests proportionally to their assigned hours

## Task:
Create a complete day-by-day study schedule for THIS PERIOD ONLY that:
1. Covers every calendar day from startDate to endDate (approximately 28 days)
2. Allocates exact topics for each study session using the exact names from the priorities list
3. Incorporates review sessions (every 3-4 days for high-priority topics)
4. Provides clear justification for each day's focus
5. Adjusts intensity based on proximity to exam

Provide the schedule in this JSON format (for this 4-week chunk only):
{
  "weeks": 4,
  "totalHours": <total study hours for this 28-day period>,
  "dailySessions": [
    {
      "day": "2026-03-02 (Monday)",
      "timeSlot": "08:00-10:00",
      "topics": ["Exact Topic Name [Contest Name]"],
      "duration": 120,
      "focus": "Initial learning / Deep study / Practice / Review / Mock exam",
      "reason": "Foundation phase: high-priority topic"
    }
  ],
  "weeklySummary": [
    {
      "week": 1,
      "startDate": "2026-03-02",
      "endDate": "2026-03-08",
      "totalHours": 20,
      "topics": ["Topic A", "Topic B"],
      "focus": "Foundation & Initial Learning",
      "keyActivities": ["Intro to Topic A", "First practice with Topic B"]
    }
  ],
  "monthlySummary": [],
  "fullScheduleOverview": {
    "totalDaysOfStudy": 28,
    "averageDailyHours": 2.5,
    "peakIntensityWeek": 2,
    "topicsCoverage": [
      {
        "topic": "Constitutional Law",
        "sessions": 8,
        "totalHours": 12,
        "priority": "high"
      }
    ]
  },
  "keyMilestones": ["Week 1: Complete Topic A foundation", "Week 2-3: Practice and review"],
  "tips": ["Review Topic A daily", "Practice questions after each session"]
}

**IMPORTANT**:
- Return ONLY valid JSON, no additional text
- Generate schedule ONLY for the provided date range (this 4-week chunk)
- Generate dailySessions for EVERY DAY in the period (approximately 28 entries)
- Use EXACT topic names from the priorities list
- Each dailySessions entry is ONE DAY of study with explicit time slots
- weeklySummary: group daily sessions into weeks (4 weeks in this chunk)
- monthlySummary: leave empty [] unless chunk crosses month boundary
- fullScheduleOverview: statistics for THIS CHUNK ONLY (not entire exam prep)
- Dates must be in YYYY-MM-DD format
- Do NOT generate sessions beyond the endDate provided
`;
}
