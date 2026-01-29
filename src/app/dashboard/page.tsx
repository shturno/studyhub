import { getDashboardData } from '@/features/dashboard/services/dashboardService'
import { DashboardView } from '@/features/dashboard/components/DashboardView'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()

  return <DashboardView data={dashboardData} />
}
