-- CreateTable
CREATE TABLE "PizarraPost" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "autorUsuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizarraPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PizarraReaccion" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizarraReaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PizarraComentario" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "autorUsuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PizarraComentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PizarraMencion" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "PizarraMencion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PizarraPost_empresaId_createdAt_idx" ON "PizarraPost"("empresaId", "createdAt");

-- CreateIndex
CREATE INDEX "PizarraReaccion_postId_idx" ON "PizarraReaccion"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PizarraReaccion_postId_usuarioId_emoji_key" ON "PizarraReaccion"("postId", "usuarioId", "emoji");

-- CreateIndex
CREATE INDEX "PizarraComentario_postId_createdAt_idx" ON "PizarraComentario"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PizarraMencion_usuarioId_idx" ON "PizarraMencion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PizarraMencion_postId_usuarioId_key" ON "PizarraMencion"("postId", "usuarioId");

-- AddForeignKey
ALTER TABLE "PizarraPost" ADD CONSTRAINT "PizarraPost_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraPost" ADD CONSTRAINT "PizarraPost_autorUsuarioId_fkey" FOREIGN KEY ("autorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraReaccion" ADD CONSTRAINT "PizarraReaccion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PizarraPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraReaccion" ADD CONSTRAINT "PizarraReaccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraComentario" ADD CONSTRAINT "PizarraComentario_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PizarraPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraComentario" ADD CONSTRAINT "PizarraComentario_autorUsuarioId_fkey" FOREIGN KEY ("autorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraMencion" ADD CONSTRAINT "PizarraMencion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PizarraPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizarraMencion" ADD CONSTRAINT "PizarraMencion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
