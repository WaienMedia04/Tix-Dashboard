-- CreateTable
CREATE TABLE "ChatConversacion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "esGrupo" BOOLEAN NOT NULL DEFAULT false,
    "nombre" TEXT,
    "creadoPorUsuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatConversacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipante" (
    "id" TEXT NOT NULL,
    "conversacionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "ultimaLecturaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMensaje" (
    "id" TEXT NOT NULL,
    "conversacionId" TEXT NOT NULL,
    "autorUsuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "esChisme" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatConversacion_empresaId_idx" ON "ChatConversacion"("empresaId");

-- CreateIndex
CREATE INDEX "ChatParticipante_usuarioId_idx" ON "ChatParticipante"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipante_conversacionId_usuarioId_key" ON "ChatParticipante"("conversacionId", "usuarioId");

-- CreateIndex
CREATE INDEX "ChatMensaje_conversacionId_createdAt_idx" ON "ChatMensaje"("conversacionId", "createdAt");

-- AddForeignKey
ALTER TABLE "ChatConversacion" ADD CONSTRAINT "ChatConversacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversacion" ADD CONSTRAINT "ChatConversacion_creadoPorUsuarioId_fkey" FOREIGN KEY ("creadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipante" ADD CONSTRAINT "ChatParticipante_conversacionId_fkey" FOREIGN KEY ("conversacionId") REFERENCES "ChatConversacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipante" ADD CONSTRAINT "ChatParticipante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMensaje" ADD CONSTRAINT "ChatMensaje_conversacionId_fkey" FOREIGN KEY ("conversacionId") REFERENCES "ChatConversacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMensaje" ADD CONSTRAINT "ChatMensaje_autorUsuarioId_fkey" FOREIGN KEY ("autorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
