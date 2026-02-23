-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contract_type" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "analysis_progress" INTEGER NOT NULL DEFAULT 0,
    "extracted_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analyzed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contract_workspace_status_idx" ON "Contract"("workspace", "status");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
