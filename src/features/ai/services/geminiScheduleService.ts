import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudyAreaPriority } from "@/features/editorials/services/contentCrossingService";

export interface ScheduleRequest {
  contestName: string;
  priorities: StudyAreaPriority[];
  weeklyAvailableHours: number;
  examDate: Date;
  focusAreas?: string[];
}

export interface GeneratedScheduleSession {
  day: string;
  timeSlot: string;
  topics: string[];
  duration: number;
  focus: string;
  reason: string;
}

export interface WeeklyScheduleSummary {
  week: number;
  startDate: string;
  endDate: string;
  totalHours: number;
  topics: string[];
  focus: string;
  keyActivities: string[];
}

export interface MonthlyScheduleSummary {
  month: string;
  totalHours: number;
  topics: string[];
  weeklyBreakdown: {
    week: number;
    hours: number;
    focus: string;
  }[];
  milestones: string[];
}

export interface GeneratedSchedule {
  weeks: number;
  totalHours: number;
  dailySessions: GeneratedScheduleSession[];
  weeklySummary: WeeklyScheduleSummary[];
  monthlySummary: MonthlyScheduleSummary[];
  fullScheduleOverview: {
    totalDaysOfStudy: number;
    averageDailyHours: number;
    peakIntensityWeek: number;
    topicsCoverage: {
      topic: string;
      sessions: number;
      totalHours: number;
      priority: "high" | "medium" | "low";
    }[];
  };
  keyMilestones: string[];
  tips: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function generateScheduleWithGemini(
  request: ScheduleRequest,
): Promise<GeneratedSchedule> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prioritiesText = request.priorities
      .map(
        (p) =>
          `- ${p.topicName}: ${p.priority} priority (${p.recommendedHours}h/semana) - ${p.reason}`,
      )
      .join("\n");

    const daysUntilExam = Math.ceil(
      (request.examDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const weeksUntilExam = Math.ceil(daysUntilExam / 7);

    const prompt = `
You are an expert study planner helping a Brazilian civil service exam candidate prepare for "${request.contestName}".

## Study Priorities (by frequency & importance):
${prioritiesText}

## Study Parameters:
- Available hours per week: ${request.weeklyAvailableHours}
- Time until exam: ${weeksUntilExam} weeks (${daysUntilExam} days)
- Exam date: ${request.examDate.toLocaleDateString("pt-BR")}

## Critical Rules:
1. **URGENCY SCALING**: As time decreases, increase focus on HIGH priority topics exponentially
   - If < 4 weeks: 70% time to HIGH priority, 20% to MEDIUM, 10% to LOW
   - If 4-8 weeks: 60% time to HIGH priority, 30% to MEDIUM, 10% to LOW
   - If > 8 weeks: 50% time to HIGH priority, 35% to MEDIUM, 15% to LOW

2. **FREQUENCY BOOST**: Topics appearing in multiple editorials get 25% more study time

3. **SPACED REPETITION**: High-priority topics must appear at least 3 times across the schedule

4. **COMPLETE DAILY SCHEDULE**: Generate sessions for EVERY SINGLE DAY until exam (not just weekly)

## Task:
Create a COMPLETE day-by-day study schedule organized by month that:
1. Covers every calendar day from today until exam date
2. Allocates exact topics for each study session
3. Increases difficulty progression week-by-week
4. Incorporates review sessions (every 3-4 days for high-priority topics)
5. Provides clear justification for each day's focus
6. Adjusts intensity as exam date approaches

Provide the schedule in this JSON format:
{
  "weeks": <number of weeks total>,
  "totalHours": <total study hours across entire period>,
  "dailySessions": [
    {
      "day": "2026-03-04 (Wednesday)",
      "timeSlot": "08:00-09:00",
      "topics": ["Specific Topic Name"],
      "duration": 60,
      "focus": "Initial learning / Deep study / Practice / Review / Mock exam",
      "reason": "Specific justification: e.g., 'High-priority topic appearing in 3 editorials - foundational phase'"
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
  "monthlySummary": [
    {
      "month": "2026-03 (March)",
      "totalHours": 40,
      "topics": ["Topic A", "Topic B", "Topic C"],
      "weeklyBreakdown": [
        {"week": 1, "hours": 10, "focus": "Foundation"},
        {"week": 2, "hours": 12, "focus": "Deepening"}
      ],
      "milestones": ["Complete Topic A foundation", "Start Topic B practice"]
    }
  ],
  "fullScheduleOverview": {
    "totalDaysOfStudy": 180,
    "averageDailyHours": 2.5,
    "peakIntensityWeek": 4,
    "topicsCoverage": [
      {
        "topic": "Constitutional Law",
        "sessions": 15,
        "totalHours": 25,
        "priority": "high"
      }
    ]
  },
  "keyMilestones": [
    "Week 1: Foundation - HIGH priority topics introduction",
    "Week 3: Deepening - Focused practice on frequent topics",
    "Final 2 weeks: Intensive review & mock exams"
  ],
  "tips": [
    "Focus on topics that repeat across multiple editorials first",
    "Increase study intensity in final weeks before exam",
    "Practice questions for topics studied 3-4 days prior"
  ]
}

**IMPORTANT**:
- Return ONLY valid JSON, no additional text
- Generate COMPLETE structure with all 4 views: daily, weekly, monthly, and overview
- Generate sessions for EVERY DAY (not just working days)
- Include specific topic names (not generic "Topic 1")
- Weekly summary: aggregate daily sessions into week overview with focus themes
- Monthly summary: aggregate weeks into months showing milestones
- Full overview: statistics on total days, peak weeks, and per-topic coverage
- Dates must be in YYYY-MM-DD format
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
    console.error("Error generating schedule with Gemini:", error);
    throw new Error("Failed to generate schedule. Please try again.");
  }
}

export async function getStudyRecommendations(
  contestName: string,
  priorities: StudyAreaPriority[],
  coverage: number,
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  } catch (error) {
    console.error("Error getting recommendations:", error);
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const gapsText = gaps.slice(0, 10).join(", ");

    const prompt = `
Analyze this study preparation status for "${contestName}" civil service exam:
- Content coverage: ${coverage}%
- Content gaps to address: ${gapsText}

Provide a brief (2-3 sentences) assessment and next steps to fill gaps.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error analyzing coverage:", error);
    return `Your current coverage is at ${coverage}%. Focus on the remaining topics by using targeted study materials.`;
  }
}
