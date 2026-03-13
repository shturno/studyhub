import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TimerDisplay } from "@/features/timer/components/TimerDisplay";
import { MaterialManager } from "@/features/materials/components/MaterialManager";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StudyPageProps {
  readonly params: Promise<{
    topicId: string;
  }>;
}

export default async function StudyPage(props: StudyPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const params = await props.params;
  const topic = await prisma.topic.findUnique({
    where: { id: params.topicId },
    include: {
      subject: {
        include: {
          contest: { select: { userId: true } },
        },
      },
    },
  });

  if (!topic || topic.subject.contest.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#080010] text-[#e0e0ff] flex flex-col">
      <header className="px-4 md:px-8 pt-6 pb-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#7f7f9f] hover:text-[#00ff41] transition-colors font-pixel text-[8px]"
        >
          <ArrowLeft className="w-4 h-4" />
          DASHBOARD
        </Link>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[400px]">
          <TimerDisplay
            topicId={topic.id}
            topicName={topic.name}
            subjectName={topic.subject.name}
          />
        </div>

        <div className="space-y-4">
          <MaterialManager topicId={topic.id} />
        </div>
      </main>
    </div>
  );
}
