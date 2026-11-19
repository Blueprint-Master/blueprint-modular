ALTER TABLE "NewsletterSettings" ADD COLUMN "owner_id" TEXT, ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX "NewsletterSettings_owner_id_key" ON "NewsletterSettings"("owner_id");
ALTER TABLE "NewsletterSettings" ADD CONSTRAINT "NewsletterSettings_owner_id_fkey"
  FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
