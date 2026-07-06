-- Dedupe: la tabla nunca tuvo un constraint unico de (talentoId, fecha).
-- Antes de crear el indice unico, conservamos solo la fila mas reciente
-- (por createdAt) para cada combinacion talentoId+fecha que ya exista.
DELETE FROM "Worklog" w USING "Worklog" w2
WHERE w."talentoId" = w2."talentoId"
  AND w."fecha" = w2."fecha"
  AND w."createdAt" < w2."createdAt";

-- AlterTable
ALTER TABLE "Worklog" ADD COLUMN     "tareasPlanificadas" TEXT,
ADD COLUMN     "horaCheckin" TEXT,
ADD COLUMN     "checkinEnviado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cumplimientoTareas" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Worklog_talentoId_fecha_key" ON "Worklog"("talentoId", "fecha");
