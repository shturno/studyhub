import Link from "next/link";
import { getUserSubjects } from "@/features/subjects/actions";
import { SubjectCard } from "@/features/subjects/components/SubjectCard";
import { ArrowLeft, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const subjects = await getUserSubjects();

  return (
    <div className="min-h-screen bg-[#080010] text-[#e0e0ff]">
      <div className="px-4 md:px-8 pt-6 pb-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/dashboard"
            className="text-[#7f7f9f] hover:text-[#00ff41] transition-colors"
            aria-label="Voltar ao dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div
            className="font-pixel text-[#00ff41] text-sm"
            style={{ textShadow: "0 0 10px rgba(0,255,65,0.6)" }}
          >
            CONTEUDOS
          </div>
        </div>
        <div className="font-mono text-lg text-[#7f7f9f]">
          Matérias do seu ciclo de estudos atual.
        </div>
      </div>

      <main className="px-4 md:px-8 py-4 max-w-5xl mx-auto">
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <div
            className="py-20 text-center"
            style={{ border: "2px dashed rgba(0,255,65,0.2)" }}
          >
            <BookOpen className="w-10 h-10 text-[#333] mx-auto mb-4" />
            <div className="font-pixel text-[8px] text-[#555]">
              NENHUMA MATERIA ENCONTRADA
            </div>
            <div className="font-mono text-base text-[#444] mt-2">
              Crie um ciclo de estudos no Planner.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
