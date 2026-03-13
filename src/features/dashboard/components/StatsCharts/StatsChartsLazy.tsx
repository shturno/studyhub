import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { StatsCharts as StatsChartsType } from "./StatsCharts";

export const StatsChartsLazy = dynamic<ComponentProps<typeof StatsChartsType>>(
  () => import("./StatsCharts").then((m) => ({ default: m.StatsCharts })),
  { ssr: false },
);
