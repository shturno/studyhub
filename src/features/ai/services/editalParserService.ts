import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ParsedSubject {
  name: string;
  topics: { name: string; description?: string }[];
}

export interface ParsedEdital {
  title: string;
  subjects: ParsedSubject[];
}

export async function parsePdfWithGemini(
  pdfText: string,
  role?: string,
): Promise<ParsedEdital> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const roleInstruction = role
      ? `IMPORTANT: Extract the syllabus SPECIFICALLY for the role/job: "${role}". If this role has a dedicated syllabus in the edital, extract it. Do not extract generic or other roles' syllabuses.`
      : "If the edital has multiple roles/jobs (Cargos), try to extract the syllabus for the most prominent one or a general common core, but be thorough.";

    const prompt = `
You are an expert in Brazilian Civil Service Exams (Concursos Públicos).
I will provide you with the Edital (Exam Syllabus).
Your task is to extract the complete list of Subjects (Disciplinas) and their sub-topics (Tópicos).

Rules:
1. Ignore all administrative rules, dates, or non-syllabus content.
2. Focus strictly on the "Conteúdo Programático" (Programmatic Content).
3. ${roleInstruction}
4. Normalize the names of the subjects (e.g., "Língua Portuguesa" instead of just "Português", "Direito Constitucional", etc.).
5. Split the syllabus block into distinct discrete topics.

Respond ONLY with a valid JSON object following this EXACT structure, and absolutely no markdown blocks or surrounding text:
{
  "title": "A short generic title for this Edital based on its content (e.g., 'Edital Banco do Brasil')",
  "subjects": [
    {
      "name": "Língua Portuguesa",
      "topics": [
        { "name": "Compreensão de textos" },
        { "name": "Ortografia oficial" }
      ]
    }
  ]
}
`;

    const response = await model.generateContent([
      prompt,
      "\n\n--- EDITAL TEXT ---\n" + pdfText,
    ]);

    const responseText = response.response.text();

    const jsonString = responseText
      .replaceAll(/```json\n?/g, "")
      .replaceAll("```", "")
      .trim();

    const parsedData = JSON.parse(jsonString) as ParsedEdital;

    return parsedData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Falha ao processar o Edital com a IA: ${errorMessage}`);
  }
}
