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
    contest?: string;
  }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { contest: contestSlug } = await searchParams;
  const contests = await getContests();
  const contestId = contestSlug
    ? contests.find((c) => c.slug === contestSlug)?.id
    : undefined;
  const dashboardData = await getDashboardData(session.user.id, contestId);

  return (
    <DashboardView
      data={dashboardData}
      contests={contests}
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
