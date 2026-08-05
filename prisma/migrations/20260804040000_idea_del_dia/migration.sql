-- AlterTable
ALTER TABLE "PizarraPost" ADD COLUMN     "aprobada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "esIdea" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "PizarraPost_empresaId_esIdea_createdAt_idx" ON "PizarraPost"("empresaId", "esIdea", "createdAt");

-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'IDEA_APROBADA';
