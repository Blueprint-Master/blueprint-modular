// Run only on the disposable database provisioned for the installation test.
const { randomBytes, scryptSync } = require("node:crypto");
const { createRequire } = require("node:module");
const path = require("node:path");

async function main() {
  const { PrismaClient } = createRequire(path.resolve(process.argv[2], "package.json"))("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const salt = randomBytes(16);
    const key = scryptSync(process.env.MODULAR_QA_PASSWORD, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 });
    const passwordHash = ["scrypt:32768:8:3", salt.toString("hex"), key.toString("hex")].join(":");
    await prisma.user.create({ data: { email: process.env.MODULAR_QA_EMAIL, credential: { create: { passwordHash } } } });
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
