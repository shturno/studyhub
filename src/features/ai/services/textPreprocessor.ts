/**
 * Text Preprocessor Service
 *
 * Intelligently filters PDF text to extract only the syllabus content.
 * Searches for keywords that mark the beginning and end of the "Conteúdo Programático"
 * section, reducing noise before sending to Gemini.
 */

// Portuguese keywords that typically precede the syllabus
const START_KEYWORDS = [
  'conteúdo programático',
  'conteúdos programáticos',
  'programa de provas',
  'syllabus',
  'disciplinas',
  'matérias',
  'edital 01',
  'edital 02',
  'edital 03',
  'edital 04',
  'edital 05',
  'conteúdo das provas',
  'pontos do programa',
  'ementa',
  'temas',
  'tópicos',
  'requisitos',
  'conhecimentos',
  'componentes curriculares',
  'blocos temáticos',
  'eixos temáticos',
  'conteúdo exigido',
  'matérias exigidas',
  'disciplinas exigidas',
]

// Portuguese keywords that typically mark the end of the syllabus
const END_KEYWORDS = [
  'critério de avaliação',
  'critérios de avaliação',
  'critérios de julgamento',
  'resultado final',
  'recursos',
  'anexos',
  'homologação',
  'disposições gerais',
  'cronograma',
  'datas importantes',
  'inscrições',
  'processo de seleção',
  'etapas da seleção',
  'das provas',
  'avaliação',
  'seleção',
  'procedimento de seleção',
  'processo seletivo',
]

export interface ExtractedContent {
  content: string
  wasFiltered: boolean
  originalSize: number
  filteredSize: number
  reductionPercentage: number
  startMarker?: string
  endMarker?: string
}

/**
 * Normalize text by removing excessive whitespace and fixing line breaks
 */
function normalizeText(text: string): string {
  // Remove multiple consecutive newlines (reduce to max 2)
  let normalized = text.replace(/\n{3,}/g, '\n\n')

  // Remove multiple consecutive spaces
  normalized = normalized.replace(/[ \t]{2,}/g, ' ')

  // Trim leading/trailing whitespace
  normalized = normalized.trim()

  return normalized
}

/**
 * Find the index of the first occurrence of any keyword (case-insensitive)
 * Returns -1 if no keyword is found
 */
function findFirstKeywordIndex(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase()

  let earliestIndex = -1

  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword.toLowerCase())
    if (index !== -1 && (earliestIndex === -1 || index < earliestIndex)) {
      earliestIndex = index
    }
  }

  return earliestIndex
}

/**
 * Extract the syllabus content from PDF text
 *
 * Strategy:
 * 1. Search for START keyword (marks beginning of syllabus)
 * 2. Search for END keyword after START
 * 3. Extract text between these markers
 * 4. If no markers found, return full text (fallback)
 * 5. Normalize and return with metadata
 */
export async function extractSyllabusContent(
  pdfText: string
): Promise<ExtractedContent> {
  const originalSize = pdfText.length
  const originalSizeKB = originalSize / 1024

  console.log('[PDF Filter] Starting content extraction')
  console.log(`[PDF Filter] Original size: ${originalSizeKB.toFixed(2)} KB`)

  // Search for start marker
  const startIndex = findFirstKeywordIndex(pdfText, START_KEYWORDS)

  if (startIndex === -1) {
    console.log('[PDF Filter] ⚠ No START marker found, returning full text (fallback)')
    return {
      content: pdfText,
      wasFiltered: false,
      originalSize,
      filteredSize: originalSize,
      reductionPercentage: 0,
    }
  }

  // Find which keyword matched for logging
  const matchedStartKeyword = START_KEYWORDS.find(
    (kw) => pdfText.toLowerCase().indexOf(kw.toLowerCase()) === startIndex
  ) || 'Unknown'

  console.log(`[PDF Filter] Found START marker: "${matchedStartKeyword}" at position ${startIndex}`)

  // Search for end marker (looking in the text from start onwards)
  const textFromStart = pdfText.substring(startIndex)
  const endIndex = findFirstKeywordIndex(textFromStart, END_KEYWORDS)

  let extractedContent: string
  let endMarker: string | undefined

  if (endIndex === -1) {
    // No end marker found, take from start to end of document
    console.log('[PDF Filter] ⚠ No END marker found, extracting to end of document')
    extractedContent = textFromStart
  } else {
    // Find which keyword matched for logging
    endMarker = END_KEYWORDS.find(
      (kw) => textFromStart.toLowerCase().indexOf(kw.toLowerCase()) === endIndex
    ) || 'Unknown'

    console.log(`[PDF Filter] Found END marker: "${endMarker}" at position ${startIndex + endIndex}`)

    // Extract from start marker to end marker
    extractedContent = textFromStart.substring(0, endIndex)
  }

  // Normalize the extracted content
  const cleanedContent = normalizeText(extractedContent)
  const filteredSize = cleanedContent.length
  const filteredSizeKB = filteredSize / 1024
  const reductionPercentage = ((originalSize - filteredSize) / originalSize) * 100

  console.log(
    `[PDF Filter] ✓ Filtered successfully: ${originalSizeKB.toFixed(2)} KB → ${filteredSizeKB.toFixed(2)} KB (${reductionPercentage.toFixed(1)}% reduction)`
  )

  return {
    content: cleanedContent,
    wasFiltered: true,
    originalSize,
    filteredSize,
    reductionPercentage,
    startMarker: matchedStartKeyword,
    endMarker,
  }
}
