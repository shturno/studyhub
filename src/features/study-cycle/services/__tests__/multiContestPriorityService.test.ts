import { describe, it, expect } from "vitest";
import {
  computeMultiContestPriorities,
} from "../multiContestPriorityService";
import type { ContestForSchedule } from "../multiContestPriorityService";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeContest(
  overrides: Partial<ContestForSchedule> & { id: string; name: string },
): ContestForSchedule {
  return {
    examDate: null,
    manualPriority: 0,
    subjects: [],
    ...overrides,
  };
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("computeMultiContestPriorities", () => {
  it("returns empty array when no contests provided", () => {
    const result = computeMultiContestPriorities([], 40);
    expect(result).toEqual([]);
  });

  it("returns empty array when contests have no topics", () => {
    const contest = makeContest({
      id: "c1",
      name: "Concurso A",
      subjects: [{ id: "s1", name: "Direito", weight: 5, userLevel: 1, topics: [] }],
    });
    const result = computeMultiContestPriorities([contest], 40);
    expect(result).toEqual([]);
  });

  it("allocates all weekly minutes to a single contest", () => {
    const contest = makeContest({
      id: "c1",
      name: "Concurso A",
      examDate: daysFromNow(90),
      subjects: [
        {
          id: "s1",
          name: "Direito Constitucional",
          weight: 5,
          userLevel: 1,
          topics: [
            { id: "t1", name: "Princípios", studiedMinutes: 0 },
            { id: "t2", name: "Direitos Fundamentais", studiedMinutes: 0 },
          ],
        },
      ],
    });

    const result = computeMultiContestPriorities([contest], 10);
    const totalAllocated = result.reduce(
      (sum, p) => sum + p.allocatedWeeklyMinutes,
      0,
    );

    // Total allocated ≈ 600 min (10h × 60) — allow small rounding
    expect(totalAllocated).toBeGreaterThan(550);
    expect(totalAllocated).toBeLessThanOrEqual(605);
  });

  it("gives more time to the contest with a closer exam date", () => {
    const contestSoon = makeContest({
      id: "c1",
      name: "Prova próxima",
      examDate: daysFromNow(20),
      manualPriority: 0,
      subjects: [
        {
          id: "s1",
          name: "Matemática",
          weight: 5,
          userLevel: 1,
          topics: [{ id: "t1", name: "Álgebra", studiedMinutes: 0 }],
        },
      ],
    });

    const contestFar = makeContest({
      id: "c2",
      name: "Prova distante",
      examDate: daysFromNow(300),
      manualPriority: 0,
      subjects: [
        {
          id: "s2",
          name: "Português",
          weight: 5,
          userLevel: 1,
          topics: [{ id: "t2", name: "Gramática", studiedMinutes: 0 }],
        },
      ],
    });

    const result = computeMultiContestPriorities(
      [contestSoon, contestFar],
      20,
    );

    const t1 = result.find((p) => p.topicId === "t1");
    const t2 = result.find((p) => p.topicId === "t2");

    expect(t1).toBeDefined();
    expect(t2).toBeDefined();
    // Contest with exam in 20 days gets more time than one in 300 days
    expect(t1!.allocatedWeeklyMinutes).toBeGreaterThan(
      t2!.allocatedWeeklyMinutes,
    );
  });

  it("gives more time to a subject with higher weight", () => {
    const contest = makeContest({
      id: "c1",
      name: "Concurso",
      examDate: daysFromNow(90),
      subjects: [
        {
          id: "s1",
          name: "Alta prioridade",
          weight: 8,
          userLevel: 1,
          topics: [{ id: "t1", name: "Tópico A", studiedMinutes: 0 }],
        },
        {
          id: "s2",
          name: "Baixa prioridade",
          weight: 1,
          userLevel: 1,
          topics: [{ id: "t2", name: "Tópico B", studiedMinutes: 0 }],
        },
      ],
    });

    const result = computeMultiContestPriorities([contest], 20);
    const tA = result.find((p) => p.topicId === "t1");
    const tB = result.find((p) => p.topicId === "t2");

    expect(tA!.allocatedWeeklyMinutes).toBeGreaterThan(
      tB!.allocatedWeeklyMinutes,
    );
  });

  it("gives less time to a topic already studied", () => {
    const contest = makeContest({
      id: "c1",
      name: "Concurso",
      examDate: daysFromNow(90),
      subjects: [
        {
          id: "s1",
          name: "Matéria",
          weight: 5,
          userLevel: 1,
          topics: [
            { id: "t1", name: "Estudado", studiedMinutes: 60 },
            { id: "t2", name: "Não estudado", studiedMinutes: 0 },
          ],
        },
      ],
    });

    const result = computeMultiContestPriorities([contest], 20);
    const studied = result.find((p) => p.topicId === "t1");
    const notStudied = result.find((p) => p.topicId === "t2");

    expect(notStudied!.allocatedWeeklyMinutes).toBeGreaterThan(
      studied!.allocatedWeeklyMinutes,
    );
  });

  it("classifies top 30% of topics as high priority", () => {
    const topics = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      name: `Tópico ${i}`,
      studiedMinutes: 0,
    }));

    const contest = makeContest({
      id: "c1",
      name: "Concurso",
      examDate: daysFromNow(90),
      subjects: [{ id: "s1", name: "Matéria", weight: 5, userLevel: 1, topics }],
    });

    const result = computeMultiContestPriorities([contest], 20);

    const highCount = result.filter((p) => p.priority === "high").length;
    const expected = Math.ceil(10 * 0.3); // 3
    expect(highCount).toBe(expected);
  });

  it("manualPriority boosts a contest's allocated time", () => {
    const lowPriority = makeContest({
      id: "c1",
      name: "Baixa",
      examDate: daysFromNow(90),
      manualPriority: 0,
      subjects: [
        {
          id: "s1",
          name: "Matéria",
          weight: 5,
          userLevel: 1,
          topics: [{ id: "t1", name: "Tópico", studiedMinutes: 0 }],
        },
      ],
    });

    const highPriority = makeContest({
      id: "c2",
      name: "Alta",
      examDate: daysFromNow(90),
      manualPriority: 5,
      subjects: [
        {
          id: "s2",
          name: "Matéria",
          weight: 5,
          userLevel: 1,
          topics: [{ id: "t2", name: "Tópico", studiedMinutes: 0 }],
        },
      ],
    });

    const result = computeMultiContestPriorities(
      [lowPriority, highPriority],
      20,
    );

    const t1 = result.find((p) => p.topicId === "t1");
    const t2 = result.find((p) => p.topicId === "t2");

    // Contest with manualPriority = 5 should get more minutes
    expect(t2!.allocatedWeeklyMinutes).toBeGreaterThan(
      t1!.allocatedWeeklyMinutes,
    );
  });

  it("sets contestId and contestName on each priority", () => {
    const contest = makeContest({
      id: "c1",
      name: "Tribunal de Contas",
      examDate: daysFromNow(60),
      subjects: [
        {
          id: "s1",
          name: "Direito",
          weight: 5,
          userLevel: 1,
          topics: [{ id: "t1", name: "Princípios", studiedMinutes: 0 }],
        },
      ],
    });

    const result = computeMultiContestPriorities([contest], 20);
    expect(result[0].contestId).toBe("c1");
    expect(result[0].contestName).toBe("Tribunal de Contas");
  });
});
