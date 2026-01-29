import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Trophy, BrainCircuit } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white selection:bg-brand-primary/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 border-b border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-accent flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">StudyHub</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-6">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8 backdrop-blur-sm">
            <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Vagas abertas para beta testers
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Domine seus estudos com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-purple-400 to-accent">
              foco extremo & gamificação
            </span>
          </h1>

          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A plataforma definitiva para estudantes com TDAH. Transforme a preparação para concursos em uma jornada viciante de progresso e recompensas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg bg-brand-primary hover:bg-brand-primary/90 shadow-[0_0_30px_-10px_rgba(124,58,237,0.5)] transition-transform hover:scale-105">
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-white/[0.08] bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BrainCircuit className="w-8 h-8 text-purple-400" />}
            title="Design TDAH-Friendly"
            description="Interface minimalista escura que elimina distrações e reduz a carga cognitiva durante suas sessões."
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8 text-yellow-400" />}
            title="Gamificação Real"
            description="Ganhe XP, suba de nível e desbloqueie conquistas reais. Torne o estudo tão engajante quanto um jogo."
          />
          <FeatureCard
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-400" />}
            title="Ciclos Inteligentes"
            description="Algoritmo que adapta seu cronograma automaticamente baseado no seu desempenho e cansaço."
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-[#131316] border border-white/[0.08] hover:border-brand-primary/50 transition-colors group">
      <div className="mb-6 p-4 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}
