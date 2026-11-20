ALTER TABLE "AssetMovement"
  ADD COLUMN "request_key" TEXT,
  ADD COLUMN "request_hash" TEXT,
  ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "removed_at" TIMESTAMP(3);
CREATE UNIQUE INDEX "AssetMovement_asset_id_request_key_key" ON "AssetMovement"("asset_id", "request_key");
