-- CreateTable
CREATE TABLE "TalentoMisionReclamada" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "misionId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentoMisionReclamada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalentoMisionReclamada_empresaId_idx" ON "TalentoMisionReclamada"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentoMisionReclamada_talentoId_misionId_periodoId_key" ON "TalentoMisionReclamada"("talentoId", "misionId", "periodoId");

-- AddForeignKey
ALTER TABLE "TalentoMisionReclamada" ADD CONSTRAINT "TalentoMisionReclamada_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoMisionReclamada" ADD CONSTRAINT "TalentoMisionReclamada_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

