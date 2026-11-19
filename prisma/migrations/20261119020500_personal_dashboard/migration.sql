CREATE TABLE "PersonalDashboard" (
    "userId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "widgets" JSONB NOT NULL
);
