-- AlterTable
ALTER TABLE "TalentoPerfilMural" ADD COLUMN     "marcoId" TEXT,
ADD COLUMN     "tituloId" TEXT;

-- CreateTable
CREATE TABLE "TalentoItemComprado" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentoItemComprado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalentoItemComprado_empresaId_idx" ON "TalentoItemComprado"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentoItemComprado_talentoId_itemId_key" ON "TalentoItemComprado"("talentoId", "itemId");

-- AddForeignKey
ALTER TABLE "TalentoItemComprado" ADD CONSTRAINT "TalentoItemComprado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoItemComprado" ADD CONSTRAINT "TalentoItemComprado_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
