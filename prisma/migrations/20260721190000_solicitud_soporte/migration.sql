-- CreateEnum
CREATE TYPE "TipoSoporte" AS ENUM ('AVERIA', 'SUGERENCIA');

-- CreateTable
CREATE TABLE "SolicitudSoporte" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoSoporte" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitudSoporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SolicitudSoporte_empresaId_idx" ON "SolicitudSoporte"("empresaId");

-- CreateIndex
CREATE INDEX "SolicitudSoporte_leida_idx" ON "SolicitudSoporte"("leida");

-- AddForeignKey
ALTER TABLE "SolicitudSoporte" ADD CONSTRAINT "SolicitudSoporte_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudSoporte" ADD CONSTRAINT "SolicitudSoporte_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
