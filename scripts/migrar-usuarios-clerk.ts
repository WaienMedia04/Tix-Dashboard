/**
 * Migración única de usuarios existentes (bcrypt/Usuario) hacia Clerk.
 *
 * Uso: correr manualmente contra producción, UNA vez, entre el paso 1
 * (migración de schema aditiva que agrega `clerkUserId` sin todavía borrar
 * `passwordHash`/`Sesion`) y el paso 3 (cutover) de la secuenciación descrita
 * en el plan de la Fase C. Necesita `CLERK_SECRET_KEY` y `DATABASE_URL` en
 * el entorno — nunca se corre como parte del build/deploy normal.
 *
 * Idempotente: se puede correr más de una vez sin duplicar nada.
 *  - Si el usuario ya tiene `clerkUserId`, se salta.
 *  - Si ya existe un usuario en Clerk con ese correo (ej. por una corrida
 *    previa de este script cuya invitación ya fue aceptada), solo enlaza
 *    el id — no reenvía la invitación.
 *  - Si no existe todavía en Clerk, envía una invitación por correo y NO
 *    enlaza el id (Clerk no lo asigna hasta que la persona completa el
 *    registro) — hay que volver a correr el script después para enlazarlo.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { clerkClient } from '../src/auth/clerk-auth.util';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const REDIRECT_URL =
  process.env.CLERK_INVITATION_REDIRECT_URL ??
  'https://panel.talentix.com.do';

async function main() {
  const usuarios = await prisma.usuario.findMany();
  console.log(`Revisando ${usuarios.length} usuario(s)...`);

  for (const usuario of usuarios) {
    if (usuario.clerkUserId) {
      console.log(`  - ${usuario.email}: ya enlazado (${usuario.clerkUserId}), se omite.`);
      continue;
    }

    try {
      const existentes = await clerkClient.users.getUserList({
        emailAddress: [usuario.email],
      });

      if (existentes.data.length > 0) {
        const clerkUserId = existentes.data[0].id;
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { clerkUserId },
        });
        console.log(`  - ${usuario.email}: encontrado en Clerk, enlazado (${clerkUserId}).`);
        continue;
      }

      const invitacion = await clerkClient.invitations.createInvitation({
        emailAddress: usuario.email,
        redirectUrl: REDIRECT_URL,
      });
      console.log(
        `  - ${usuario.email}: invitación enviada (${invitacion.id}). Vuelve a correr este script después de que complete el registro para enlazar su cuenta.`,
      );
    } catch (err) {
      console.error(
        `  ! Error con ${usuario.email}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  console.log('Listo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
