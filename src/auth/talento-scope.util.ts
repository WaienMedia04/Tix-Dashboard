import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from './actor.types';

/**
 * Filtro Prisma para "qué talentos puede ver este actor":
 *  - CEO, RRHH y tráfico de servicio (ClawLink) → toda la empresa.
 *  - MANAGER → solo los talentos de su departamento asignado
 *    (Usuario.departamentoGestionado, comparado por texto exacto contra
 *    Talento.departamento).
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
    // Sin departamento asignado todavía → no ve a nadie (en vez de toda la
    // empresa por accidente si se compara contra `null`).
    return {
      ...base,
      departamento: actor.usuario.departamentoGestionado ?? '__ninguno__',
    };
  }
  if (actor.usuario.rol === 'TALENTO') {
    return { ...base, id: actor.usuario.talentoId ?? '__ninguno__' };
  }
  return base; // CEO, RRHH
}

/**
 * Igual que talentoScopeWhere, pero además excluye a los talentos
 * inactivos — para las métricas (dashboard, KPIs, rankings, reportes),
 * donde un empleado que ya no está no debe figurar ni contar. La lista de
 * Empleados y el histórico de Bitácoras siguen usando talentoScopeWhere
 * sin este filtro: ahí sí interesa ver/buscar inactivos.
 */
export function talentoActivoScopeWhere(
  actor: Actor,
): Prisma.TalentoWhereInput {
  return { ...talentoScopeWhere(actor), estado: 'activo' };
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
