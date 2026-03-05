import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth, mockFindUnique, mockDelete, mockUpdate } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockFindUnique: vi.fn(),
  mockDelete: vi.fn(),
  mockUpdate: vi.fn(),
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
  },
}));

import { deleteTopic, updateTopic } from "../actions";

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
