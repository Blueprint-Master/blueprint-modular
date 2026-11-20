CREATE TABLE "TeamTask" (
  id UUID PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"(id) ON DELETE CASCADE,
  "creatorId" TEXT NOT NULL, "assigneeId" TEXT NOT NULL, title TEXT NOT NULL,
  due DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low','normal','high')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  revision INTEGER NOT NULL DEFAULT 1, removed BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "TeamTask_organizationId_removed_due_idx" ON "TeamTask"("organizationId",removed,due);
CREATE TABLE "TeamTaskEvent" (
  id TEXT PRIMARY KEY, "taskId" UUID NOT NULL REFERENCES "TeamTask"(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL, "actorId" TEXT NOT NULL, "actorName" TEXT NOT NULL,
  action TEXT NOT NULL, details JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("taskId",revision)
);
