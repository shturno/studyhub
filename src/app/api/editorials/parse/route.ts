import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePdfWithGemini } from "@/features/ai/services/editalParserService";
import { generateScheduleWithGemini } from "@/features/ai/services/geminiScheduleService";
import {
  generateStudyPriorities,
  type StudyAreaPriority,
} from "@/features/editorials/services/contentCrossingService";

export const maxDuration = 60;

function parsePageRanges(rangesStr: string): number[] {
  const pages = new Set<number>();
  const parts = rangesStr.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((s) => Number(s.trim()));
      if (!isNaN(start) && !isNaN(end) && start > 0 && end > 0) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      const n = Number(part);
      if (!isNaN(n) && n > 0) {
        pages.add(n);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

async function extractSelectedPages(
  arrayBuffer: ArrayBuffer,
  pageNumbers: number[],
): Promise<string> {
  console.log(`[PDF Extract] Extracting pages: ${pageNumbers.join(", ")}`);

  const { getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));

  console.log(`[PDF Extract] PDF has ${pdf.numPages} total pages`);

  const texts: string[] = [];
  for (const pageNum of pageNumbers) {
    if (pageNum < 1 || pageNum > pdf.numPages) {
      console.warn(
        `[PDF Extract] Page ${pageNum} is out of bounds (1-${pdf.numPages})`,
      );
      continue;
    }

    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item: unknown) => (item as { str?: string }).str != null)
      .map((item: unknown) => {
        const i = item as { str: string; hasEOL?: boolean };
        return i.str + (i.hasEOL ? "\n" : "");
      })
      .join("");

    texts.push(pageText);
  }

  const extractedText = texts.join("\n\n");
  console.log(
    `[PDF Extract] Successfully extracted text from ${pageNumbers.length} pages: ${extractedText.length} characters`,
  );
  return extractedText;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Editorial Parse] Iniciando processamento de edital");

    const session = await auth();
    if (!session?.user?.id) {
      console.warn("[Editorial Parse] Requisição não autenticada");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(`[Editorial Parse] User ID: ${session.user.id}`);

    const formData = await request.formData();
    const fileUrl = formData.get("fileUrl") as string | null;
    const fileName = formData.get("fileName") as string | null;
    const contestId = formData.get("contestId") as string | null;
    const pageRanges = formData.get("pageRanges") as string | null;
    const role = formData.get("role") as string | null;
    const examDate = formData.get("examDate") as string | null;

    console.log(
      `[Editorial Parse] fileName: ${fileName}, contestId: ${contestId}, pageRanges: ${pageRanges}, role: ${role}, examDate: ${examDate}`,
    );

    if (!fileUrl || !contestId || !pageRanges || !role) {
      console.error("[Editorial Parse] Parâmetros obrigatórios faltando");
      return NextResponse.json(
        { error: "fileUrl, contestId, pageRanges, and role are required" },
        { status: 400 },
      );
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (contest?.userId !== session.user.id) {
      console.warn(`[Editorial Parse] Acesso negado ao concurso ${contestId}`);
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }
    console.log(`[Editorial Parse] Contest encontrado: ${contest.name}`);

    console.log(`[Editorial Parse] Buscando arquivo da URL`);
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Falha ao obter arquivo: status ${fileResponse.status}`);
    }
    const arrayBuffer = await fileResponse.arrayBuffer();
    const fileSizeKB = arrayBuffer.byteLength / 1024;
    console.log(
      `[Editorial Parse] Arquivo obtido com sucesso: ${fileSizeKB.toFixed(2)} KB`,
    );

    // Validar tamanho do arquivo (limite: 50MB)
    const MAX_FILE_SIZE_MB = 50;
    if (fileSizeKB > MAX_FILE_SIZE_MB * 1024) {
      console.warn(
        `[Editorial Parse] Arquivo excede limite: ${fileSizeKB.toFixed(2)} KB > ${MAX_FILE_SIZE_MB * 1024} KB`,
      );
      return NextResponse.json(
        {
          error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE_MB}MB`,
        },
        { status: 413 },
      );
    }

    // Parsear o string de pageRanges em array de números
    const pageNumbers = parsePageRanges(pageRanges);
    if (pageNumbers.length === 0) {
      console.error("[Editorial Parse] Nenhuma página válida fornecida");
      return NextResponse.json(
        { error: "No valid page numbers provided" },
        { status: 400 },
      );
    }

    // Extrair apenas as páginas selecionadas do PDF
    const pdfText = await extractSelectedPages(arrayBuffer, pageNumbers);

    console.log(
      `[Editorial Parse] Enviando texto para Gemini para parsing (${(pdfText.length / 1024).toFixed(2)} KB), role: ${role}`,
    );
    const parsedData = await parsePdfWithGemini(pdfText, role);
    console.log(
      `[Editorial Parse] Gemini parsing completo: ${parsedData.subjects.length} subjects encontrados`,
    );

    console.log(`[Editorial Parse] Iniciando transação de banco de dados`);
    const result = await prisma.$transaction(
      async (tx) => {
        const editorial = await tx.editorialItem.create({
          data: {
            userId: session.user.id,
            contestId: contestId,
            title:
              parsedData.title || `Edital Extraído (${fileName || "document"})`,
            description: "Mapeamento automático via Inteligência Artificial.",
          },
        });
        console.log(`[Editorial Parse] EditorialItem criado: ${editorial.id}`);

        let totalTopicsCreated = 0;
        for (const parsedSubject of parsedData.subjects) {
          let subject = await tx.subject.findFirst({
            where: { contestId, name: parsedSubject.name },
          });

          if (!subject) {
            subject = await tx.subject.create({
              data: {
                contestId,
                name: parsedSubject.name,
                weight: 1,
              },
            });
            console.log(`[Editorial Parse] Subject criado: ${subject.name}`);
          } else {
            console.log(
              `[Editorial Parse] Subject encontrado: ${subject.name}`,
            );
          }

          for (const parsedTopic of parsedSubject.topics) {
            let topic = await tx.topic.findFirst({
              where: { subjectId: subject.id, name: parsedTopic.name },
            });

            if (!topic) {
              topic = await tx.topic.create({
                data: {
                  subjectId: subject.id,
                  name: parsedTopic.name,
                },
              });
              console.log(
                `[Editorial Parse] Topic criado: ${parsedTopic.name}`,
              );
            } else {
              console.log(
                `[Editorial Parse] Topic encontrado: ${parsedTopic.name}`,
              );
            }

            await tx.contentMapping.create({
              data: {
                editorialItemId: editorial.id,
                topicId: topic.id,
                contentSummary: "Mapeamento automático extraído do fluxo AI.",
                relevance: 50,
              },
            });
            totalTopicsCreated++;
          }
        }
        console.log(
          `[Editorial Parse] Transação concluída: ${totalTopicsCreated} topics processados`,
        );

        return editorial;
      },
      {
        timeout: 30000,
      },
    );

    // Invalidar cache da página de detalhes do concurso
    console.log(`[Editorial Parse] Invalidando cache`);
    revalidatePath(`/[locale]/(authenticated)/contests/[slug]`);
    revalidatePath("/");

    // Generate study priorities and schedule if enabled
    console.log(`[Editorial Parse] Iniciando geração de cronograma`);
    let schedule = null;
    let priorities: StudyAreaPriority[] = [];
    let usedDefaultExamDate = false;

    try {
      // Fetch priorities based on newly created content mappings
      priorities = await generateStudyPriorities(
        contestId,
        session.user.id,
        40,
      );
      console.log(
        `[Editorial Parse] Prioridades geradas: ${priorities.length} tópicos`,
        priorities.map((p) => ({ topicId: p.topicId, topicName: p.topicName })),
      );

      if (priorities.length > 0) {
        // Determine effective exam date
        const effectiveExamDate = examDate
          ? new Date(examDate)
          : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // +6 months default

        if (!examDate) {
          usedDefaultExamDate = true;
          console.log(
            `[Editorial Parse] Data da prova não fornecida. Usando padrão de 6 meses.`,
          );
        }

        // Generate schedule with Gemini
        console.log(
          `[Editorial Parse] Gerando cronograma com Gemini (examDate: ${effectiveExamDate.toISOString()})`,
        );
        schedule = await generateScheduleWithGemini({
          contestName: contest.name,
          priorities,
          weeklyAvailableHours: 40,
          examDate: effectiveExamDate,
        });
        console.log(
          `[Editorial Parse] Cronograma gerado: ${schedule.weeks} semanas, ${schedule.totalHours}h total, ${schedule.dailySessions?.length || 0} sessões diárias`,
          {
            dailySessionsCount: schedule.dailySessions?.length,
            firstDailySession: schedule.dailySessions?.[0],
          },
        );
      }
    } catch (scheduleError) {
      const errorMsg =
        scheduleError instanceof Error
          ? scheduleError.message
          : "Unknown error";
      console.warn(
        `[Editorial Parse] Aviso ao gerar cronograma (não é fatal): ${errorMsg}`,
      );
      // Don't fail the entire request if schedule generation fails
      schedule = null;
    }

    console.log(`[Editorial Parse] ✅ Sucesso! Editorial ID: ${result.id}`);
    return NextResponse.json({
      success: true,
      editorialId: result.id,
      title: parsedData.title,
      schedule,
      priorities,
      usedDefaultExamDate,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to parse edital";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";

    console.error("[Editorial Parse] ❌ ERRO:", {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
