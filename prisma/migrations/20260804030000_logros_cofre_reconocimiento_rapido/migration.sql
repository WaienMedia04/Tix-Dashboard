-- CreateEnum
CREATE TYPE "TipoReconocimientoRapido" AS ENUM ('GRACIAS', 'EXCELENTE_TRABAJO', 'CRACK', 'INSPIRADOR', 'BUENA_IDEA', 'GRAN_COMPANERO');

-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'RECONOCIMIENTO_RAPIDO';
ALTER TYPE "TipoNotificacion" ADD VALUE 'LOGRO_DESBLOQUEADO';

-- CreateTable
CREATE TABLE "ReconocimientoRapido" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "remitenteUsuarioId" TEXT NOT NULL,
    "tipo" "TipoReconocimientoRapido" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconocimientoRapido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentoLogro" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "logroId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentoLogro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentoCofreApertura" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "monedas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentoCofreApertura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReconocimientoRapido_empresaId_talentoId_idx" ON "ReconocimientoRapido"("empresaId", "talentoId");

-- CreateIndex
CREATE INDEX "ReconocimientoRapido_empresaId_idx" ON "ReconocimientoRapido"("empresaId");

-- CreateIndex
CREATE INDEX "TalentoLogro_empresaId_idx" ON "TalentoLogro"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentoLogro_talentoId_logroId_key" ON "TalentoLogro"("talentoId", "logroId");

-- CreateIndex
CREATE INDEX "TalentoCofreApertura_empresaId_idx" ON "TalentoCofreApertura"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentoCofreApertura_talentoId_fecha_key" ON "TalentoCofreApertura"("talentoId", "fecha");

-- AddForeignKey
ALTER TABLE "ReconocimientoRapido" ADD CONSTRAINT "ReconocimientoRapido_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconocimientoRapido" ADD CONSTRAINT "ReconocimientoRapido_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconocimientoRapido" ADD CONSTRAINT "ReconocimientoRapido_remitenteUsuarioId_fkey" FOREIGN KEY ("remitenteUsuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoLogro" ADD CONSTRAINT "TalentoLogro_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoLogro" ADD CONSTRAINT "TalentoLogro_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoCofreApertura" ADD CONSTRAINT "TalentoCofreApertura_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoCofreApertura" ADD CONSTRAINT "TalentoCofreApertura_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
