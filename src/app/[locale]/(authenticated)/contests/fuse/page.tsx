import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MergeContestsView } from "@/features/contests/components/MergeContestsView";

export const metadata: Metadata = {
  title: "O Alquimista | StudyHub",
  description: "Fundir editais em um Super-Ciclo",
};

export default async function FuseContestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const contests = await prisma.contest.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      institution: true,
      _count: {
        select: { subjects: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#080010] text-[#e0e0ff]">
      <div className="px-4 md:px-8 pt-6 pb-4 max-w-5xl mx-auto">
        <div
          className="font-pixel text-[#ff006e] text-sm mb-1 animate-pulse"
          style={{ textShadow: "0 0 10px rgba(255,0,110,0.6)" }}
        >
          LABORATÓRIO DE FUSÃO
        </div>
      </div>

      <main className="px-4 md:px-8 py-2 max-w-5xl mx-auto">
        <MergeContestsView availableContests={contests} />
      </main>
    </div>
  );
}
