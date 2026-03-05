import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { EditorialManager } from "@/features/editorials/components/EditorialManager";
import { getTranslations } from "next-intl/server";

import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Detalhes do Concurso | StudyHub",
  description: "Veja detalhes e gerencie seus editais",
};

interface ContestDetailPageProps {
  readonly params: Promise<{ slug: string }>;
}

export default async function ContestDetailPage(props: ContestDetailPageProps) {
  const t = await getTranslations("ContestDetail");
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return notFound();
    }

    const contest = await prisma.contest.findUnique({
      where: { slug: params.slug },
      include: {
        subjects: {
          include: {
            topics: true,
          },
        },
        editorialItems: {
          include: {
            contentMappings: true,
          },
        },
      },
    });

    if (!contest || contest.userId !== session.user.id) {
      return notFound();
    }

    const totalTopics = contest.subjects.reduce(
      (sum, subject) => sum + subject.topics.length,
      0,
    );

    return (
      <div className="min-h-screen bg-[#080010] text-[#e0e0ff]">
        <div className="px-4 md:px-8 pt-6 pb-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/contests"
              className="flex items-center gap-2 text-[#7f7f9f] hover:text-[#00ff41] transition-colors font-pixel text-[8px]"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("back")}
            </Link>
          </div>

          <div
            className="p-5"
            style={{
              border: "2px solid rgba(0,255,65,0.4)",
              background: "#04000a",
              boxShadow: "4px 4px 0 rgba(0,255,65,0.1)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono text-2xl text-[#e0e0ff] mb-1">
                  {contest.name}
                </div>
                <div className="flex items-center gap-2 font-mono text-base text-[#7f7f9f]">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{contest.institution}</span>
                  <span className="text-[#333]">·</span>
                  <span>{contest.role}</span>
                </div>
              </div>
              {contest.isPrimary && (
                <Badge variant="gold">{t("mainFocus")}</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: t("examDate"),
                  value: contest.examDate
                    ? format(new Date(contest.examDate), "dd/MM/yyyy")
                    : t("notDefined"),
                  icon: <Calendar className="w-3.5 h-3.5" />,
                },
                {
                  label: t("subjects"),
                  value: String(contest.subjects.length),
                  icon: null,
                },
                { label: t("topics"), value: String(totalTopics), icon: null },
                {
                  label: t("editorials"),
                  value: String(contest.editorialItems.length),
                  icon: null,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3"
                  style={{
                    border: "1px solid rgba(0,255,65,0.2)",
                    background: "#020008",
                  }}
                >
                  <div className="font-pixel text-[6px] text-[#7f7f9f] mb-1 flex items-center gap-1">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div className="font-pixel text-sm text-[#00ff41]">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <main className="px-4 md:px-8 py-4 max-w-5xl mx-auto">
          {contest.subjects.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center p-12 text-center"
              style={{ border: "2px dashed #ff006e", background: "#0a0005" }}
            >
              <h2
                className="font-pixel text-[#ff006e] text-xl mb-4"
                style={{ textShadow: "0 0 10px rgba(255,0,110,0.5)" }}
              >
                {t("noEditorialMapped")}
              </h2>
              <p className="font-mono text-[#7f7f9f] max-w-lg mx-auto mb-8">
                {t("noEditorialMappedDescription")}
              </p>
              <div
                className="w-full max-w-xs"
                style={{
                  border: "2px solid rgba(0,255,65,0.4)",
                  padding: "16px",
                  background: "#04000a",
                }}
              >
                <EditorialManager
                  contestId={contest.id}
                  role={contest.role}
                  examDate={contest.examDate?.toISOString() ?? null}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                className="flex items-center justify-between p-5"
                style={{ border: "2px solid #00ff41", background: "#04000a" }}
              >
                <div>
                  <h3
                    className="font-pixel text-[#00ff41] text-lg mb-1"
                    style={{ textShadow: "0 0 10px rgba(0,255,65,0.5)" }}
                  >
                    {t("skillTree")}
                  </h3>
                  <p className="font-mono text-sm text-[#7f7f9f]">
                    {t("skillTreeDescription")}
                  </p>
                </div>
                <div className="w-48 text-right">
                  <EditorialManager
                    contestId={contest.id}
                    role={contest.role}
                    examDate={contest.examDate?.toISOString() ?? null}
                  />
                </div>
              </div>

              <div
                className="p-5"
                style={{
                  border: "1px solid rgba(0,255,65,0.2)",
                  background: "#020008",
                }}
              >
                <div className="space-y-6">
                  {contest.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      style={{ borderLeft: "2px solid #00ff41" }}
                      className="pl-4"
                    >
                      <div className="font-mono text-xl text-[#e0e0ff]">
                        {subject.name}
                      </div>
                      <div className="font-mono text-[10px] text-[#7f7f9f] mb-2">
                        {subject.topics.length} {t("topicsCount")}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {subject.topics.map((topic) => (
                          <Badge
                            key={topic.id}
                            variant="outline"
                            className="border-[#00ff41]/30 text-[#00ff41] bg-[#00ff41]/5"
                          >
                            {topic.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  } catch (error) {
    console.error("[ContestDetail] Error rendering contest page:", error);
    const t = await getTranslations("ContestDetail");
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[500px] p-6 text-white m-8"
        style={{ border: "2px dashed #ff006e", backgroundColor: "#0a0005" }}
      >
        <h2 className="text-xl font-bold mb-4 font-pixel text-[#ff006e]">
          {t("serverErrorTitle")}
        </h2>
        <p className="mb-4 text-center font-mono text-sm">
          {t("serverErrorDescription")}
        </p>

        <div
          className="w-full bg-black p-4 rounded overflow-auto text-left font-mono text-xs max-h-[400px]"
          style={{ border: "1px solid #333" }}
        >
          <p className="text-[#999]">
            {t("serverErrorDescription")}
          </p>
        </div>
      </div>
    );
  }
}
