-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'NOTA_RECIBIDA';

-- AlterTable
ALTER TABLE "MuralNotaAdhesiva" ADD COLUMN     "enviadaPorUsuarioId" TEXT;

-- AlterTable
ALTER TABLE "TalentoPerfilMural" ALTER COLUMN "fondoId" SET DEFAULT 'corcho';

-- AddForeignKey
ALTER TABLE "MuralNotaAdhesiva" ADD CONSTRAINT "MuralNotaAdhesiva_enviadaPorUsuarioId_fkey" FOREIGN KEY ("enviadaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Los murales que nunca cambiaron el fondo (siguen en el valor por defecto
-- anterior) pasan al nuevo fondo de corcho por defecto. No toca los que ya
-- fueron elegidos a propósito (cualquier otro valor).
UPDATE "TalentoPerfilMural" SET "fondoId" = 'corcho' WHERE "fondoId" = 'aurora';
