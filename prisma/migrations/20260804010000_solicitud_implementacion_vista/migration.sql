-- AlterTable
ALTER TABLE "SolicitudImplementacion" ADD COLUMN "vista" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "SolicitudImplementacion_vista_idx" ON "SolicitudImplementacion"("vista");
