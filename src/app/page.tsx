export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-space to-elevated">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold gradient-text-hero">
          StudyHub
        </h1>
        <p className="text-2xl text-muted-foreground">
          Plataforma de estudos gamificada para concursos
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-brand-primary to-accent text-white font-semibold rounded-lg shadow-glow-purple hover:scale-105 transition-transform"
          >
            Acessar Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
