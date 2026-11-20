CREATE TABLE "WhiteboardNote" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "board" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "column" TEXT NOT NULL CHECK ("column" IN ('bien','ameliorer','action')),
  "creationDigest" TEXT NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 0,
  "removed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "positionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "WhiteboardNote_organizationId_board_removed_positionAt_idx"
  ON "WhiteboardNote"("organizationId","board","removed","positionAt");
