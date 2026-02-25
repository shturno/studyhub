import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export interface ParsedSubject {
  name: string
  topics: { name: string; description?: string }[]
}

export interface ParsedEdital {
  title: string
  subjects: ParsedSubject[]
}

export async function parsePdfWithGemini(
  pdfText: string
): Promise<ParsedEdital> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const prompt = `
You are an expert in Brazilian Civil Service Exams (Concursos Públicos).
I will provide you with the Edital (Exam Syllabus).
Your task is to extract the complete list of Subjects (Disciplinas) and their sub-topics (Tópicos).

Rules:
1. Ignore all administrative rules, dates, or non-syllabus content.
2. Focus strictly on the "Conteúdo Programático" (Programmatic Content).
3. If the edital has multiple roles/jobs (Cargos), try to extract the syllabus for the most prominent one or a general common core, but be thorough.
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
`

    const response = await model.generateContent([
      prompt,
      "\n\n--- EDITAL TEXT ---\n" + pdfText
    ])

    const responseText = response.response.text()

    const jsonString = responseText.replaceAll(/```json\n?/g, '').replaceAll('```', '').trim()
    
    return JSON.parse(jsonString) as ParsedEdital
  } catch (error) {
    console.error('Error parsing edital with Gemini:', error)
    throw new Error('Falha ao processar o Edital com a IA. O arquivo pode ser muito grande ou ilegível.')
  }
}
