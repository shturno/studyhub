import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth, mockSubjectFindUnique, mockSubjectUpdate } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockSubjectFindUnique: vi.fn(),
  mockSubjectUpdate: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    subject: {
      findUnique: mockSubjectFindUnique,
      update: mockSubjectUpdate,
    },
  },
}));

import { updateSubject } from "../actions";

const USER_ID = "user-1";
const OTHER_USER_ID = "user-2";
const SUBJECT_ID = "subject-1";

const mockSession = { user: { id: USER_ID } };
const ownerRecord = { contest: { userId: USER_ID } };
const otherRecord = { contest: { userId: OTHER_USER_ID } };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateSubject", () => {
  it("returns err when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await updateSubject(SUBJECT_ID, { name: "Matemática" });
    expect(result.success).toBe(false);
    expect(mockSubjectUpdate).not.toHaveBeenCalled();
  });

  it("returns err for empty name", async () => {
    mockAuth.mockResolvedValue(mockSession);
    const result = await updateSubject(SUBJECT_ID, { name: "   " });
    expect(result.success).toBe(false);
    expect(mockSubjectUpdate).not.toHaveBeenCalled();
  });

  it("returns err for name shorter than 2 chars", async () => {
    mockAuth.mockResolvedValue(mockSession);
    const result = await updateSubject(SUBJECT_ID, { name: "X" });
    expect(result.success).toBe(false);
    expect(mockSubjectUpdate).not.toHaveBeenCalled();
  });

  it("returns err for name longer than 100 chars", async () => {
    mockAuth.mockResolvedValue(mockSession);
    const result = await updateSubject(SUBJECT_ID, { name: "B".repeat(101) });
    expect(result.success).toBe(false);
    expect(mockSubjectUpdate).not.toHaveBeenCalled();
  });

  it("returns err when subject not found", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockSubjectFindUnique.mockResolvedValue(null);
    const result = await updateSubject(SUBJECT_ID, { name: "Português" });
    expect(result.success).toBe(false);
    expect(mockSubjectUpdate).not.toHaveBeenCalled();
  });

  it("returns err when subject belongs to another user", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockSubjectFindUnique.mockResolvedValue(otherRecord);
    const result = await updateSubject(SUBJECT_ID, { name: "Português" });
    expect(result.success).toBe(false);
    expect(mockSubjectUpdate).not.toHaveBeenCalled();
  });

  it("updates with trimmed name and returns ok when owner matches", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockSubjectFindUnique.mockResolvedValue(ownerRecord);
    mockSubjectUpdate.mockResolvedValue({});
    const result = await updateSubject(SUBJECT_ID, { name: "  Matemática  " });
    expect(result.success).toBe(true);
    expect(mockSubjectUpdate).toHaveBeenCalledWith({
      where: { id: SUBJECT_ID },
      data: { name: "Matemática" },
    });
  });

  it("accepts name exactly 2 chars long", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockSubjectFindUnique.mockResolvedValue(ownerRecord);
    mockSubjectUpdate.mockResolvedValue({});
    const result = await updateSubject(SUBJECT_ID, { name: "TI" });
    expect(result.success).toBe(true);
  });

  it("accepts name exactly 100 chars long", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockSubjectFindUnique.mockResolvedValue(ownerRecord);
    mockSubjectUpdate.mockResolvedValue({});
    const result = await updateSubject(SUBJECT_ID, { name: "A".repeat(100) });
    expect(result.success).toBe(true);
  });
});
