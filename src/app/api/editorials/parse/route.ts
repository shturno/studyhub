import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePdfWithGemini } from "@/features/ai/services/editalParserService";

export const maxDuration = 60;

const ALLOWED_BLOB_HOSTNAME_PATTERN = /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/;
const MAX_PAGES = 50;

function isAllowedBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_BLOB_HOSTNAME_PATTERN.test(parsed.hostname)
    );
  } catch {
    return false;
  }
}

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

    let body;
    try {
      body = await request.json();
    } catch {
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

    if (!fileUrl || !contestId || !pageRanges || !role) {
      return NextResponse.json(
        { error: "fileUrl, contestId, pageRanges, and role are required" },
        { status: 400 },
      );
    }

    if (!isAllowedBlobUrl(fileUrl)) {
      return NextResponse.json(
        { error: "Invalid file URL" },
        { status: 400 },
      );
    }

    let contest;
    try {
      contest = await prisma.contest.findUnique({
        where: { id: contestId },
      });
    } catch {
      return NextResponse.json(
        { error: "Database error during contest lookup" },
        { status: 500 },
      );
    }

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (contest.userId !== session.user.id) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const pageNumbers = parsePageRanges(pageRanges);

    if (pageNumbers.length === 0) {
      return NextResponse.json(
        { error: "No valid page numbers provided" },
        { status: 400 },
      );
    }

    if (pageNumbers.length > MAX_PAGES) {
      return NextResponse.json(
        { error: `Máximo de ${MAX_PAGES} páginas permitido` },
        { status: 400 },
      );
    }

    let fileResponse;
    try {
      fileResponse = await fetch(fileUrl);

      if (!fileResponse.ok) {
        return NextResponse.json(
          { error: `Failed to fetch file: HTTP ${fileResponse.status}` },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: `Failed to fetch file from blob storage` },
        { status: 400 },
      );
    }

    let arrayBuffer;
    try {
      arrayBuffer = await fileResponse.arrayBuffer();
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
    } catch {
      return NextResponse.json(
        { error: "Failed to read file content" },
        { status: 400 },
      );
    }

    let pdfText;
    try {
      pdfText = await extractSelectedPages(arrayBuffer, pageNumbers);
    } catch {
      return NextResponse.json(
        { error: "Failed to extract text from PDF" },
        { status: 400 },
      );
    }

    let parsedData;
    try {
      parsedData = await parsePdfWithGemini(pdfText, role);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse editorial with AI" },
        { status: 500 },
      );
    }

    let result;
    try {
      const editorial = await prisma.editorialItem.create({
        data: {
          userId: session.user.id,
          contestId: contestId,
          title:
            parsedData.title || `Edital Extraído (${fileName || "document"})`,
          description: "Mapeamento automático via Inteligência Artificial.",
        },
      });

      let subjectCount = 0;
      let topicCount = 0;

      const existingSubjects = await prisma.subject.findMany({
        where: { contestId },
        select: { id: true, name: true },
      });

      const normalize = (s: string) => s.trim().toLowerCase();

      for (const parsedSubject of parsedData.subjects) {
        let subject = existingSubjects.find(
          (s) => normalize(s.name) === normalize(parsedSubject.name),
        );
        if (!subject) {
          subject = await prisma.subject.create({
            data: { contestId, name: parsedSubject.name, weight: 1 },
          });
          existingSubjects.push(subject);
          subjectCount++;
        }

        const existingTopics = await prisma.topic.findMany({
          where: { subjectId: subject.id },
          select: { id: true, name: true },
        });

        for (const parsedTopic of parsedSubject.topics) {
          let topic = existingTopics.find(
            (t) => normalize(t.name) === normalize(parsedTopic.name),
          );
          if (!topic) {
            topic = await prisma.topic.create({
              data: { subjectId: subject.id, name: parsedTopic.name },
            });
            existingTopics.push(topic);
            topicCount++;
          }

          await prisma.contentMapping.create({
            data: {
              editorialItemId: editorial.id,
              topicId: topic.id,
              contentSummary: "Mapeamento automático extraído do fluxo AI.",
              relevance: 50,
            },
          });
        }
      }

      void subjectCount;
      void topicCount;
      result = editorial;
    } catch {
      return NextResponse.json(
        { error: "Failed to save editorial to database" },
        { status: 500 },
      );
    }

    try {
      revalidatePath(`/[locale]/(authenticated)/contests/[slug]`);
      revalidatePath("/");
    } catch {
    }

    return NextResponse.json({
      success: true,
      editorialId: result.id,
      title: parsedData.title,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to parse edital",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
