import { vi, beforeEach } from "vitest";

const createMockProxy = (
  target: Record<string, unknown> = {},
): Record<string, unknown> => {
  return new Proxy(target, {
    get: (t, prop: string | symbol) => {
      const key = String(prop);
      if (!(key in t)) {
        t[key] = createMockProxy();
      }
      const value = t[key];
      if (
        typeof value === "object" &&
        value !== null &&
        !("_isMockFunction" in value)
      ) {
        return createMockProxy(value as Record<string, unknown>);
      }
      return typeof value === "function" ? vi.fn() : value;
    },
  });
};

export const prismaMock = createMockProxy();

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
});
