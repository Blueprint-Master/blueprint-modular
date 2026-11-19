import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const length = 64;
const cost = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const prefix = "scrypt:32768:8:3";

function derive(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, length, cost, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return [prefix, salt.toString("hex"), key.toString("hex")].join(":");
}

export async function authenticatePassword(email: string, password: string) {
  if (!email || email.length > 254 || !password || Buffer.byteLength(password) > 1024) return null;
  const user = await prisma.user.findUnique({
    where: { email }, select: { id: true, email: true, name: true, role: true, image: true,
      credential: { select: { passwordHash: true, revision: true, failures: true, windowStart: true } } },
  });
  const start = user?.credential?.windowStart;
  if (start && user.credential.failures >= 10 && +start > Date.now() - 15 * 60000) return null;
  const record = user?.credential?.passwordHash ?? "";
  const parts = record.split(":");
  const valid = parts.length === 6 && parts.slice(0, 4).join(":") === prefix
    && /^[0-9a-f]{32}$/.test(parts[4]) && /^[0-9a-f]{128}$/.test(parts[5]);
  const key = await derive(password, valid ? Buffer.from(parts[4], "hex") : Buffer.alloc(16));
  if (!valid) return null;
  if (!timingSafeEqual(key, Buffer.from(parts[5], "hex"))) {
    await prisma.$executeRaw`UPDATE "UserCredential" SET
      "failures" = CASE WHEN "windowStart" > CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN "failures" + 1 ELSE 1 END,
      "windowStart" = CASE WHEN "windowStart" > CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN "windowStart" ELSE CURRENT_TIMESTAMP END
      WHERE "userId" = ${user.id}`;
    return null;
  }
  await prisma.userCredential.updateMany({ where: { userId: user.id, failures: { gt: 0 } }, data: { failures: 0, windowStart: null } });
  const { credential: _private, ...identity } = user!;
  return { ...identity, credentialRevision: user.credential.revision };
}
