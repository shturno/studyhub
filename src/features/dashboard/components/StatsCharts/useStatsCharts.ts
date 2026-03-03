"use client";

import { useEffect, useState } from "react";
import { type StatsData } from "@/features/dashboard/types";

export function useStatsCharts() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json() as Promise<StatsData>)
      .then((data) => {
        setStats(data);
        setError(false);
      })
      .catch((err) => {
        console.error("Failed to fetch stats:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
