import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  type ScheduleRequest,
  type GeneratedSchedule,
} from "@/features/ai/types";
import { type StudyAreaPriority } from "@/features/editorials/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generate schedule for a specific 4-week chunk (used for chunked generation)
 */
export async function generateScheduleChunk(
  contestName: string,
  priorities: StudyAreaPriority[],
  startDate: Date,
  endDate: Date,
  dailyAvailableHours: Record<"monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday", number>,
  chunkNumber: number,
): Promise<GeneratedSchedule> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prioritiesText = priorities
      .map(
        (p) =>
          `- ${p.topicName}: ${p.priority} priority (${p.recommendedHours}h/semana) - ${p.reason}`,
      )
      .join("\n");

    const daysUntilExamEnd = Math.ceil(
      (endDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
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

    const prompt = `
You are an expert study planner helping a Brazilian civil service exam candidate prepare for "${contestName}".

THIS IS CHUNK ${chunkNumber} of a multi-part study schedule.
Period: ${startDate.toLocaleDateString("pt-BR")} to ${endDate.toLocaleDateString("pt-BR")} (approximately 4 weeks / 28 days)

## Study Priorities (by frequency & importance):
${prioritiesText}

## Study Parameters for this chunk:
Daily Study Availability:
${dailyBreakdown}
- Time until exam: ${daysUntilExamEnd} days remaining
- Days with 0h are rest days — DO NOT schedule sessions on these days

## Critical Rules:
1. **FOCUS ON THIS PERIOD ONLY**: Generate sessions ONLY between ${startDate.toLocaleDateString("pt-BR")} and ${endDate.toLocaleDateString("pt-BR")}
2. **DAILY SESSIONS**: Create ONE entry per day with specific times and durations
3. **SPACED REPETITION**: High-priority topics should repeat 2-3 times within this chunk
4. **PROGRESSION**: Build on previous weeks' topics (assume prior chunks covered foundations if chunk > 1)

## Task:
Create a complete day-by-day study schedule for THIS PERIOD ONLY that:
1. Covers every calendar day from startDate to endDate (approximately 28 days)
2. Allocates exact topics for each study session
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
      "topics": ["Specific Topic Name"],
      "duration": 120,
      "focus": "Initial learning / Deep study / Practice / Review / Mock exam",
      "reason": "Foundation phase: high-priority topic appearing in 3 editorials"
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
- Include specific topic names (not generic "Topic 1")
- Each dailySessions entry is ONE DAY of study with explicit time slots
- weeklySummary: group daily sessions into weeks (4 weeks in this chunk)
- monthlySummary: leave empty [] unless chunk crosses month boundary
- fullScheduleOverview: statistics for THIS CHUNK ONLY (not entire exam prep)
- Dates must be in YYYY-MM-DD format
- Do NOT generate sessions beyond the endDate provided
`;

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
    console.error(`Gemini schedule generation error (chunk ${chunkNumber}):`, message, error);
    throw new Error(`Failed to generate schedule chunk ${chunkNumber}: ${message}`);
  }
}

export async function generateScheduleWithGemini(
  request: ScheduleRequest,
): Promise<GeneratedSchedule> {
  try {
    // Calculate chunks: 4 weeks per chunk
    const startDate = new Date();
    const endDate = request.examDate;
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const CHUNK_DAYS = 28; // 4 weeks
    const chunkCount = Math.ceil(totalDays / CHUNK_DAYS);

    console.log(
      `Generating ${chunkCount} chunks (${totalDays} days total, ${CHUNK_DAYS} days per chunk)`,
    );

    const chunks: GeneratedSchedule[] = [];

    // Generate each chunk in parallel
    const chunkPromises = [];
    for (let i = 0; i < chunkCount; i++) {
      const chunkStartDate = new Date(
        startDate.getTime() + i * CHUNK_DAYS * 24 * 60 * 60 * 1000,
      );
      let chunkEndDate = new Date(
        chunkStartDate.getTime() + CHUNK_DAYS * 24 * 60 * 60 * 1000,
      );

      // Don't exceed exam date
      if (chunkEndDate > endDate) {
        chunkEndDate = endDate;
      }

      chunkPromises.push(
        generateScheduleChunk(
          request.contestName,
          request.priorities,
          chunkStartDate,
          chunkEndDate,
          request.dailyAvailableHours,
          i + 1,
        ),
      );
    }

    const chunkResults = await Promise.all(chunkPromises);
    chunks.push(...chunkResults);

    // Merge all chunks into single schedule
    const mergedSchedule = mergeScheduleChunks(chunks, request.examDate);
    return mergedSchedule;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate schedule";
    console.error("Gemini schedule generation error:", message, error);
    throw new Error(`Failed to generate schedule: ${message}`);
  }
}

/**
 * Merge multiple schedule chunks into a single unified schedule
 */
function mergeScheduleChunks(
  chunks: GeneratedSchedule[],
  examDate: Date,
): GeneratedSchedule {
  const allDailySessions = chunks.flatMap((c) => c.dailySessions);
  const allWeeklySummaries = chunks.flatMap((c) => c.weeklySummary);
  const allMonthlySummaries = chunks.flatMap((c) => c.monthlySummary);

  // Recalculate overview across all chunks
  const totalHours = allDailySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
  const uniqueDays = new Set(allDailySessions.map((s) => s.day.split(" ")[0])).size;

  // Group by topic
  const topicCoverageMap = new Map<
    string,
    { sessions: number; totalHours: number; priority: string }
  >();
  for (const session of allDailySessions) {
    for (const topic of session.topics) {
      const existing = topicCoverageMap.get(topic) || {
        sessions: 0,
        totalHours: 0,
        priority: "medium",
      };
      existing.sessions += 1;
      existing.totalHours += session.duration / 60;
      topicCoverageMap.set(topic, existing);
    }
  }

  // Find peak week
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

export async function getStudyRecommendations(
  contestName: string,
  priorities: StudyAreaPriority[],
  coverage: number,
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prioritiesText = priorities
      .slice(0, 10)
      .map((p) => `- ${p.topicName} (${p.priority})`)
      .join("\n");

    const prompt = `
As an expert study advisor for Brazilian civil service exams, provide 3-5 specific, actionable study recommendations for someone preparing for "${contestName}".

Current study profile:
- Current content coverage: ${coverage}%
- Top priority topics:
${prioritiesText}

Provide practical, implementable recommendations that leverage the identified priority topics and address any gaps.
Return as a JSON array of strings.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [
        "Focus on high-priority topics first",
        "Practice with past exam questions",
        "Create a study group for complex topics",
      ];
    }

    return JSON.parse(jsonMatch[0]);
  } catch {
    return [
      "Focus on high-priority topics first",
      "Practice with past exam questions",
      "Create a study group for complex topics",
    ];
  }
}

export async function analyzeCoverageAndSuggest(
  contestName: string,
  coverage: number,
  gaps: string[],
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const gapsText = gaps.slice(0, 10).join(", ");

    const prompt = `
Analyze this study preparation status for "${contestName}" civil service exam:
- Content coverage: ${coverage}%
- Content gaps to address: ${gapsText}

Provide a brief (2-3 sentences) assessment and next steps to fill gaps.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return `Your current coverage is at ${coverage}%. Focus on the remaining topics by using targeted study materials.`;
  }
}
