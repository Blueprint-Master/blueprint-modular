ALTER TABLE "UserCredential" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EnrollmentChallenge" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'register';
ALTER TABLE "EnrollmentChallenge" DROP CONSTRAINT "EnrollmentChallenge_pkey",
  ADD PRIMARY KEY ("email", "purpose");
