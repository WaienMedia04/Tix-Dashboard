import { PrismaService } from '../prisma/prisma.service';
import { Usuario } from '@prisma/client';
import { hashTokenSesion, SESSION_COOKIE } from './session.util';

type RequestConCookies = {
  cookies?: Record<string, string | undefined>;
};

/**
 * Intenta resolver el usuario autenticado a partir de la cookie de sesión.
 * Devuelve null si no hay cookie, la sesión no existe, expiró o fue revocada
 * — nunca lanza, para que los guards decidan qué hacer con "no autenticado".
 */
export async function resolverUsuarioPorSesion(
  req: RequestConCookies,
  prisma: PrismaService,
): Promise<Usuario | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;

  const tokenHash = hashTokenSesion(token);
  const sesion = await prisma.sesion.findUnique({
    where: { tokenHash },
    include: { usuario: true },
  });

  if (!sesion || sesion.revokedAt || sesion.expiresAt < new Date()) {
    return null;
  }
  if (!sesion.usuario.activo) {
    return null;
  }
  return sesion.usuario;
}
