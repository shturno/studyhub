import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDashboardData } from '@/features/dashboard/services/dashboardService'
import { DashboardView } from '@/features/dashboard/components/DashboardView'
import { getContests } from '@/features/contests/actions'

export const dynamic = 'force-dynamic'

interface DashboardPageProps {
  searchParams: Promise<{
    contestId?: string
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { contestId } = await searchParams
  const [dashboardData, contests] = await Promise.all([
    getDashboardData(contestId),
    getContests()
  ])

  return <DashboardView data={dashboardData} contests={contests} activeContestId={contestId} />
}
