-- CreateTable
CREATE TABLE "generador_borradores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doc_id" TEXT NOT NULL,
    "user_id" UUID,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generador_borradores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generador_borradores_doc_id_key" ON "generador_borradores"("doc_id");
