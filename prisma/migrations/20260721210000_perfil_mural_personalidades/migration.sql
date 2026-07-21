-- AlterTable
ALTER TABLE "TalentoPerfilMural" ADD COLUMN "personalidades" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
