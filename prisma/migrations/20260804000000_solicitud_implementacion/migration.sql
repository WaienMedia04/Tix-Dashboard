-- CreateEnum
CREATE TYPE "EstadoSolicitudImplementacion" AS ENUM ('NUEVA', 'EN_PROCESO', 'COMPLETADA');

-- CreateTable
CREATE TABLE "SolicitudImplementacion" (
    "id" TEXT NOT NULL,
    "estado" "EstadoSolicitudImplementacion" NOT NULL DEFAULT 'NUEVA',
    "empresaNombre" TEXT NOT NULL,
    "giroNegocio" TEXT,
    "cantidadEmpleados" INTEGER,
    "logoUrl" TEXT,
    "departamentos" TEXT[],
    "rolesMultiples" TEXT,
    "ceoNombre" TEXT,
    "rrhhNombre" TEXT,
    "encargadosPorDepartamento" JSONB,
    "rosterArchivoUrl" TEXT,
    "quiereVacantesIA" BOOLEAN NOT NULL DEFAULT false,
    "canalBitacoras" TEXT NOT NULL,
    "nombreGrupo" TEXT,
    "horaCheckin" TEXT,
    "horaCheckout" TEXT,
    "diasLaborales" TEXT[],
    "receptorAlertas" TEXT,
    "buenDiaTrabajo" TEXT,
    "medicionPorRol" TEXT,
    "queCalificaBajo" TEXT,
    "interesaCumplimiento" TEXT,
    "baseTalentoDelMes" TEXT,
    "contactoNombre" TEXT NOT NULL,
    "contactoCargo" TEXT,
    "contactoCorreo" TEXT NOT NULL,
    "contactoTelefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudImplementacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SolicitudImplementacion_estado_createdAt_idx" ON "SolicitudImplementacion"("estado", "createdAt");
