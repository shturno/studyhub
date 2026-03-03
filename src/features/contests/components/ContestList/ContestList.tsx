import { getContests } from "@/features/contests/actions";
import { ContestCard } from "@/features/contests/components/ContestCard";
import { CreateContestDialog } from "@/features/contests/components/CreateContestDialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export async function ContestList() {
  const contests = await getContests();
  const t = await getTranslations("ContestList");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="font-pixel text-[7px] text-[#7f7f9f]">
          {t("found", { count: contests.length })}
        </div>
        <div className="flex items-center gap-3">
          {contests.length >= 2 && (
            <Link href="/contests/fuse">
              <Button
                variant="outline"
                className="h-9 border-[#ff006e]/30 text-[#ff006e] hover:bg-[#ff006e]/10 font-pixel text-[8px]"
              >
                {t("fusionLab")}
              </Button>
            </Link>
          )}
          <CreateContestDialog />
        </div>
      </div>

      {contests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contests.map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))}
        </div>
      ) : (
        <div
          className="py-16 flex flex-col items-center justify-center text-center"
          style={{
            border: "2px dashed rgba(0,255,65,0.2)",
            background: "#04000a",
          }}
        >
          <span className="text-4xl mb-4">🎯</span>
          <div className="font-pixel text-[8px] text-[#555] mb-2">
            {t("noneFound")}
          </div>
          <div className="font-mono text-base text-[#444] mb-6">
            {t("addFirst")}
          </div>
          <CreateContestDialog />
        </div>
      )}
    </div>
  );
}
