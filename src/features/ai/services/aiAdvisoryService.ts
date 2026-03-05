import { GoogleGenerativeAI } from "@google/generative-ai";
import { type StudyAreaPriority } from "@/features/editorials/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Get AI-generated study recommendations based on priorities and coverage
 */
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
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

/**
 * Analyze coverage and provide assessment with next steps
 */
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
