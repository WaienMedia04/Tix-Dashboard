-- AlterTable
ALTER TABLE "Worklog" ALTER COLUMN "actividadesRealizadas" DROP NOT NULL,
ALTER COLUMN "queSeEjecuto" DROP NOT NULL,
ALTER COLUMN "detallesRelevantes" DROP NOT NULL,
ALTER COLUMN "informeAvances" DROP NOT NULL,
ALTER COLUMN "objetivoDia" DROP NOT NULL,
ALTER COLUMN "horaEnvio" DROP NOT NULL;
