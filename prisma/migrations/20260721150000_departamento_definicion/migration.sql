-- CreateTable
CREATE TABLE "DepartamentoDefinicion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartamentoDefinicion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DepartamentoDefinicion_empresaId_idx" ON "DepartamentoDefinicion"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartamentoDefinicion_empresaId_nombre_key" ON "DepartamentoDefinicion"("empresaId", "nombre");

-- AddForeignKey
ALTER TABLE "DepartamentoDefinicion" ADD CONSTRAINT "DepartamentoDefinicion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
