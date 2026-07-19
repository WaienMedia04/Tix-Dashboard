-- CreateEnum
CREATE TYPE "TipoEstampaForma" AS ENUM ('REDONDEADO', 'CIRCULAR', 'CUADRADO', 'DIAMANTE');

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Talento" ADD COLUMN     "carnetFotoUrl" TEXT;

-- CreateTable
CREATE TABLE "TalentoPerfilMural" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "apodo" TEXT,
    "meGusta" TEXT,
    "noMeGusta" TEXT,
    "cancionFavorita" TEXT,
    "superpoder" TEXT,
    "fondoId" TEXT NOT NULL DEFAULT 'aurora',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentoPerfilMural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuralNotaAdhesiva" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'amarillo',
    "posX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "posY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "rotacion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MuralNotaAdhesiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstampaDefinicion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "forma" "TipoEstampaForma" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPorUsuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstampaDefinicion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstampaOtorgada" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "estampaDefinicionId" TEXT NOT NULL,
    "otorgadoPorUsuarioId" TEXT NOT NULL,
    "mensaje" TEXT,
    "posX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "posY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstampaOtorgada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TalentoPerfilMural_talentoId_key" ON "TalentoPerfilMural"("talentoId");

-- CreateIndex
CREATE INDEX "TalentoPerfilMural_empresaId_idx" ON "TalentoPerfilMural"("empresaId");

-- CreateIndex
CREATE INDEX "MuralNotaAdhesiva_empresaId_idx" ON "MuralNotaAdhesiva"("empresaId");

-- CreateIndex
CREATE INDEX "MuralNotaAdhesiva_empresaId_talentoId_idx" ON "MuralNotaAdhesiva"("empresaId", "talentoId");

-- CreateIndex
CREATE INDEX "EstampaDefinicion_empresaId_idx" ON "EstampaDefinicion"("empresaId");

-- CreateIndex
CREATE INDEX "EstampaOtorgada_empresaId_idx" ON "EstampaOtorgada"("empresaId");

-- CreateIndex
CREATE INDEX "EstampaOtorgada_empresaId_talentoId_idx" ON "EstampaOtorgada"("empresaId", "talentoId");

-- CreateIndex
CREATE INDEX "EstampaOtorgada_estampaDefinicionId_idx" ON "EstampaOtorgada"("estampaDefinicionId");

-- AddForeignKey
ALTER TABLE "TalentoPerfilMural" ADD CONSTRAINT "TalentoPerfilMural_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoPerfilMural" ADD CONSTRAINT "TalentoPerfilMural_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuralNotaAdhesiva" ADD CONSTRAINT "MuralNotaAdhesiva_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuralNotaAdhesiva" ADD CONSTRAINT "MuralNotaAdhesiva_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstampaDefinicion" ADD CONSTRAINT "EstampaDefinicion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstampaDefinicion" ADD CONSTRAINT "EstampaDefinicion_creadoPorUsuarioId_fkey" FOREIGN KEY ("creadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstampaOtorgada" ADD CONSTRAINT "EstampaOtorgada_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstampaOtorgada" ADD CONSTRAINT "EstampaOtorgada_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstampaOtorgada" ADD CONSTRAINT "EstampaOtorgada_estampaDefinicionId_fkey" FOREIGN KEY ("estampaDefinicionId") REFERENCES "EstampaDefinicion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstampaOtorgada" ADD CONSTRAINT "EstampaOtorgada_otorgadoPorUsuarioId_fkey" FOREIGN KEY ("otorgadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
