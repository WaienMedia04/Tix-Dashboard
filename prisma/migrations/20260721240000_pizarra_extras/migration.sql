-- CreateTable
CREATE TABLE "PizarraEncuesta" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "creadoPorUsuarioId" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "opciones" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizarraEncuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PizarraEncuestaVoto" (
    "id" TEXT NOT NULL,
    "encuestaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "opcionIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizarraEncuestaVoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PizarraReconocimiento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "creadoPorUsuarioId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizarraReconocimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PizarraTriviaRespuesta" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "correcta" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizarraTriviaRespuesta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PizarraEncuesta_empresaId_createdAt_idx" ON "PizarraEncuesta"("empresaId", "createdAt");

-- CreateIndex
CREATE INDEX "PizarraEncuestaVoto_encuestaId_idx" ON "PizarraEncuestaVoto"("encuestaId");

-- CreateIndex
CREATE UNIQUE INDEX "PizarraEncuestaVoto_encuestaId_usuarioId_key" ON "PizarraEncuestaVoto"("encuestaId", "usuarioId");

-- CreateIndex
CREATE INDEX "PizarraReconocimiento_empresaId_activo_idx" ON "PizarraReconocimiento"("empresaId", "activo");

-- CreateIndex
CREATE INDEX "PizarraTriviaRespuesta_empresaId_fecha_idx" ON "PizarraTriviaRespuesta"("empresaId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "PizarraTriviaRespuesta_empresaId_usuarioId_fecha_key" ON "PizarraTriviaRespuesta"("empresaId", "usuarioId", "fecha");

-- AddForeignKey
ALTER TABLE "PizarraEncuesta" ADD CONSTRAINT "PizarraEncuesta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraEncuesta" ADD CONSTRAINT "PizarraEncuesta_creadoPorUsuarioId_fkey" FOREIGN KEY ("creadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraEncuestaVoto" ADD CONSTRAINT "PizarraEncuestaVoto_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "PizarraEncuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraEncuestaVoto" ADD CONSTRAINT "PizarraEncuestaVoto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraReconocimiento" ADD CONSTRAINT "PizarraReconocimiento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraReconocimiento" ADD CONSTRAINT "PizarraReconocimiento_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraReconocimiento" ADD CONSTRAINT "PizarraReconocimiento_creadoPorUsuarioId_fkey" FOREIGN KEY ("creadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraTriviaRespuesta" ADD CONSTRAINT "PizarraTriviaRespuesta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraTriviaRespuesta" ADD CONSTRAINT "PizarraTriviaRespuesta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
