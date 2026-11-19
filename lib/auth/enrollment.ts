import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { createTransport } from "nodemailer";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "./credentials";

export type ChallengePurpose = "register" | "recover";

function digest(id: string, code: string) {
  const key = process.env.NEXTAUTH_SECRET;
  if (!key) throw new Error("NEXTAUTH_SECRET is required");
  return createHmac("sha256", key).update(id + ":" + code).digest("hex");
}

export function registrationEnabled() {
  return Boolean(process.env.AUTH_SMTP_URL && process.env.AUTH_MAIL_FROM && process.env.NEXTAUTH_SECRET);
}

async function sendCode(email: string, code: string, english: boolean, purpose: ChallengePurpose) {
  const smtp = new URL(process.env.AUTH_SMTP_URL!);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(smtp.hostname);
  if (!["smtp:", "smtps:"].includes(smtp.protocol)) throw new Error("Invalid SMTP configuration");
  const transport = createTransport({
    host: smtp.hostname.replace(/^\[|\]$/g, ""), port: Number(smtp.port || (smtp.protocol === "smtps:" ? 465 : 587)),
    secure: smtp.protocol === "smtps:", requireTLS: !local && smtp.protocol !== "smtps:",
    auth: smtp.username ? { user: decodeURIComponent(smtp.username), pass: decodeURIComponent(smtp.password) } : undefined,
    connectionTimeout: 10000, socketTimeout: 15000, greetingTimeout: 10000,
  });
  await transport.sendMail({ from: process.env.AUTH_MAIL_FROM, to: email,
    subject: purpose === "recover" ? (english ? "Reset your Modular password" : "Réinitialiser votre mot de passe Modular") : english ? "Blueprint Modular registration" : "Inscription Blueprint Modular",
    text: english ? "Your confirmation code is " + code + ". It expires in 10 minutes."
      : "Votre code de confirmation est " + code + ". Il expire dans 10 minutes." });
}

export async function beginEnrollment(email: string, english: boolean, send = sendCode, purpose: ChallengePurpose = "register") {
  const id = randomUUID();
  const code = randomInt(100000000).toString().padStart(8, "0");
  const now = new Date();
  const accepted = await prisma.$transaction(async tx => {
    // Serialize rate accounting across application processes, releasing the lock before SMTP.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(1340154917)`;
    await tx.enrollmentChallenge.deleteMany({ where: { sentAt: { lt: new Date(+now - 3600000) } } });
    const old = await tx.enrollmentChallenge.findUnique({ where: { email_purpose: { email, purpose } } });
    if (old && +now - +old.sentAt < 60000) return { id: old.id, deliver: false };
    if (await tx.enrollmentChallenge.count() >= 120 && !old) return { id, deliver: false };
    const data = { id, codeHash: digest(id, code), attempts: 0, sentAt: now, expiresAt: new Date(+now + 600000) };
    await tx.enrollmentChallenge.upsert({ where: { email_purpose: { email, purpose } }, create: { email, purpose, ...data }, update: data });
    const deliver = purpose === "register" || Boolean(await tx.userCredential.findFirst({
      where: { user: { email } }, select: { userId: true },
    }));
    return { id, deliver };
  });
  if (accepted.deliver) {
    try { await send(email, code, english, purpose); }
    catch (error) {
      await prisma.enrollmentChallenge.deleteMany({ where: { id } });
      throw error;
    }
  }
  return accepted.id;
}

export async function completeEnrollment(email: string, id: string, code: string, name: string | undefined, password: string, purpose: ChallengePurpose = "register") {
  const candidate = await prisma.enrollmentChallenge.findUnique({ where: { id } });
  if (!candidate || candidate.email !== email || candidate.purpose !== purpose) return false;
  const attempt = await prisma.enrollmentChallenge.updateMany({
    where: { id, email, attempts: { lt: 5 }, expiresAt: { gt: new Date() } },
    data: { attempts: { increment: 1 } },
  });
  if (!attempt.count || !timingSafeEqual(Buffer.from(candidate.codeHash, "hex"), Buffer.from(digest(id, code), "hex"))) return false;
  const passwordHash = await hashPassword(password);
  return prisma.$transaction(async tx => {
    const consumed = await tx.enrollmentChallenge.deleteMany({ where: { id, email, expiresAt: { gt: new Date() } } });
    if (!consumed.count) return false;
    if (purpose === "recover") {
      const changed = await tx.userCredential.updateMany({ where: { user: { email } },
        data: { passwordHash, revision: { increment: 1 }, failures: 0, windowStart: null } });
      return changed.count === 1;
    }
    // Enrollment never overwrites an established password or role.
    const user = await tx.user.upsert({ where: { email }, create: { email, name, emailVerified: new Date() },
      update: { emailVerified: new Date() }, select: { id: true } });
    const result = await tx.userCredential.createMany({ data: [{ userId: user.id, passwordHash }], skipDuplicates: true });
    return Boolean(result.count);
  });
}
