import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from './actor.types';

/**
 * Filtro Prisma para "qué talentos puede ver este actor":
 *  - CEO, RRHH y tráfico de servicio (ClawLink) → toda la empresa.
 *  - MANAGER → solo los talentos que le reportan.
 *  - TALENTO → solo a sí mismo.
 *
 * En todos los casos se excluyen los talentos vinculados a un Usuario
 * CEO/RRHH — esos usuarios son quienes monitorean, nunca deben figurar
 * ellos mismos como talento en seguimiento ni contar en las métricas.
 */
export function talentoScopeWhere(actor: Actor): Prisma.TalentoWhereInput {
  const base: Prisma.TalentoWhereInput = {
    empresaId: actor.empresaId,
    OR: [{ usuario: null }, { usuario: { rol: { notIn: ['CEO', 'RRHH'] } } }],
  };
  if (actor.type !== 'usuario') return base;

  if (actor.usuario.rol === 'MANAGER') {
    return { ...base, managerUsuarioId: actor.usuario.id };
  }
  if (actor.usuario.rol === 'TALENTO') {
    return { ...base, id: actor.usuario.talentoId ?? '__ninguno__' };
  }
  return base; // CEO, RRHH
}

/**
 * Devuelve `null` cuando el actor ve toda la empresa (sin restricción que
 * aplicar), o el array de talentoId permitidos cuando el alcance es parcial
 * (MANAGER/TALENTO) — incluso si queda vacío, para no filtrar "sin filtro".
 */
export async function resolverAlcanceTalentoIds(
  actor: Actor,
  prisma: PrismaService,
): Promise<string[] | null> {
  if (actor.type !== 'usuario') return null;
  if (actor.usuario.rol !== 'MANAGER' && actor.usuario.rol !== 'TALENTO') {
    return null;
  }
  const talentos = await prisma.talento.findMany({
    where: talentoScopeWhere(actor),
    select: { id: true },
  });
  return talentos.map((t) => t.id);
}
