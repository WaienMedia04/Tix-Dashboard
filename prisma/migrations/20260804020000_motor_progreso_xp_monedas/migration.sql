-- CreateTable
CREATE TABLE "TalentoProgreso" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "monedas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentoProgreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentoProgresoEvento" (
    "id" TEXT NOT NULL,
    "progresoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "referenciaId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "monedas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentoProgresoEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TalentoProgreso_talentoId_key" ON "TalentoProgreso"("talentoId");

-- CreateIndex
CREATE INDEX "TalentoProgreso_empresaId_idx" ON "TalentoProgreso"("empresaId");

-- CreateIndex
CREATE INDEX "TalentoProgresoEvento_progresoId_idx" ON "TalentoProgresoEvento"("progresoId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentoProgresoEvento_progresoId_tipo_referenciaId_key" ON "TalentoProgresoEvento"("progresoId", "tipo", "referenciaId");

-- AddForeignKey
ALTER TABLE "TalentoProgreso" ADD CONSTRAINT "TalentoProgreso_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoProgreso" ADD CONSTRAINT "TalentoProgreso_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoProgresoEvento" ADD CONSTRAINT "TalentoProgresoEvento_progresoId_fkey" FOREIGN KEY ("progresoId") REFERENCES "TalentoProgreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

