ALTER TABLE "WikiComment"
  ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'commentaire',
  ADD COLUMN "parentId" TEXT,
  ADD COLUMN "requestId" TEXT,
  ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "resolved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "WikiComment_article_id_author_id_requestId_key" ON "WikiComment"("article_id","author_id","requestId");
CREATE UNIQUE INDEX "WikiComment_article_id_id_key" ON "WikiComment"("article_id","id");
ALTER TABLE "WikiComment" ADD CONSTRAINT "WikiComment_parent_article_fkey"
  FOREIGN KEY ("article_id","parentId") REFERENCES "WikiComment"("article_id","id");
