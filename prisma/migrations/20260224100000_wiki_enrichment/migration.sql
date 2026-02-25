-- AlterTable WikiArticle: add new columns (additive only)
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "excerpt" TEXT;
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "cover_image" TEXT;
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "last_revised_by" TEXT;
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "reading_time_minutes" INTEGER;
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "word_count" INTEGER;
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "view_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "WikiArticle" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable WikiRevision
CREATE TABLE IF NOT EXISTS "WikiRevision" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT,
    "change_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WikiRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable WikiComment
CREATE TABLE IF NOT EXISTS "WikiComment" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WikiComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable WikiBacklink
CREATE TABLE IF NOT EXISTS "WikiBacklink" (
    "id" TEXT NOT NULL,
    "source_article_id" TEXT NOT NULL,
    "target_article_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WikiBacklink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WikiBacklink_source_article_id_target_article_id_key" ON "WikiBacklink"("source_article_id", "target_article_id");
CREATE INDEX IF NOT EXISTS "WikiBacklink_target_article_id_idx" ON "WikiBacklink"("target_article_id");

-- AddForeignKey WikiRevision
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'WikiRevision_article_id_fkey'
  ) THEN
    ALTER TABLE "WikiRevision" ADD CONSTRAINT "WikiRevision_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey WikiComment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'WikiComment_article_id_fkey'
  ) THEN
    ALTER TABLE "WikiComment" ADD CONSTRAINT "WikiComment_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey WikiBacklink (source and target)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'WikiBacklink_source_article_id_fkey'
  ) THEN
    ALTER TABLE "WikiBacklink" ADD CONSTRAINT "WikiBacklink_source_article_id_fkey" FOREIGN KEY ("source_article_id") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'WikiBacklink_target_article_id_fkey'
  ) THEN
    ALTER TABLE "WikiBacklink" ADD CONSTRAINT "WikiBacklink_target_article_id_fkey" FOREIGN KEY ("target_article_id") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
