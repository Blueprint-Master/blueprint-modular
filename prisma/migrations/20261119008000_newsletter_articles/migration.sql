ALTER TABLE "NewsletterArticle" ADD COLUMN "removed" BOOLEAN NOT NULL DEFAULT FALSE, ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "requestId" TEXT, ADD COLUMN "creationDigest" TEXT;
CREATE UNIQUE INDEX "NewsletterArticle_requestId_key" ON "NewsletterArticle"("requestId");
