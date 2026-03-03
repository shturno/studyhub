"use client";

import { useEffect, useState } from "react";
import type { StatsData } from "./types";

export function useStatsOverview() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json() as Promise<StatsData>)
      .then((data) => setStats(data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
