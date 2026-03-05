import { prisma } from "@/lib/prisma";

export interface PublicStats {
  totalFocusHours: number;
  totalSessions: number;
  totalSubjects: number;
  totalUsers: number;
}

const FALLBACK: PublicStats = {
  totalFocusHours: 0,
  totalSessions: 0,
  totalSubjects: 0,
  totalUsers: 0,
};

export async function getPublicStats(): Promise<PublicStats> {
  try {
    const [sessionStats, totalSubjects, totalUsers] = await Promise.all([
      prisma.studySession.aggregate({ _sum: { minutes: true }, _count: true }),
      prisma.subject.count(),
      prisma.user.count(),
    ]);

    const totalMinutes = sessionStats._sum.minutes ?? 0;

    return {
      totalFocusHours: Math.round(totalMinutes / 60),
      totalSessions: sessionStats._count,
      totalSubjects,
      totalUsers,
    };
  } catch {
    return FALLBACK;
  }
}
