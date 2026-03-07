"use server";

import { ok, err, type ActionResult } from "@/lib/result";
import { getDashboardData as fetchDashboardData } from "./services/dashboardService";
import type { DashboardData } from "./types";

export async function getDashboardData(
  userId: string,
  contestId?: string,
): Promise<ActionResult<DashboardData>> {
  try {
    const data = await fetchDashboardData(userId, contestId);
    return ok(data);
  } catch {
    return err("Erro ao carregar dados do dashboard");
  }
}

