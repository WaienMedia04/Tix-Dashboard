-- CreateEnum
CREATE TYPE "TipoBoletin" AS ENUM ('NOTICIA', 'EVENTO', 'BLOG');

-- CreateTable
CREATE TABLE "Boletin" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipo" "TipoBoletin" NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaEvento" TIMESTAMP(3),
    "creadoPorUsuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boletin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Boletin_empresaId_createdAt_idx" ON "Boletin"("empresaId", "createdAt");

-- AddForeignKey
ALTER TABLE "Boletin" ADD CONSTRAINT "Boletin_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boletin" ADD CONSTRAINT "Boletin_creadoPorUsuarioId_fkey" FOREIGN KEY ("creadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
