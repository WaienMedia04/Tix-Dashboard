-- CreateEnum
CREATE TYPE "TipoNovedad" AS ENUM ('LOGRO', 'BUENA_ACCION', 'AUSENCIA', 'ERROR', 'SITUACION');

-- CreateTable
CREATE TABLE "Novedad" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "tipo" "TipoNovedad" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "creadoPorUsuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Novedad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Novedad_empresaId_idx" ON "Novedad"("empresaId");

-- CreateIndex
CREATE INDEX "Novedad_empresaId_talentoId_idx" ON "Novedad"("empresaId", "talentoId");

-- AddForeignKey
ALTER TABLE "Novedad" ADD CONSTRAINT "Novedad_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novedad" ADD CONSTRAINT "Novedad_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novedad" ADD CONSTRAINT "Novedad_creadoPorUsuarioId_fkey" FOREIGN KEY ("creadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
