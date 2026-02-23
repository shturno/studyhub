import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080010] text-[#e0e0ff] overflow-hidden">

      {/* Stars background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }, (_, i) => i).map((step) => (
          <div
            key={`star-${step}`}
            className="absolute w-px h-px bg-[#00ff41] opacity-60"
            style={{
              left: `${(step * 37 + 13) % 100}%`,
              top: `${(step * 53 + 7) % 100}%`,
              boxShadow: '0 0 2px #00ff41',
              animationDelay: `${step * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Nav */}
      <nav className="fixed w-full z-50 h-14 flex items-center justify-between px-6"
        style={{ background: '#04000a', borderBottom: '2px solid #00ff41', boxShadow: '0 2px 20px rgba(0,255,65,0.2)' }}>
        <div className="flex items-center gap-1">
          <span className="font-pixel text-[#00ff41] text-sm"
            style={{ textShadow: '0 0 10px rgba(0,255,65,0.8)' }}>STUDY</span>
          <span className="font-pixel text-[#ff006e] text-sm"
            style={{ textShadow: '0 0 10px rgba(255,0,110,0.8)' }}>HUB</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="font-pixel text-[9px] text-[#00ff41] px-4 py-2 hover:bg-[#00ff41]/10 transition-colors"
              style={{ border: '2px solid #00ff41' }}>
              LOGIN
            </button>
          </Link>
          <Link href="/register">
            <button className="font-pixel text-[9px] text-black bg-[#00ff41] px-4 py-2 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: '4px 4px 0px #006b1a' }}>
              PLAY
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center pt-14">

        {/* Big pixel title */}
        <div className="mb-4">
          <div className="font-pixel text-[#00ff41] text-2xl md:text-4xl lg:text-5xl leading-relaxed mb-2"
            style={{ textShadow: '0 0 20px rgba(0,255,65,0.8), 0 0 40px rgba(0,255,65,0.4)' }}>
            STUDY HUB
          </div>
          <div className="font-pixel text-[#ff006e] text-sm md:text-lg"
            style={{ textShadow: '0 0 15px rgba(255,0,110,0.8)' }}>
            PREPARE. LEVEL UP. CONQUER.
          </div>
        </div>

        {/* Insert coin blinking */}
        <div className="font-pixel text-[#ffbe0b] text-xs mt-8 mb-12 animate-blink"
          style={{ textShadow: '0 0 10px rgba(255,190,11,0.8)' }}>
          ► INSERT COIN TO START ◄
        </div>

        {/* Stats bar like arcade high scores */}
        <div className="mb-12 w-full max-w-lg"
          style={{ border: '2px solid #00ff41', background: '#04000a', padding: '16px' }}>
          <div className="font-pixel text-[8px] text-[#00ff41] mb-4 text-center">— HIGH SCORES —</div>
          <div className="space-y-2">
            {[
              { rank: '1ST', name: 'CONCURSO PUBLICO', xp: '99999' },
              { rank: '2ND', name: 'APROVACAO', xp: '88888' },
              { rank: '3RD', name: 'CONQUISTAS', xp: '77777' },
            ].map((row) => (
              <div key={row.rank} className="flex justify-between font-mono text-xl px-2">
                <span className="text-[#ff006e]">{row.rank}</span>
                <span className="text-[#e0e0ff]">{row.name}</span>
                <span className="text-[#ffbe0b]">{row.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register">
            <button className="font-pixel text-[10px] text-black bg-[#00ff41] px-8 py-4 transition-all hover:-translate-y-1 active:translate-y-1"
              style={{ boxShadow: '6px 6px 0px #006b1a, 0 0 20px rgba(0,255,65,0.4)' }}>
              ▶ NOVO JOGO
            </button>
          </Link>
          <Link href="/login">
            <button className="font-pixel text-[10px] text-[#00ff41] px-8 py-4 hover:bg-[#00ff41]/10 transition-colors"
              style={{ border: '2px solid #00ff41' }}>
              ↺ CONTINUAR
            </button>
          </Link>
        </div>

        {/* Features row */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
          {[
            { emoji: '🧠', title: 'TDAH-FRIENDLY', desc: 'Interface clean, sem distrações' },
            { emoji: '🏆', title: 'GAMIFICADO', desc: 'XP, níveis e conquistas reais' },
            { emoji: '⚡', title: 'SMART CYCLE', desc: 'Cronograma adaptativo com IA' },
          ].map((card) => (
            <div key={card.title} className="p-4 text-center hover:bg-[#00ff41]/5 transition-colors cursor-default"
              style={{ border: '2px solid rgba(0,255,65,0.4)' }}>
              <div className="text-3xl mb-3">{card.emoji}</div>
              <div className="font-pixel text-[8px] text-[#00ff41] mb-2">{card.title}</div>
              <div className="font-mono text-base text-[#7f7f9f]">{card.desc}</div>
            </div>
          ))}
        </div>

        {/* Version tag */}
        <div className="mt-16 font-pixel text-[7px] text-[#7f7f9f]">
          © 2026 STUDYHUB CORP. · VER 1.0.0 · BUILD 001
        </div>
      </section>
    </div>
  )
}
