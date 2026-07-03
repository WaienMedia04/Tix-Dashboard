-- DropForeignKey
ALTER TABLE "Talento" DROP CONSTRAINT "Talento_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "Worklog" DROP CONSTRAINT "Worklog_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "Worklog" DROP CONSTRAINT "Worklog_talentoId_fkey";

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "botToken" TEXT;

-- AlterTable
ALTER TABLE "Talento" ADD COLUMN     "cedula" TEXT,
ADD COLUMN     "correo" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "fechaIngreso" TIMESTAMP(3),
ADD COLUMN     "fechaNacimiento" TIMESTAMP(3),
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "telefono" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_botToken_key" ON "Empresa"("botToken");

-- AddForeignKey
ALTER TABLE "Talento" ADD CONSTRAINT "Talento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worklog" ADD CONSTRAINT "Worklog_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worklog" ADD CONSTRAINT "Worklog_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "Talento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
