import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-helpers"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCharts } from "@/components/stats-charts"
import { StatsOverview } from "@/components/stats-overview"
import { ExportButton } from "@/components/export-button"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

async function getStats(userId: string) {
  // This will be fetched client-side for real-time updates
  return null
}

export default async function StatsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estatísticas</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Acompanhe seu progresso de estudos</p>
          </div>
          <ExportButton>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </ExportButton>
        </div>

        <StatsOverview />
        <StatsCharts />
      </div>
    </DashboardLayout>
  )
}
