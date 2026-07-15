import type { Request } from 'express';
import { Rol, Talento, Usuario } from '@prisma/client';

/**
 * Quién está haciendo la request:
 * - "usuario": un humano autenticado por sesión (cookie), con rol.
 * - "servicio": tráfico máquina-a-máquina (ClawLink) autenticado por el
 *   codigoAcceso compartido de la empresa — acceso completo, sin rol.
 */
export type Actor =
  | { type: 'usuario'; usuario: Usuario; empresaId: string }
  | { type: 'servicio'; empresaId: string };

export function esRol(actor: Actor, ...roles: Rol[]): boolean {
  return actor.type === 'usuario' && roles.includes(actor.usuario.rol);
}

/** Request de Express ya enriquecida por CompanyAccessGuard/SessionGuard. */
export interface RequestConActor extends Request {
  actor?: Actor;
  talento?: Talento;
}
