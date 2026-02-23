import { GoogleGenerativeAI } from '@google/generative-ai'
import { StudyAreaPriority } from '@/features/editorials/services/contentCrossingService'

export interface ScheduleRequest {
  contestName: string
  priorities: StudyAreaPriority[]
  weeklyAvailableHours: number
  examDate: Date
  focusAreas?: string[]
}

export interface GeneratedScheduleSession {
  day: string
  timeSlot: string
  topics: string[]
  duration: number
  focus: string
  reason: string
}

export interface GeneratedSchedule {
  weeks: number
  totalHours: number
  dailySessions: GeneratedScheduleSession[]
  keyMilestones: string[]
  tips: string[]
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

/**
 * Generate an optimized study schedule using Gemini 1.5 Flash
 */
export async function generateScheduleWithGemini(
  request: ScheduleRequest
): Promise<GeneratedSchedule> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prioritiesText = request.priorities
      .map(
        (p) =>
          `- ${p.topicName}: ${p.priority} priority (${p.recommendedHours}h/semana) - ${p.reason}`
      )
      .join('\n')

    const daysUntilExam = Math.ceil(
      (request.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    const weeksUntilExam = Math.ceil(daysUntilExam / 7)

    const prompt = `
You are an expert study planner helping a Brazilian civil service exam candidate prepare for "${request.contestName}".

## Study Priorities (by importance):
${prioritiesText}

## Study Parameters:
- Available hours per week: ${request.weeklyAvailableHours}
- Time until exam: ${weeksUntilExam} weeks (${daysUntilExam} days)
- Focus areas: ${request.focusAreas?.join(', ') || 'All priority areas'}

## Task:
Create a detailed weekly study schedule that:
1. Prioritizes topics appearing in multiple editorials
2. Balances time allocation based on difficulty and importance
3. Includes review cycles for retention
4. Distributes high-priority topics across multiple weeks
5. Builds momentum toward the exam date

Provide the schedule in this JSON format:
{
  "weeks": <number of weeks>,
  "totalHours": <total study hours>,
  "dailySessions": [
    {
      "day": "Monday",
      "timeSlot": "08:00-09:00",
      "topics": ["Topic 1", "Topic 2"],
      "duration": 60,
      "focus": "Initial learning / Practice / Review",
      "reason": "Why this is important at this time"
    }
  ],
  "keyMilestones": ["Week 2: Finish Foundation", "Week 4: Start Practice Tests"],
  "tips": ["Study tip 1", "Study tip 2"]
}

Return ONLY valid JSON, no additional text.
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response')
    }

    const schedule = JSON.parse(jsonMatch[0]) as GeneratedSchedule
    return schedule
  } catch (error) {
    console.error('Error generating schedule with Gemini:', error)
    throw new Error('Failed to generate schedule. Please try again.')
  }
}

/**
 * Get study recommendations based on content crossings
 */
export async function getStudyRecommendations(
  contestName: string,
  priorities: StudyAreaPriority[],
  coverage: number
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prioritiesText = priorities
      .slice(0, 10)
      .map((p) => `- ${p.topicName} (${p.priority})`)
      .join('\n')

    const prompt = `
As an expert study advisor for Brazilian civil service exams, provide 3-5 specific, actionable study recommendations for someone preparing for "${contestName}".

Current study profile:
- Current content coverage: ${coverage}%
- Top priority topics:
${prioritiesText}

Provide practical, implementable recommendations that leverage the identified priority topics and address any gaps.
Return as a JSON array of strings.
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return [
        'Focus on high-priority topics first',
        'Practice with past exam questions',
        'Create a study group for complex topics',
      ]
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return [
      'Focus on high-priority topics first',
      'Practice with past exam questions',
      'Create a study group for complex topics',
    ]
  }
}

/**
 * Analyze content coverage and suggest next steps
 */
export async function analyzeCoverageAndSuggest(
  contestName: string,
  coverage: number,
  gaps: string[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const gapsText = gaps.slice(0, 10).join(', ')

    const prompt = `
Analyze this study preparation status for "${contestName}" civil service exam:
- Content coverage: ${coverage}%
- Content gaps to address: ${gapsText}

Provide a brief (2-3 sentences) assessment and next steps to fill gaps.
`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Error analyzing coverage:', error)
    return `Your current coverage is at ${coverage}%. Focus on the remaining topics by using targeted study materials.`
  }
}
