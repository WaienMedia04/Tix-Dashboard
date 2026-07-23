-- CreateEnum
CREATE TYPE "EmojiClima" AS ENUM ('FELIZ', 'NEUTRAL', 'TRISTE', 'CANSADO', 'EMOCIONADO');

-- CreateTable
CREATE TABLE "PizarraClimaRespuesta" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "emoji" "EmojiClima" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizarraClimaRespuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PizarraTimeCapsula" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fechaApertura" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizarraTimeCapsula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PizarraClimaRespuesta_empresaId_fecha_idx" ON "PizarraClimaRespuesta"("empresaId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "PizarraClimaRespuesta_empresaId_usuarioId_fecha_key" ON "PizarraClimaRespuesta"("empresaId", "usuarioId", "fecha");

-- CreateIndex
CREATE INDEX "PizarraTimeCapsula_empresaId_usuarioId_idx" ON "PizarraTimeCapsula"("empresaId", "usuarioId");

-- AddForeignKey
ALTER TABLE "PizarraClimaRespuesta" ADD CONSTRAINT "PizarraClimaRespuesta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraClimaRespuesta" ADD CONSTRAINT "PizarraClimaRespuesta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraTimeCapsula" ADD CONSTRAINT "PizarraTimeCapsula_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraTimeCapsula" ADD CONSTRAINT "PizarraTimeCapsula_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
