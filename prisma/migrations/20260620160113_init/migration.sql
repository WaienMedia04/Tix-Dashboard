-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "codigoAcceso" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Talento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Talento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worklog" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "actividadesRealizadas" TEXT NOT NULL,
    "queSeEjecuto" TEXT NOT NULL,
    "detallesRelevantes" TEXT NOT NULL,
    "informeAvances" TEXT NOT NULL,
    "objetivoDia" TEXT NOT NULL,
    "estadoEnvio" TEXT NOT NULL,
    "horaEnvio" TEXT NOT NULL,
    "dia" TEXT,
    "semana" INTEGER,
    "capacitacion" TEXT,
    "puntajeIA" INTEGER,
    "calificacionCeo" TEXT,
    "notasTix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Worklog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_slug_key" ON "Empresa"("slug");

-- CreateIndex
CREATE INDEX "Talento_empresaId_idx" ON "Talento"("empresaId");

-- CreateIndex
CREATE INDEX "Worklog_empresaId_idx" ON "Worklog"("empresaId");

-- CreateIndex
CREATE INDEX "Worklog_empresaId_fecha_idx" ON "Worklog"("empresaId", "fecha");

-- AddForeignKey
ALTER TABLE "Talento" ADD CONSTRAINT "Talento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worklog" ADD CONSTRAINT "Worklog_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worklog" ADD CONSTRAINT "Worklog_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
