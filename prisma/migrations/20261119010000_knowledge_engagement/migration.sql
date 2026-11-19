CREATE INDEX "KnowledgeArticle_source_ticket_id_idx" ON "KnowledgeArticle"("source_ticket_id");
ALTER TABLE "KnowledgeArticle" ADD CONSTRAINT "KnowledgeArticle_source_ticket_id_fkey"
  FOREIGN KEY ("source_ticket_id") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE NOT VALID;
CREATE TABLE "KnowledgeReader" (
  "article_id" TEXT NOT NULL REFERENCES "KnowledgeArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "helpful" BOOLEAN,
  PRIMARY KEY ("article_id", "user_id")
);
