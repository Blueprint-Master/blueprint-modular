-- AlterTable
ALTER TABLE "Contract" ADD COLUMN "embedding_vector" TEXT,
ADD COLUMN "embedding_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WikiArticle" ADD COLUMN "embeddingVector" TEXT,
ADD COLUMN "embeddingAt" TIMESTAMP(3);
