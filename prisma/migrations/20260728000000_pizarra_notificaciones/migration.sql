-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'PIZARRA_REACCION';
ALTER TYPE "TipoNotificacion" ADD VALUE 'PIZARRA_COMENTARIO';
ALTER TYPE "TipoNotificacion" ADD VALUE 'PIZARRA_MENCION';
ALTER TYPE "TipoNotificacion" ADD VALUE 'PIZARRA_RECONOCIMIENTO';

-- AlterTable
ALTER TABLE "Notificacion" ADD COLUMN "usuarioId" TEXT;

-- CreateIndex
CREATE INDEX "Notificacion_empresaId_usuarioId_idx" ON "Notificacion"("empresaId", "usuarioId");

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
