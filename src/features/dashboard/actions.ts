"use server";

import { auth } from "@/lib/auth";
import { ok, err, type ActionResult } from "@/lib/result";
import { getDashboardData as fetchDashboardData } from "./services/dashboardService";
import type { DashboardData } from "./types";

export async function getDashboardData(
  _userId: string,
  contestId?: string,
): Promise<ActionResult<DashboardData>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Não autorizado");

    const data = await fetchDashboardData(session.user.id, contestId);
    return ok(data);
  } catch {
    return err("Erro ao carregar dados do dashboard");
  }
}
