-- CreateEnum
CREATE TYPE "EstadoVacante" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateTable
CREATE TABLE "Vacante" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "departamento" TEXT,
    "estado" "EstadoVacante" NOT NULL DEFAULT 'ABIERTA',
    "creadoPorUsuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vacante_empresaId_createdAt_idx" ON "Vacante"("empresaId", "createdAt");

-- CreateIndex
CREATE INDEX "Vacante_empresaId_estado_idx" ON "Vacante"("empresaId", "estado");

-- AddForeignKey
ALTER TABLE "Vacante" ADD CONSTRAINT "Vacante_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacante" ADD CONSTRAINT "Vacante_creadoPorUsuarioId_fkey" FOREIGN KEY ("creadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
