"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  size: i % 5 === 0 ? 2 : 1,
  opacity: 0.3 + (i % 4) * 0.15,
  delay: `${(i * 0.4) % 6}s`,
  duration: `${3 + (i % 5)}s`,
}))

const SCORE_ENTRIES = [
  { rank: "1ST", label: "HORAS DE FOCO",       value: "999:59",  color: "#ffbe0b" },
  { rank: "2ND", label: "QUESTÕES RESOLVIDAS",  value: "88.888",  color: "#00ff41" },
  { rank: "3RD", label: "DIAS DE SEQUÊNCIA",    value: "365",     color: "#ff006e" },
  { rank: "4TH", label: "MATÉRIAS DOMINADAS",   value: "42",      color: "#00e5ff" },
]

const FEATURES = [
  { icon: "🧠", title: "TDAH-FRIENDLY", desc: "Sessões curtas, metas claras, sem ruído",   color: "#00ff41" },
  { icon: "🏆", title: "GAMIFICADO",    desc: "XP, nível, conquistas e ranking real",       color: "#ffbe0b" },
  { icon: "⚡", title: "IA ADAPTATIVA", desc: "Ciclo de estudos montado por IA",            color: "#ff006e" },
  { icon: "🗂️", title: "GABARITEIRO",  desc: "Edital, matérias e provas no mesmo lugar",   color: "#00e5ff" },
]

