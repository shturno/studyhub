import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectDetails } from "@/features/subjects/actions";
import { TopicList } from "@/features/subjects/components/TopicList";
import { Progress } from "@/components/ui/progress";

interface SubjectDetailsPageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function SubjectDetailsPage(
  props: SubjectDetailsPageProps,
) {
  const params = await props.params;
  const data = await getSubjectDetails(params.id);

  if (!data.success || !data.data) {
    notFound();
  }

  const { subjectName, topics } = data.data;
  const completedTopics = topics.filter((t: { status: string }) => t.status !== "pending").length;
  const masteredTopics = topics.filter((t: { status: string }) => t.status === "mastered").length;
  const progress =
    topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080010] text-[#e0e0ff]">
      <div className="px-4 md:px-8 pt-6 pb-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/subjects"
            className="text-[#7f7f9f] hover:text-[#00ff41] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div
            className="font-pixel text-[#00ff41] text-sm truncate"
            style={{ textShadow: "0 0 10px rgba(0,255,65,0.6)" }}
          >
            {subjectName.toUpperCase()}
          </div>
        </div>
      </div>

      <main className="px-4 md:px-8 pb-8 max-w-3xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            className="p-4 space-y-3"
            style={{
              border: "2px solid rgba(0,255,65,0.4)",
              background: "#04000a",
            }}
          >
            <div className="font-pixel text-[6px] text-[#7f7f9f]">
              PROGRESSO GERAL
            </div>
            <div className="flex items-end gap-2">
              <span className="font-pixel text-2xl text-[#00ff41]">
                {progress}%
              </span>
              <span className="font-mono text-sm text-[#555] mb-0.5">
                concluído
              </span>
            </div>
            <Progress value={progress} />
          </div>

          <div
            className="p-4"
            style={{
              border: "2px solid rgba(0,255,65,0.4)",
              background: "#04000a",
            }}
          >
            <div className="font-pixel text-[6px] text-[#7f7f9f] mb-2">
              TOPICOS
            </div>
            <div className="flex items-end gap-2">
              <span className="font-pixel text-2xl text-[#00ff41]">
                {completedTopics}
              </span>
              <span className="font-mono text-sm text-[#555] mb-0.5">
                de {topics.length}
              </span>
            </div>
          </div>

          <div
            className="p-4"
            style={{
              border: "2px solid rgba(255,190,11,0.4)",
              background: "#04000a",
            }}
          >
            <div className="font-pixel text-[6px] text-[#7f7f9f] mb-2">
              MASTERY
            </div>
            <div className="flex items-end gap-2">
              <span className="font-pixel text-2xl text-[#ffbe0b]">
                {masteredTopics}
              </span>
              <span className="font-mono text-sm text-[#555] mb-0.5">
                dominados
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[8px] text-[#00ff41]">
              TOPICOS DO EDITAL
            </span>
            <span className="font-pixel text-[6px] text-[#555]">
              {topics.length} ITENS
            </span>
          </div>
          <TopicList topics={topics} />
        </div>
      </main>
    </div>
  );
}
