"use client";

import { format } from "date-fns";
import { Trash2, Calendar, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useContestCard } from "./useContestCard";
import type { ContestCardProps } from "./types";

export function ContestCard({ contest }: ContestCardProps) {
  const t = useTranslations("ContestCard");
  const { handleDelete } = useContestCard(contest.id);

  return (
    <div
      className="group relative p-5 hover:-translate-y-0.5 transition-transform duration-100"
      style={{
        border: "2px solid rgba(0,255,65,0.4)",
        background: "#04000a",
        boxShadow: "4px 4px 0px rgba(0,255,65,0.15)",
      }}
    >
      {contest.isPrimary && (
        <div className="absolute -top-3 left-4">
          <Badge variant="gold">{t("mainFocus")}</Badge>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <div className="font-mono text-2xl text-[#e0e0ff] group-hover:text-[#00ff41] transition-colors truncate mb-1">
            {contest.name}
          </div>
          <div className="flex items-center gap-2 font-mono text-base text-[#7f7f9f]">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{contest.institution}</span>
            <span className="text-[#333]">·</span>
            <span className="truncate text-[#555]">{contest.role}</span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-[#ff006e] transition-all p-1"
          aria-label={t("removeLabel")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid rgba(0,255,65,0.15)" }}
      >
        <div className="flex items-center gap-2 font-mono text-base text-[#7f7f9f]">
          <Calendar className="w-3.5 h-3.5 text-[#555]" />
          {contest.examDate ? (
            <span>{format(new Date(contest.examDate), "PPP")}</span>
          ) : (
            <span className="text-[#444] italic">{t("dateNotSet")}</span>
          )}
        </div>

        <Link href={`/contests/${contest.slug}`}>
          <button
            className="font-pixel text-[7px] text-[#00ff41] px-3 py-1.5 hover:bg-[#00ff41] hover:text-black transition-all"
            style={{ border: "2px solid rgba(0,255,65,0.5)" }}
          >
            {t("viewButton")}
          </button>
        </Link>
      </div>
    </div>
  );
}
