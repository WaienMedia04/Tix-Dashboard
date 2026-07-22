-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'GERENTE_GENERAL';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "departamentosSupervisados" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
