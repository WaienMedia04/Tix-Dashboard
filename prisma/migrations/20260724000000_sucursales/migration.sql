-- CreateTable
CREATE TABLE "UsuarioEmpresaAcceso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioEmpresaAcceso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsuarioEmpresaAcceso_usuarioId_idx" ON "UsuarioEmpresaAcceso"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioEmpresaAcceso_empresaId_idx" ON "UsuarioEmpresaAcceso"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEmpresaAcceso_usuarioId_empresaId_key" ON "UsuarioEmpresaAcceso"("usuarioId", "empresaId");

-- AddForeignKey
ALTER TABLE "UsuarioEmpresaAcceso" ADD CONSTRAINT "UsuarioEmpresaAcceso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEmpresaAcceso" ADD CONSTRAINT "UsuarioEmpresaAcceso_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
