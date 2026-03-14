import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth, mockFindUnique, mockDelete, mockUpdate } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockFindUnique: vi.fn(),
  mockDelete: vi.fn(),
  mockUpdate: vi.fn(),
}));

const { mockFindMany, mockCreate, mockUpdateMany, mockTransaction } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    topic: {
      findUnique: mockFindUnique,
      delete: mockDelete,
      update: mockUpdate,
    },
    contest: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    generatedQuestion: {
      findMany: mockFindMany,
      create: mockCreate,
      updateMany: mockUpdateMany,
    },
    questionLog: {
      create: mockCreate,
    },
    user: {
      update: vi.fn(),
    },
    $transaction: mockTransaction,
  },
}));

vi.mock("@/lib/gemini", () => ({
  getGenAI: vi.fn().mockReturnValue({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue(
            JSON.stringify([
              {
                statement: "A matéria é composta de átomos.",
                type: "CERTO_ERRADO",
                options: null,
                answer: "CERTO",
                explanation: "Correto, tudo é feito de átomos.",
              },
            ])
          ),
        },
      }),
    }),
  }),
}));

vi.mock("@/features/gamification/services/missionService", () => ({
  refreshMissionProgress: vi.fn().mockResolvedValue(undefined),
  checkAllMissionsCompleted: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/features/gamification/services/activityEventService", () => ({
  recordActivityEvent: vi.fn().mockResolvedValue(undefined),
}));

import { deleteTopic, updateTopic, generateQuestions, logQuestionSession } from "../actions";

const USER_ID = "user-1";
const OTHER_USER_ID = "user-2";
const TOPIC_ID = "topic-1";

const mockSession = { user: { id: USER_ID } };
const ownerRecord = { subject: { contest: { userId: USER_ID } } };
const otherRecord = { subject: { contest: { userId: OTHER_USER_ID } } };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("deleteTopic", () => {
  it("returns err when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await deleteTopic(TOPIC_ID);
    expect(result.success).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns err when topic not found", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockFindUnique.mockResolvedValue(null);
    const result = await deleteTopic(TOPIC_ID);
    expect(result.success).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns err when topic belongs to another user", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockFindUnique.mockResolvedValue(otherRecord);
    const result = await deleteTopic(TOPIC_ID);
    expect(result.success).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("deletes and returns ok when owner matches", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockFindUnique.mockResolvedValue(ownerRecord);
    mockDelete.mockResolvedValue({});
    const result = await deleteTopic(TOPIC_ID);
    expect(result.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: TOPIC_ID } });
  });
});

describe("updateTopic", () => {
  it("returns err when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await updateTopic(TOPIC_ID, { name: "Novo Nome" });
    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns err for empty name", async () => {
    mockAuth.mockResolvedValue(mockSession);
    const result = await updateTopic(TOPIC_ID, { name: "  " });
    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns err for name shorter than 2 chars", async () => {
    mockAuth.mockResolvedValue(mockSession);
    const result = await updateTopic(TOPIC_ID, { name: "A" });
    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns err for name longer than 100 chars", async () => {
    mockAuth.mockResolvedValue(mockSession);
    const result = await updateTopic(TOPIC_ID, { name: "A".repeat(101) });
    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns err when topic belongs to another user", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockFindUnique.mockResolvedValue(otherRecord);
    const result = await updateTopic(TOPIC_ID, { name: "Válido" });
    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates with trimmed name and returns ok when owner matches", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockFindUnique.mockResolvedValue(ownerRecord);
    mockUpdate.mockResolvedValue({});
    const result = await updateTopic(TOPIC_ID, { name: "  Direito Civil  " });
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: TOPIC_ID },
      data: { name: "Direito Civil" },
    });
  });
});

describe("generateQuestions", () => {
  it("returns err when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await generateQuestions(TOPIC_ID, "contest-1");
    expect(result.success).toBe(false);
  });

  it("retorna questões do cache quando disponíveis", async () => {
    mockAuth.mockResolvedValue(mockSession);
    // generateQuestions default quantity=5, so need >=5 cached to trigger cache hit
    const cachedQuestions = Array.from({ length: 5 }, (_, i) => ({
      id: `q-${i + 1}`,
      statement: `Test question ${i + 1}`,
      type: "CERTO_ERRADO",
      options: null,
      answer: "CERTO",
      explanation: "Test explanation",
      userId: USER_ID,
      topicId: TOPIC_ID,
      usedAt: null,
    }));
    // ownership check comes before cache check
    mockFindUnique.mockResolvedValueOnce(ownerRecord);
    mockFindMany.mockResolvedValueOnce(cachedQuestions);

    const result = await generateQuestions(TOPIC_ID, "contest-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fromCache).toBe(true);
      expect(result.data.questions).toHaveLength(5);
    }
  });
});

describe("logQuestionSession", () => {
  it("retorna erro quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await logQuestionSession({
      topicId: TOPIC_ID,
      questionIds: ["q-1"],
      correct: 1,
      total: 1,
    });
    expect(result.success).toBe(false);
  });

  it("calcula XP corretamente (correct * 3)", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockTransaction.mockResolvedValueOnce(undefined);

    const result = await logQuestionSession({
      topicId: TOPIC_ID,
      questionIds: ["q-1", "q-2", "q-3"],
      correct: 2,
      total: 3,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.xpEarned).toBe(6); // 2 * 3
    }
  });

  it("cria registro de questionLog", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockTransaction.mockResolvedValueOnce(undefined);

    await logQuestionSession({
      topicId: TOPIC_ID,
      contestId: "contest-1",
      questionIds: ["q-1", "q-2"],
      correct: 1,
      total: 2,
    });

    expect(mockTransaction).toHaveBeenCalled();
  });
});
