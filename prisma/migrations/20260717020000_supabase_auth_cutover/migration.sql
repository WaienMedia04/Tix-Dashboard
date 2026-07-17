-- Paso 2 (destructivo — aplicar SOLO después de correr
-- scripts/migrar-usuarios-supabase.ts contra producción y confirmar que
-- todo Usuario existente ya tiene supabaseUserId asignado). Corta el
-- login por bcrypt/Sesion definitivamente.

-- DropTable
-- (sin DROP CONSTRAINT explícito antes: DROP TABLE ya elimina cualquier FK
-- asociada, y el nombre exacto de esa constraint puede variar entre
-- entornos — no hay que asumirlo)
DROP TABLE "Sesion";

-- AlterTable
ALTER TABLE "Usuario"
DROP COLUMN "passwordDebeCambiar",
DROP COLUMN "passwordHash",
ALTER COLUMN "supabaseUserId" SET NOT NULL;
