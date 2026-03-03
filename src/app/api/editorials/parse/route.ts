import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePdfWithGemini } from "@/features/ai/services/editalParserService";

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
  const { getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));

  const texts: string[] = [];
  for (const pageNum of pageNumbers) {
    if (pageNum < 1 || pageNum > pdf.numPages) {
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
  return extractedText;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const fileUrl = body.blobUrl as string | null;
    const fileName = body.fileName as string | null;
    const contestId = body.contestId as string | null;
    const pageRanges = body.pageRanges as string | null;
    const role = body.role as string | null;

    if (!fileUrl || !contestId || !pageRanges || !role) {
      return NextResponse.json(
        { error: "fileUrl, contestId, pageRanges, and role are required" },
        { status: 400 },
      );
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (contest?.userId !== session.user.id) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Falha ao obter arquivo: status ${fileResponse.status}`);
    }
    const arrayBuffer = await fileResponse.arrayBuffer();
    const fileSizeKB = arrayBuffer.byteLength / 1024;

    const MAX_FILE_SIZE_MB = 50;
    if (fileSizeKB > MAX_FILE_SIZE_MB * 1024) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE_MB}MB`,
        },
        { status: 413 },
      );
    }

    const pageNumbers = parsePageRanges(pageRanges);
    if (pageNumbers.length === 0) {
      return NextResponse.json(
        { error: "No valid page numbers provided" },
        { status: 400 },
      );
    }

    const pdfText = await extractSelectedPages(arrayBuffer, pageNumbers);

    const parsedData = await parsePdfWithGemini(pdfText, role);
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
          } else {
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
            } else {
            }

            await tx.contentMapping.create({
              data: {
                editorialItemId: editorial.id,
                topicId: topic.id,
                contentSummary: "Mapeamento automático extraído do fluxo AI.",
                relevance: 50,
              },
            });
          }
        }

        return editorial;
      },
      {
        timeout: 30000,
      },
    );
    revalidatePath(`/[locale]/(authenticated)/contests/[slug]`);
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      editorialId: result.id,
      title: parsedData.title,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to parse edital",
      },
      { status: 500 },
    );
  }
}
