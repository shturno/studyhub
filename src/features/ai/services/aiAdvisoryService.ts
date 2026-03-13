import { GoogleGenerativeAI } from "@google/generative-ai";
import { unstable_cache } from "next/cache";
import { type StudyAreaPriority } from "@/features/editorials/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function fetchStudyRecommendations(
  contestName: string,
  prioritiesKey: string,
  coverage: number,
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Você é um coach de concursos públicos num app estilo videogame retrô.
Gere exatamente 3 dicas curtas e diretas para quem prepara "${contestName}".

Perfil:
- Cobertura: ${coverage}%
- Tópicos prioritários: ${prioritiesKey.split("|").map((t) => `- ${t}`).join("\n")}

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
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    return parsed;
  } catch {
    return [];
  }
}

const cachedFetchStudyRecommendations = unstable_cache(
  fetchStudyRecommendations,
  ["ai-study-reco"],
  { revalidate: 3600 },
);

export async function getStudyRecommendations(
  contestName: string,
  priorities: StudyAreaPriority[],
  coverage: number,
): Promise<string[]> {
  const prioritiesKey = priorities
    .slice(0, 10)
    .map((p) => p.topicName)
    .join("|");
  const roundedCoverage = Math.round(coverage / 5) * 5;
  return cachedFetchStudyRecommendations(
    contestName,
    prioritiesKey,
    roundedCoverage,
  );
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
