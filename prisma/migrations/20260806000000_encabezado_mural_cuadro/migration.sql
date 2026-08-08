-- AlterTable
ALTER TABLE "TalentoPerfilMural" ADD COLUMN     "modoEncabezado" TEXT NOT NULL DEFAULT 'lanyard',
ADD COLUMN     "cuadroTamano" TEXT NOT NULL DEFAULT 'mediano',
ADD COLUMN     "cuadroMarcoId" TEXT;
