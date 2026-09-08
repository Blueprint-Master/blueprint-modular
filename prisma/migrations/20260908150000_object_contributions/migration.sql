CREATE TABLE "ObjectContribution" (
  "id" TEXT NOT NULL, "authorId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "family" TEXT NOT NULL, "kind" TEXT NOT NULL, "license" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending',
  "sha256" TEXT NOT NULL, "filePath" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "ObjectContribution_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ObjectContribution_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ObjectContribution_status_createdAt_idx" ON "ObjectContribution"("status", "createdAt");
CREATE INDEX "ObjectContribution_authorId_idx" ON "ObjectContribution"("authorId");
