import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { beginEnrollment, completeEnrollment } from "@/lib/auth/enrollment";
import { authenticatePassword } from "@/lib/auth/credentials";

const url = process.env.MODULAR_TEST_DATABASE_URL;
const postgres = new PrismaClient({ datasourceUrl: url });
vi.mock("@/lib/prisma", () => ({ get prisma() { return postgres; } }));

describe.skipIf(!url)("installed account adapter and verified email registration", () => {
  const email = randomUUID() + "@example.test";
  const google = randomUUID() + "@example.test";
  beforeAll(() => { vi.stubEnv("NEXTAUTH_SECRET", "test-secret-never-used-outside-this-fixture"); });
  afterAll(async () => {
    await postgres.enrollmentChallenge.deleteMany({ where: { email } });
    await postgres.user.deleteMany({ where: { email: { in: [email, google] } } });
    await postgres.$disconnect();
    vi.unstubAllEnvs();
  });

  it("creates and looks up a Google account using the installed adapter", async () => {
    const adapter = PrismaAdapter(postgres);
    const user = await adapter.createUser!({ id: randomUUID(), email: google, name: "QA", emailVerified: null, image: "portrait.png" });
    const account = { userId: user.id, type: "oauth" as const, provider: "google", providerAccountId: randomUUID() };
    await adapter.linkAccount!(account);
    const key = { provider: account.provider, providerAccountId: account.providerAccountId };
    expect(await adapter.getUserByAccount!(key)).toMatchObject({ id: user.id, image: "portrait.png" });
    await adapter.unlinkAccount!(key);
    expect(await adapter.getUserByAccount!(key)).toBeNull();
  });

  it("verifies possession, consumes a code once and preserves existing credentials", async () => {
    let code = "";
    const capture = vi.fn(async (_email: string, value: string) => { code = value; });
    const password = "rain-cobalt-forest-orbit";
    const id = await beginEnrollment(email, false, capture);
    expect(await beginEnrollment(email, false, capture)).toBe(id);
    expect(capture).toHaveBeenCalledTimes(1);
    expect(await authenticatePassword(email, password)).toBeNull();
    const badCode = code === "00000000" ? "11111111" : "00000000";
    expect(await completeEnrollment(email, id, badCode, "QA", password)).toBe(false);
    const race = await Promise.all([1, 2].map(() => completeEnrollment(email, id, code, "QA", password)));
    expect(race.sort()).toEqual([false, true]);
    const identity = await authenticatePassword(email, password);
    expect(identity).toMatchObject({ email, name: "QA", role: "USER" });
    expect(identity).not.toHaveProperty("credential");
    expect(await authenticatePassword(email, "different-password")).toBeNull();
    const replacement = await beginEnrollment(email, false, capture);
    expect(await completeEnrollment(email, replacement, code, "Other", "replacement-password")).toBe(false);
    expect(await authenticatePassword(email, password)).toEqual(identity);
  });

  it("changes an existing password once, requires a recovery code and revokes its old session", async () => {
    const address = randomUUID() + "@example.test";
    let code = "";
    const send = async (_address: string, value: string) => { code = value; };
    try {
      const registration = await beginEnrollment(address, false, send);
      expect(await completeEnrollment(address, registration, code, undefined, "different-new-password", "recover")).toBe(false);
      expect(await completeEnrollment(address, registration, code, "Fixture", "old-fixture-password")).toBe(true);
      const oldUser = await authenticatePassword(address, "old-fixture-password");
      const recovery = await beginEnrollment(address, false, send, "recover");
      expect(await completeEnrollment(address, recovery, code, undefined, "different-new-password")).toBe(false);
      const results = await Promise.all([1, 2].map(() =>
        completeEnrollment(address, recovery, code, undefined, "different-new-password", "recover")));
      expect(results.sort()).toEqual([false, true]);
      expect(await authenticatePassword(address, "old-fixture-password")).toBeNull();
      const restored = await authenticatePassword(address, "different-new-password");
      expect(restored).toMatchObject({ id: oldUser.id, credentialRevision: oldUser.credentialRevision + 1 });
      const { authOptions } = await import("@/lib/auth");
      const session = { user: { email: address }, expires: "" };
      expect(await authOptions.callbacks.session({ session, token: { id: oldUser.id, credentialRevision: oldUser.credentialRevision } } as never)).toBeNull();
      expect(await authOptions.callbacks.session({ session, token: { id: restored.id, credentialRevision: restored.credentialRevision } } as never)).toBeTruthy();
    } finally {
      await postgres.enrollmentChallenge.deleteMany({ where: { email: address } });
      await postgres.user.deleteMany({ where: { email: address } });
    }
  });

  it("expires a challenge and permits a new request after relay failure", async () => {
    const fail = async () => { throw new Error("relay offline"); };
    await expect(beginEnrollment(email, true, fail)).rejects.toThrow();
    let code = "";
    const id = await beginEnrollment(email, true, async (_email, value) => { code = value; });
    await postgres.enrollmentChallenge.update({ where: { id }, data: { expiresAt: new Date(0) } });
    expect(await completeEnrollment(email, id, code, "", "expired-code-password")).toBe(false);
  });
});
