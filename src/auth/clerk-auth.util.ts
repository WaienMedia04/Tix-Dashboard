import type { Request } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Intenta resolver el usuario autenticado a partir del header
 * `Authorization: Bearer <token>` (JWT de sesión de Clerk). Devuelve null si
 * no hay header, el token no verifica, o el usuario no existe/está inactivo
 * — nunca lanza, para que los guards decidan qué hacer con "no autenticado".
 */
export async function resolverUsuarioPorBearer(
  req: Request,
  prisma: PrismaService,
): Promise<Usuario | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length);

  let clerkUserId: string;
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    clerkUserId = payload.sub;
  } catch {
    return null;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { clerkUserId },
  });
  if (!usuario || !usuario.activo) {
    return null;
  }
  return usuario;
}
