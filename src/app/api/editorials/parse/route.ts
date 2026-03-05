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
    console.log("[Editorial Parse] Starting request processing");

    const session = await auth();
    if (!session?.user?.id) {
      console.warn("[Editorial Parse] Unauthorized: no session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(`[Editorial Parse] Authenticated user: ${session.user.id}`);

    let body;
    try {
      body = await request.json();
      console.log("[Editorial Parse] JSON body parsed successfully");
    } catch (parseError) {
      console.error("[Editorial Parse] JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const fileUrl = body.blobUrl as string | null;
    const fileName = body.fileName as string | null;
    const contestId = body.contestId as string | null;
    const pageRanges = body.pageRanges as string | null;
    const role = body.role as string | null;

    console.log(`[Editorial Parse] Received - fileUrl: ${!!fileUrl}, contestId: ${contestId}, pageRanges: ${pageRanges}, role: ${role}`);

    if (!fileUrl || !contestId || !pageRanges || !role) {
      console.warn("[Editorial Parse] Missing required fields");
      return NextResponse.json(
        { error: "fileUrl, contestId, pageRanges, and role are required" },
        { status: 400 },
      );
    }

    let contest;
    try {
      contest = await prisma.contest.findUnique({
        where: { id: contestId },
      });
      console.log(`[Editorial Parse] Contest lookup: ${contest ? "found" : "not found"}`);
    } catch (dbError) {
      console.error("[Editorial Parse] Database error during contest lookup:", dbError);
      return NextResponse.json(
        { error: "Database error during contest lookup" },
        { status: 500 },
      );
    }

    if (!contest) {
      console.warn("[Editorial Parse] Contest not found for ID:", contestId);
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (contest.userId !== session.user.id) {
      console.warn(`[Editorial Parse] User ${session.user.id} does not own contest ${contestId}`);
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    let fileResponse;
    try {
      console.log(`[Editorial Parse] Fetching file from URL: ${fileUrl.substring(0, 50)}...`);
      fileResponse = await fetch(fileUrl);
      console.log(`[Editorial Parse] File fetch status: ${fileResponse.status}`);

      if (!fileResponse.ok) {
        console.error(`[Editorial Parse] File fetch failed with status ${fileResponse.status}`);
        return NextResponse.json(
          { error: `Failed to fetch file: HTTP ${fileResponse.status}` },
          { status: 400 },
        );
      }
    } catch (fetchError) {
      console.error("[Editorial Parse] Error fetching file:", fetchError);
      return NextResponse.json(
        { error: `Failed to fetch file from blob storage` },
        { status: 400 },
      );
    }

    let arrayBuffer;
    try {
      arrayBuffer = await fileResponse.arrayBuffer();
      const fileSizeKB = arrayBuffer.byteLength / 1024;
      console.log(`[Editorial Parse] File size: ${fileSizeKB.toFixed(2)} KB`);

      const MAX_FILE_SIZE_MB = 50;
      if (fileSizeKB > MAX_FILE_SIZE_MB * 1024) {
        console.warn(`[Editorial Parse] File too large: ${fileSizeKB} KB > ${MAX_FILE_SIZE_MB * 1024} KB`);
        return NextResponse.json(
          {
            error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE_MB}MB`,
          },
          { status: 413 },
        );
      }
    } catch (bufferError) {
      console.error("[Editorial Parse] Error reading file buffer:", bufferError);
      return NextResponse.json(
        { error: "Failed to read file content" },
        { status: 400 },
      );
    }

    const pageNumbers = parsePageRanges(pageRanges);
    console.log(`[Editorial Parse] Parsed page numbers: ${pageNumbers.length} pages`);

    if (pageNumbers.length === 0) {
      console.warn("[Editorial Parse] No valid page numbers after parsing");
      return NextResponse.json(
        { error: "No valid page numbers provided" },
        { status: 400 },
      );
    }

    let pdfText;
    try {
      console.log("[Editorial Parse] Starting PDF text extraction");
      pdfText = await extractSelectedPages(arrayBuffer, pageNumbers);
      console.log(`[Editorial Parse] PDF text extracted: ${pdfText.length} characters`);
    } catch (extractError) {
      console.error("[Editorial Parse] Error extracting PDF text:", extractError);
      return NextResponse.json(
        { error: "Failed to extract text from PDF" },
        { status: 400 },
      );
    }

    let parsedData;
    try {
      console.log(`[Editorial Parse] Starting Gemini parsing with role: ${role}`);
      parsedData = await parsePdfWithGemini(pdfText, role);
      console.log(`[Editorial Parse] Gemini parsing successful: ${parsedData.subjects.length} subjects`);
    } catch (geminiError) {
      console.error("[Editorial Parse] Error parsing with Gemini:", geminiError);
      return NextResponse.json(
        { error: "Failed to parse editorial with AI" },
        { status: 500 },
      );
    }

    let result;
    try {
      console.log("[Editorial Parse] Starting Prisma transaction");
      result = await prisma.$transaction(
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
          console.log(`[Editorial Parse] Editorial created: ${editorial.id}`);

          let subjectCount = 0;
          let topicCount = 0;

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
              subjectCount++;
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
                topicCount++;
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

          console.log(`[Editorial Parse] Transaction completed: ${subjectCount} subjects, ${topicCount} topics created`);
          return editorial;
        },
        {
          timeout: 30000,
        },
      );
      console.log("[Editorial Parse] Prisma transaction successful");
    } catch (transactionError) {
      console.error("[Editorial Parse] Prisma transaction error:", transactionError);
      return NextResponse.json(
        { error: "Failed to save editorial to database" },
        { status: 500 },
      );
    }

    try {
      revalidatePath(`/[locale]/(authenticated)/contests/[slug]`);
      revalidatePath("/");
      console.log("[Editorial Parse] Cache revalidated");
    } catch (revalidateError) {
      console.warn("[Editorial Parse] Cache revalidation warning:", revalidateError);
    }

    console.log("[Editorial Parse] Request completed successfully");
    return NextResponse.json({
      success: true,
      editorialId: result.id,
      title: parsedData.title,
    });
  } catch (error) {
    console.error("[Editorial Parse] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to parse edital",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
