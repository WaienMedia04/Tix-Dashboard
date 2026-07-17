-- Paso 1 (aditivo, seguro sobre datos existentes): agrega las columnas
-- necesarias para Supabase Auth sin tocar aún el login por bcrypt/Sesion
-- actual. supabaseUserId queda nullable hasta que el script de migración
-- (scripts/migrar-usuarios-supabase.ts) invite a cada usuario existente y
-- lo rellene. El paso 2 (20260717020000_supabase_auth_cutover) recién
-- vuelve supabaseUserId obligatorio y elimina passwordHash/Sesion.

-- AlterTable
ALTER TABLE "Usuario"
ADD COLUMN     "supabaseUserId" TEXT,
ADD COLUMN     "passwordEstablecida" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_supabaseUserId_key" ON "Usuario"("supabaseUserId");
