-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('ESTAMPA_RECIBIDA', 'CUMPLEANOS', 'AUSENCIA_REGISTRADA', 'NOVEDAD_PUBLICADA', 'CV_LISTO_PARA_REVISAR');

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "personal" BOOLEAN NOT NULL DEFAULT false,
    "rolesDestino" "Rol"[],
    "talentoId" TEXT,
    "enlace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificacionLectura" (
    "id" TEXT NOT NULL,
    "notificacionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "leidoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificacionLectura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacion_empresaId_idx" ON "Notificacion"("empresaId");

-- CreateIndex
CREATE INDEX "Notificacion_empresaId_talentoId_idx" ON "Notificacion"("empresaId", "talentoId");

-- CreateIndex
CREATE INDEX "Notificacion_empresaId_createdAt_idx" ON "Notificacion"("empresaId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificacionLectura_usuarioId_idx" ON "NotificacionLectura"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificacionLectura_notificacionId_usuarioId_key" ON "NotificacionLectura"("notificacionId", "usuarioId");

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacionLectura" ADD CONSTRAINT "NotificacionLectura_notificacionId_fkey" FOREIGN KEY ("notificacionId") REFERENCES "Notificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacionLectura" ADD CONSTRAINT "NotificacionLectura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
