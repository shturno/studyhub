import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/features/dashboard/services/dashboardService";
import { DashboardView } from "@/features/dashboard/components/DashboardView";
import { AIAdvisoryServer } from "@/features/dashboard/components/AIAdvisoryCard/AIAdvisoryServer";
import { AIAdvisorySkeleton } from "@/features/dashboard/components/AIAdvisoryCard/AIAdvisorySkeleton";
import { getContests } from "@/features/contests/actions";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{
    contestId?: string;
  }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { contestId } = await searchParams;
  const [dashboardData, contests] = await Promise.all([
    getDashboardData(session.user.id, contestId),
    getContests(),
  ]);

  return (
    <DashboardView
      data={dashboardData}
      contests={contests}
      activeContestId={contestId}
      aiSlot={
        <Suspense fallback={<AIAdvisorySkeleton />}>
          <AIAdvisoryServer
            contestName={dashboardData.contestName}
            priorities={dashboardData.priorities}
            coveragePercent={dashboardData.coveragePercent}
          />
        </Suspense>
      }
    />
  );
}
