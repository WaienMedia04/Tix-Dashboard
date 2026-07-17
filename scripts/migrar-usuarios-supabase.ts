/**
 * Migración manual, ejecución única: invita a cada Usuario existente (creado
 * con el login bcrypt/Sesion previo) por correo vía Supabase Auth, y guarda
 * el id devuelto como supabaseUserId. Idempotente — salta filas que ya
 * tienen supabaseUserId. Debe correr DESPUÉS de aplicar la migración
 * 20260717010000_supabase_auth_add_columns y ANTES de la migración
 * destructiva 20260717020000_supabase_auth_cutover (que todavía no debe
 * estar aplicada cuando se ejecuta este script, porque necesita las
 * columnas viejas para poder seguir corriendo sin login).
 *
 * Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DATABASE_URL=... \
 *      npx ts-node scripts/migrar-usuarios-supabase.ts
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const origenDashboard = (process.env.CORS_ORIGIN ?? '').split(',')[0]?.trim();

async function main() {
  if (!origenDashboard) {
    throw new Error('CORS_ORIGIN no está configurado');
  }

  // Filtrado en memoria (no en el `where`): schema.prisma ya modela
  // supabaseUserId como obligatorio (estado post-corte), pero este script
  // corre a propósito en la ventana transicional donde la columna todavía
  // es nullable en la base real — el tipo generado por Prisma Client no
  // acepta `null` como filtro para un campo que él cree no-nulo.
  const todos = await prisma.usuario.findMany({
    select: { id: true, email: true, nombre: true, rol: true, supabaseUserId: true },
  });
  const usuarios = todos.filter((u) => !u.supabaseUserId);

  console.log(`${usuarios.length} usuario(s) por migrar.`);

  let exitos = 0;
  let fallos = 0;

  for (const usuario of usuarios) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(
      usuario.email,
      {
        redirectTo: `${origenDashboard}/auth/confirm`,
        data: { nombre: usuario.nombre, rol: usuario.rol },
      },
    );

    if (error || !data?.user) {
      fallos++;
      console.error(
        `✗ ${usuario.email}: ${error?.message ?? 'error desconocido'}`,
      );
      continue;
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { supabaseUserId: data.user.id },
    });
    exitos++;
    console.log(`✓ ${usuario.email} → ${data.user.id}`);
  }

  console.log(`\nListo. ${exitos} invitados, ${fallos} fallidos.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
