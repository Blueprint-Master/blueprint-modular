ALTER TABLE "ChangeRequest"
  ADD COLUMN "cab_round" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "cab_electorate" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "cab_required_votes" INTEGER,
  ADD COLUMN "cab_rejections" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
