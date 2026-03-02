-- CreateTable
CREATE TABLE "ProductionLine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "theoretical_rate" DOUBLE PRECISION NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionSession" (
    "id" TEXT NOT NULL,
    "line_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "available_time" DOUBLE PRECISION NOT NULL,
    "stops_time" DOUBLE PRECISION NOT NULL,
    "planned_stops" DOUBLE PRECISION NOT NULL,
    "unplanned_stops" DOUBLE PRECISION NOT NULL,
    "total_parts" INTEGER NOT NULL,
    "good_parts" INTEGER NOT NULL,
    "rejected_parts" INTEGER NOT NULL,
    "raw_material_used" DOUBLE PRECISION NOT NULL,
    "raw_material_lost" DOUBLE PRECISION NOT NULL,
    "operator_name" TEXT,
    "shift" TEXT,
    "notes" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionAlert" (
    "id" TEXT NOT NULL,
    "line_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "threshold" DOUBLE PRECISION,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductionLine_organization_id_idx" ON "ProductionLine"("organization_id");

-- CreateIndex
CREATE INDEX "ProductionSession_line_id_idx" ON "ProductionSession"("line_id");
CREATE INDEX "ProductionSession_organization_id_idx" ON "ProductionSession"("organization_id");
CREATE INDEX "ProductionSession_started_at_idx" ON "ProductionSession"("started_at");

-- CreateIndex
CREATE INDEX "ProductionAlert_line_id_idx" ON "ProductionAlert"("line_id");
CREATE INDEX "ProductionAlert_organization_id_idx" ON "ProductionAlert"("organization_id");
CREATE INDEX "ProductionAlert_created_at_idx" ON "ProductionAlert"("created_at");

-- AddForeignKey
ALTER TABLE "ProductionLine" ADD CONSTRAINT "ProductionLine_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionSession" ADD CONSTRAINT "ProductionSession_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "ProductionLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionSession" ADD CONSTRAINT "ProductionSession_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAlert" ADD CONSTRAINT "ProductionAlert_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "ProductionLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionAlert" ADD CONSTRAINT "ProductionAlert_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
