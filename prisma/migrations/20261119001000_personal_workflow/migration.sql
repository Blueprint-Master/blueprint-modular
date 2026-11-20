CREATE TABLE "WorkflowTransition" (
    "user_id" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "entity_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "from_state" TEXT NOT NULL,
    "to_state" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("user_id", "entity_id", "revision")
);
