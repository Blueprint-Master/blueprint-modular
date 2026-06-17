-- Sonde de disponibilité publique : points de mesure pour la page /status.
-- Une ligne par service surveillé (vitrine, mcp) et par exécution de la sonde.

-- CreateTable
CREATE TABLE "status_check" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "http_code" INTEGER,
    "latency_ms" INTEGER,
    "detail" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_check_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "status_check_service_checked_at_idx" ON "status_check"("service", "checked_at");

-- CreateIndex
CREATE INDEX "status_check_checked_at_idx" ON "status_check"("checked_at");
