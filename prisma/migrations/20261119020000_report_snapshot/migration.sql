CREATE TABLE "ReportSnapshot" (
    "id" UUID PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "source" TEXT NOT NULL,
    "since" DATE NOT NULL,
    "through" DATE NOT NULL,
    "rows" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK ("through" >= "since")
);
CREATE INDEX "ReportSnapshot_userId_createdAt_idx" ON "ReportSnapshot"("userId", "createdAt");
