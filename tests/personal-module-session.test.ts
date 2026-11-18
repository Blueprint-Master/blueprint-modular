import { afterEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findFirst: vi.fn(), findUnique: vi.fn() } } }));

describe("personal module session in production", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

  it("requires a known session even if the deployment enabled the demo account", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SKIP_AUTH_FOR_TEST", "true");
    const { getPersonalModuleSession } = await import("@/lib/auth");
    vi.mocked(getServerSession).mockResolvedValue(null);
    expect(await getPersonalModuleSession()).toBeNull();
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "unknown@example.test" } });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    expect(await getPersonalModuleSession()).toBeNull();
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });
});
