-- Empty synthetic identity fixture for the worker-console browser test only.
-- The application generates cuid identifiers and maintains updatedAt with Prisma.
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'USER');
CREATE TABLE "User" (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  picture text,
  "emailVerified" timestamp(3),
  role "Role" NOT NULL DEFAULT 'USER',
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL
);
CREATE TABLE "UserCredential" (
  "userId" text PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
  revision integer NOT NULL DEFAULT 0,
  "passwordHash" text NOT NULL,
  failures integer NOT NULL DEFAULT 0,
  "windowStart" timestamp(3)
);
