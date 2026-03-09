"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Brain,
  Zap,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Star,
  Calendar,
  Clock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { DayKey } from "@/features/ai/types";
import { useSmartScheduleGenerator } from "./useSmartScheduleGenerator";
import type { SmartScheduleGeneratorProps } from "./types";

const DAY_KEYS: DayKey[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          className="transition-colors"
        >
          <Star
            className="w-4 h-4"
            style={{
              fill: star <= value ? "#ffbe0b" : "transparent",
              color: star <= value ? "#ffbe0b" : "#555",
            }}
          />
        </button>
      ))}
    </div>
  );
}

export function SmartScheduleGenerator({
  contests,
  isOpen,
  onOpenChange,
}: SmartScheduleGeneratorProps) {
  const t = useTranslations("SmartScheduleGenerator");

  const {
    step,
    setStep,
    selectedIds,
    toggleContest,
    manualPriorities,
    setManualPriority,
    dayHours,
    setDayHour,
    totalWeeklyHours,
    isGenerating,
    isSavingSchedule,
    generatedSchedule,
    setGeneratedSchedule,
    handleGenerateSchedule,
    handleAcceptSchedule,
    reset,
  } = useSmartScheduleGenerator(contests, onOpenChange);

  function handleClose(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  const stepNumber = step === "contests" ? 1 : step === "availability" ? 2 : 3;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#7b61ff]" />
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className="w-6 h-6 flex items-center justify-center font-pixel text-[7px]"
                style={{
                  border: `1px solid ${n <= stepNumber ? "#7b61ff" : "#333"}`,
                  background: n === stepNumber ? "#7b61ff" : "transparent",
                  color: n < stepNumber ? "#7b61ff" : n === stepNumber ? "#fff" : "#555",
                }}
              >
                {n}
              </div>
              {n < 3 && (
                <div
                  className="w-8 h-px"
                  style={{
                    background: n < stepNumber ? "#7b61ff" : "#333",
                  }}
                />
              )}
            </div>
          ))}
          <span className="font-mono text-xs text-[#7f7f9f] ml-2">
          {step === "contests" && t("step1Label")}
          {step === "availability" && t("step2Label")}
          {step === "result" && t("step3Label")}
          </span>
        </div>

        {/* ── Step 1: Select contests ── */}
        {step === "contests" && (
          <div className="space-y-4">
            <div className="font-mono text-sm text-[#7f7f9f]">
              {t("step1Description")}
            </div>

            {contests.length === 0 && (
              <div className="text-center py-6 font-mono text-sm text-[#555]">
                {t("noContests")}
              </div>
            )}

            <div className="space-y-2">
              {contests.map((contest) => {
                const selected = selectedIds.has(contest.id);
                const examStr = contest.examDate
                  ? new Date(contest.examDate).toLocaleDateString("pt-BR")
                  : t("noExamDate");
                return (
                  <div
                    key={contest.id}
                    className="flex items-center justify-between p-3 cursor-pointer transition-all"
                    style={{
                      border: `2px solid ${selected ? "rgba(123,97,255,0.6)" : "rgba(123,97,255,0.15)"}`,
                      background: selected
                        ? "rgba(123,97,255,0.08)"
                        : "#04000a",
                    }}
                    onClick={() => toggleContest(contest.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 flex items-center justify-center"
                        style={{
                          border: `2px solid ${selected ? "#7b61ff" : "#333"}`,
                          background: selected ? "#7b61ff" : "transparent",
                        }}
                      >
                        {selected && (
                          <div className="w-2 h-2 bg-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-sm text-[#e0e0ff]">
                          {contest.name}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#555]" />
                          <span className="font-mono text-xs text-[#555]">
                            {examStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex flex-col items-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-mono text-[10px] text-[#555]">
                        {t("priorityLabel")}
                      </span>
                      <StarRating
                        value={manualPriorities[contest.id] ?? 0}
                        onChange={(v) => setManualPriority(contest.id, v)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={() => setStep("availability")}
                disabled={selectedIds.size === 0}
              >
                {t("next")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Availability ── */}
        {step === "availability" && (
          <div className="space-y-4">
            <div className="font-mono text-sm text-[#7f7f9f]">
              {t("step2Description")}
            </div>

            <div className="space-y-3">
              {DAY_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-24 font-mono text-xs text-[#7f7f9f]">
                    {t(key)}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={12}
                    step={0.5}
                    value={dayHours[key]}
                    onChange={(e) =>
                      setDayHour(key, parseFloat(e.target.value))
                    }
                    className="flex-1 accent-[#7b61ff]"
                  />
                  <div
                    className="w-14 text-center font-mono text-sm"
                    style={{
                      color: dayHours[key] > 0 ? "#7b61ff" : "#555",
                    }}
                  >
                    {dayHours[key]}h
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex items-center justify-between p-3"
              style={{
                border: "1px solid rgba(123,97,255,0.3)",
                background: "rgba(123,97,255,0.05)",
              }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7b61ff]" />
                <span className="font-mono text-sm text-[#7f7f9f]">
                  {t("weeklyTotal")}
                </span>
              </div>
              <span className="font-pixel text-sm text-[#7b61ff]">
                {t("weeklyHours", { hours: totalWeeklyHours })}
              </span>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("contests")}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t("back")}
              </Button>
              <Button onClick={handleGenerateSchedule} disabled={totalWeeklyHours === 0}>
                <Zap className="w-4 h-4 mr-2" />
                {t("generateSchedule")}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === "result" && (
          <div className="space-y-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#7b61ff]" />
                <div className="font-mono text-sm text-[#7f7f9f]">
                  {t("generating")}
                </div>
              </div>
            ) : generatedSchedule ? (
              <>
                <div
                  className="p-4"
                  style={{
                    border: "2px solid rgba(0,255,65,0.4)",
                    background: "#04000a",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-[#00ff41]" />
                    <div className="font-pixel text-[7px] text-[#00ff41]">
                      {t("scheduleWeeks", { weeks: generatedSchedule.schedule.weeks })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="p-3"
                      style={{
                        border: "1px solid rgba(0,255,65,0.2)",
                        background: "#020008",
                      }}
                    >
                      <div className="font-pixel text-[6px] text-[#555]">
                        {t("totalHoursLabel")}
                      </div>
                      <div className="font-pixel text-xl text-[#00ff41] mt-1">
                        {generatedSchedule.schedule.totalHours}h
                      </div>
                    </div>
                    <div
                      className="p-3"
                      style={{
                        border: "1px solid rgba(0,255,65,0.2)",
                        background: "#020008",
                      }}
                    >
                      <div className="font-pixel text-[6px] text-[#555]">
                        {t("contestsLabel")}
                      </div>
                      <div className="font-pixel text-xl text-[#7b61ff] mt-1">
                        {generatedSchedule.contests?.length ?? selectedIds.size}
                      </div>
                    </div>
                  </div>
                </div>

                {(generatedSchedule.schedule.keyMilestones?.length ?? 0) > 0 && (
                  <div
                    className="p-4"
                    style={{
                      border: "2px solid rgba(0,255,65,0.3)",
                      background: "#04000a",
                    }}
                  >
                    <div className="font-pixel text-[7px] text-[#00ff41] mb-3">
                      {t("keyMilestones")}
                    </div>
                    <ul className="space-y-2">
                      {generatedSchedule.schedule.keyMilestones!.map(
                        (milestone: string) => (
                          <li
                            key={milestone.slice(0, 50)}
                            className="font-mono text-sm text-[#7f7f9f] flex items-start gap-2"
                          >
                            <span className="text-[#00ff41] mt-0.5">→</span>
                            {milestone}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {(generatedSchedule.schedule.tips?.length ?? 0) > 0 && (
                  <div
                    className="p-4"
                    style={{
                      border: "2px solid rgba(123,97,255,0.3)",
                      background: "#04000a",
                    }}
                  >
                    <div className="font-pixel text-[7px] text-[#7b61ff] mb-3">
                      {t("studyTips")}
                    </div>
                    <ul className="space-y-2">
                      {generatedSchedule.schedule.tips!.slice(0, 3).map(
                        (tip: string) => (
                          <li
                            key={tip.slice(0, 50)}
                            className="font-mono text-sm text-[#7f7f9f] flex items-start gap-2"
                          >
                            <span className="text-[#7b61ff]">💡</span>
                            {tip}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedSchedule(null);
                      setStep("availability");
                    }}
                    disabled={isSavingSchedule}
                  >
                    {t("regenerate")}
                  </Button>
                  <Button
                    onClick={handleAcceptSchedule}
                    disabled={isSavingSchedule}
                  >
                    {isSavingSchedule ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t("importing")}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {t("importToPlanner")}
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
