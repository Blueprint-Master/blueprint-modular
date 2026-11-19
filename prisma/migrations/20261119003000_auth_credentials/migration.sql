ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMP(3);
CREATE TABLE "Account" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "type" TEXT NOT NULL, "provider" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT,
  "scope" TEXT, "id_token" TEXT, "session_state" TEXT, "refresh_token_expires_in" INTEGER
);
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account" ("provider","providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account" ("userId");
CREATE TABLE "UserCredential" (
  "userId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "passwordHash" TEXT NOT NULL, "failures" INTEGER NOT NULL DEFAULT 0, "windowStart" TIMESTAMP(3)
);
CREATE TABLE "EnrollmentChallenge" (
  "email" TEXT PRIMARY KEY, "id" TEXT NOT NULL, "codeHash" TEXT NOT NULL, "attempts" INTEGER NOT NULL DEFAULT 0,
  "sentAt" TIMESTAMP(3) NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "EnrollmentChallenge_id_key" ON "EnrollmentChallenge" ("id");
CREATE INDEX "EnrollmentChallenge_sentAt_idx" ON "EnrollmentChallenge" ("sentAt");
