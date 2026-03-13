import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getStudyRecommendations } from "@/features/ai/services/aiAdvisoryService";
import type { StudyAreaPriority } from "@/features/editorials/types";

interface AIAdvisoryServerProps {
  contestName: string;
  priorities: StudyAreaPriority[];
  coveragePercent: number;
}

export async function AIAdvisoryServer({
  contestName,
  priorities,
  coveragePercent,
}: AIAdvisoryServerProps) {
  const t = await getTranslations("AIAdvisoryCard");

  const recommendations = await getStudyRecommendations(
    contestName,
    priorities,
    coveragePercent,
  ).catch(() => [t("fallback1"), t("fallback2"), t("fallback3")]);

  if (recommendations.length === 0) return null;

  return (
    <div
      style={{
        border: "2px solid rgba(123,97,255,0.5)",
        background: "#04000a",
        boxShadow: "0 0 20px rgba(123,97,255,0.08)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(123,97,255,0.2)" }}
      >
        <span className="font-pixel text-[8px] text-[#7b61ff]">
          {t("title")}
        </span>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-[#7b61ff]" />
          <span className="font-pixel text-[6px] text-[#555]">{t("poweredBy")}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-pixel text-[6px] text-[#7f7f9f]">
              {t("coverageLabel")}
            </span>
            <span className="font-pixel text-[7px] text-[#7b61ff]">
              {coveragePercent}%
            </span>
          </div>
          <div
            className="h-2 w-full"
            style={{ background: "rgba(123,97,255,0.15)" }}
          >
            <div
              className="h-full"
              style={{
                width: `${coveragePercent}%`,
                background:
                  coveragePercent >= 70
                    ? "#00ff41"
                    : coveragePercent >= 40
                      ? "#7b61ff"
                      : "#ff006e",
                boxShadow:
                  coveragePercent > 0 ? "0 0 8px rgba(123,97,255,0.6)" : "none",
              }}
            />
          </div>
        </div>

        <ul className="space-y-2">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-pixel text-[7px] text-[#7b61ff] mt-[3px] shrink-0">
                ▸
              </span>
              <span className="font-pixel text-[7px] text-[#c0c0e0] leading-relaxed">
                {rec.length > 80 ? rec.slice(0, 77) + "..." : rec}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
