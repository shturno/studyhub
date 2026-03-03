import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({
      totalHours: 0,
      totalSessions: 0,
      currentWeekHours: 0,
      weeklyStats: [],
      trackDistribution: [],
    });
  } catch (error) {
    console.error("Erro ao buscar stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
