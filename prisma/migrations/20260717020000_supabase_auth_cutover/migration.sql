-- Paso 2 (destructivo — aplicar SOLO después de correr
-- scripts/migrar-usuarios-supabase.ts contra producción y confirmar que
-- todo Usuario existente ya tiene supabaseUserId asignado). Corta el
-- login por bcrypt/Sesion definitivamente.

-- DropForeignKey
ALTER TABLE "Sesion" DROP CONSTRAINT "Sesion_usuarioId_fkey";

-- DropTable
DROP TABLE "Sesion";

-- AlterTable
ALTER TABLE "Usuario"
DROP COLUMN "passwordDebeCambiar",
DROP COLUMN "passwordHash",
ALTER COLUMN "supabaseUserId" SET NOT NULL;