export default function HomePage() {
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="min-h-screen text-[#e0e0ff] overflow-x-hidden relative select-none"
      style={{ background: "#05000d", fontFamily: "'Press Start 2P', monospace" }}
    >
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)",
          mixBlendMode: "multiply",
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background: s.id % 3 === 0 ? "#00ff41" : s.id % 3 === 1 ? "#ff006e" : "#e0e0ff",
              opacity: s.opacity,
              boxShadow: `0 0 ${s.size * 2}px currentColor`,
              animation: `pulse ${s.duration} ${s.delay} ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-8">

        <header className="w-full max-w-5xl flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 13, color: "#00ff41", textShadow: "0 0 12px #00ff41, 0 0 24px rgba(0,255,65,0.5)", letterSpacing: 2 }}>
              STUDY
            </span>
            <span style={{ fontSize: 13, color: "#ff006e", textShadow: "0 0 12px #ff006e, 0 0 24px rgba(255,0,110,0.5)", letterSpacing: 2 }}>
              HUB
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button
                className="transition-all hover:bg-[#00ff41]/10 active:scale-95"
                style={{ fontSize: 8, color: "#00ff41", border: "2px solid #00ff41", padding: "8px 16px", letterSpacing: 1, boxShadow: "0 0 8px rgba(0,255,65,0.3)" }}
              >
                LOGIN
              </button>
            </Link>
            <Link href="/register">
              <button
                className="transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95"
                style={{ fontSize: 8, color: "#000", background: "#00ff41", padding: "8px 16px", letterSpacing: 1, boxShadow: "4px 4px 0 #006b1a, 0 0 16px rgba(0,255,65,0.4)" }}
              >
                PLAY
              </button>
            </Link>
          </div>
        </header>

        <section className="flex flex-col items-center text-center w-full max-w-3xl">

          <div
            className="w-full mb-6"
            style={{ height: 2, background: "linear-gradient(90deg, transparent, #00ff41 30%, #00ff41 70%, transparent)", boxShadow: "0 0 12px #00ff41" }}
          />

          <h1
            className="mb-3 leading-relaxed"
            style={{ fontSize: "clamp(28px, 6vw, 56px)", color: "#00ff41", textShadow: "0 0 20px #00ff41, 0 0 50px rgba(0,255,65,0.4), 4px 4px 0 #003d10", letterSpacing: "0.08em" }}
          >
            STUDY HUB
          </h1>

          <p
            className="mb-2"
            style={{ fontSize: "clamp(9px, 2vw, 13px)", color: "#ff006e", textShadow: "0 0 14px #ff006e, 2px 2px 0 #5c0028", letterSpacing: "0.15em" }}
          >
            PREPARE. LEVEL UP. CONQUER.
          </p>

          <div
            className="mt-6 mb-10"
            style={{ fontSize: 9, color: "#ffbe0b", textShadow: "0 0 12px #ffbe0b", letterSpacing: "0.12em", opacity: blink ? 1 : 0, transition: "opacity 0.1s" }}
          >
            ► INSERT COIN TO START ◄
          </div>

          <div
            className="w-full max-w-lg mb-10"
            style={{ border: "2px solid #00ff41", background: "rgba(0,255,65,0.03)", boxShadow: "0 0 24px rgba(0,255,65,0.25), inset 0 0 40px rgba(0,255,65,0.04)", padding: "20px 24px" }}
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div style={{ flex: 1, height: 1, background: "rgba(0,255,65,0.4)" }} />
              <span style={{ fontSize: 8, color: "#00ff41", letterSpacing: 2, whiteSpace: "nowrap" }}>
                ★ HALL OF CHAMPIONS ★
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(0,255,65,0.4)" }} />
            </div>

            <div className="space-y-3">
              {SCORE_ENTRIES.map((entry, idx) => (
                <div
                  key={entry.rank}
                  className="flex items-center justify-between gap-4"
                  style={{ borderLeft: `3px solid ${entry.color}`, paddingLeft: 10, opacity: 1 - idx * 0.08 }}
                >
                  <span style={{ fontSize: 8, color: entry.color, minWidth: 28, textShadow: `0 0 8px ${entry.color}` }}>
                    {entry.rank}
                  </span>
                  <span style={{ fontSize: 7, color: "#a0a0c0", flex: 1, letterSpacing: 1 }}>
                    {entry.label}
                  </span>
                  <span style={{ fontSize: 9, color: entry.color, textShadow: `0 0 10px ${entry.color}`, fontVariantNumeric: "tabular-nums" }}>
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 text-center" style={{ borderTop: "1px solid rgba(0,255,65,0.2)" }}>
              <span style={{ fontSize: 7, color: "#505060", letterSpacing: 1 }}>
                ALCANCE ESSES RESULTADOS ESTUDANDO COM A GENTE
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <Link href="/register">
              <button
                className="transition-all hover:-translate-y-1 active:translate-y-0.5"
                style={{ fontSize: 10, color: "#000", background: "#00ff41", padding: "14px 32px", letterSpacing: "0.1em", boxShadow: "6px 6px 0 #006b1a, 0 0 24px rgba(0,255,65,0.5)" }}
              >
                ▶ NOVO JOGO
              </button>
            </Link>
            <Link href="/login">
              <button
                className="transition-all hover:bg-[#00ff41]/10 active:scale-95"
                style={{ fontSize: 10, color: "#00ff41", border: "2px solid #00ff41", padding: "14px 32px", letterSpacing: "0.1em", boxShadow: "0 0 12px rgba(0,255,65,0.2)" }}
              >
                ↺ CONTINUAR
              </button>
            </Link>
          </div>

          <div
            className="w-full mb-10"
            style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.5) 30%, rgba(0,255,65,0.5) 70%, transparent)", boxShadow: "0 0 8px rgba(0,255,65,0.3)" }}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center text-center p-4 cursor-default transition-all hover:-translate-y-1"
                style={{ border: `2px solid ${f.color}40`, background: `${f.color}06`, boxShadow: `0 0 16px ${f.color}15` }}
              >
                <div style={{ fontSize: 28, marginBottom: 10, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.4))" }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 7, color: f.color, letterSpacing: 1, marginBottom: 8, textShadow: `0 0 8px ${f.color}` }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 7, color: "#7070a0", lineHeight: 1.7 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 mb-6" style={{ fontSize: 7, color: "#404050", letterSpacing: 1 }}>
            © 2026 STUDYHUB CORP · VER 1.0.0 · BUILD 001 · ALL RIGHTS RESERVED
          </div>

        </section>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes pulse {
          from { opacity: 0.2; }
          to   { opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
