export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Em construção - Componentes criados, aguardando integração
          </div>
        </header>

        <div className="grid gap-6">
          <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">Próximos Passos</h2>
            <ul className="text-left max-w-2xl mx-auto space-y-2 text-muted-foreground">
              <li>✅ Design System implementado (Neon Study Lab)</li>
              <li>✅ Banco de dados configurado (Vercel Postgres)</li>
              <li>✅ Componentes criados (Timer, Dashboard, Gamificação)</li>
              <li>⏳ Integrar componentes nesta página</li>
              <li>⏳ Implementar autenticação</li>
              <li>⏳ Criar fluxo de onboarding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
