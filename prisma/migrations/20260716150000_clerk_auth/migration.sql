-- DropForeignKey
ALTER TABLE "Sesion" DROP CONSTRAINT "Sesion_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "passwordDebeCambiar",
DROP COLUMN "passwordHash",
ADD COLUMN     "clerkUserId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Sesion";

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_clerkUserId_key" ON "Usuario"("clerkUserId");

