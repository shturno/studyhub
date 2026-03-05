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

    const prompt = `Você é um coach de concursos públicos num app estilo videogame retrô.
Gere exatamente 3 dicas curtas e diretas para quem prepara "${contestName}".

Perfil:
- Cobertura: ${coverage}%
- Tópicos prioritários: ${prioritiesText}

Regras OBRIGATÓRIAS:
- Máximo 12 palavras por dica
- Tom direto, imperativo ("Estude X", "Foque em Y", "Revise Z")
- Sem introdução, sem explicação, sem pontuação no final
- Retorne SOMENTE um array JSON de 3 strings, nada mais

Exemplo de formato correto:
["Estude morfologia e sintaxe todos os dias", "Resolva 20 questões de interpretação por semana", "Revise classes de palavras antes da prova"]`;

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
