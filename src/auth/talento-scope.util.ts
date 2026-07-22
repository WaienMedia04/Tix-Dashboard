import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from './actor.types';

/**
 * Filtro Prisma para "qué talentos puede ver este actor", con un filtro de
 * departamento adicional y opcional (usado por los selectores de
 * departamento en Bitácoras/KPIs/Rankings/Reportes):
 *  - CEO, RRHH y tráfico de servicio (ClawLink) → toda la empresa, o un
 *    solo departamento si se pasa `filtroDepartamento`.
 *  - GERENTE_GENERAL → los talentos de todos los departamentos que
 *    supervisa (Usuario.departamentosSupervisados); si `filtroDepartamento`
 *    no está entre los suyos, no ve nada (nunca se filtra "de más").
 *  - MANAGER → solo los talentos de su departamento asignado
 *    (Usuario.departamentoGestionado, comparado por texto exacto contra
 *    Talento.departamento); mismo criterio de "nunca de más" si
 *    `filtroDepartamento` no coincide con el suyo.
 *  - TALENTO → solo a sí mismo.
 *
 * En todos los casos se excluyen los talentos vinculados a un Usuario
 * CEO/RRHH — esos usuarios son quienes monitorean, nunca deben figurar
 * ellos mismos como talento en seguimiento ni contar en las métricas.
 */
export function talentoScopeWhere(
  actor: Actor,
  filtroDepartamento?: string,
): Prisma.TalentoWhereInput {
  const base: Prisma.TalentoWhereInput = {
    empresaId: actor.empresaId,
    OR: [{ usuario: null }, { usuario: { rol: { notIn: ['CEO', 'RRHH'] } } }],
  };
  const sinResultados: Prisma.TalentoWhereInput = {
    ...base,
    id: '__ninguno__',
  };

  if (actor.type !== 'usuario') {
    return filtroDepartamento
      ? { ...base, departamento: filtroDepartamento }
      : base;
  }

  if (actor.usuario.rol === 'MANAGER') {
    const propio = actor.usuario.departamentoGestionado;
    if (!propio) return sinResultados;
    if (filtroDepartamento && filtroDepartamento !== propio) {
      return sinResultados;
    }
    return { ...base, departamento: propio };
  }

  if (actor.usuario.rol === 'GERENTE_GENERAL') {
    const propios = actor.usuario.departamentosSupervisados;
    if (propios.length === 0) return sinResultados;
    if (filtroDepartamento) {
      if (!propios.includes(filtroDepartamento)) return sinResultados;
      return { ...base, departamento: filtroDepartamento };
    }
    return { ...base, departamento: { in: propios } };
  }

  if (actor.usuario.rol === 'TALENTO') {
    const propio: Prisma.TalentoWhereInput = {
      ...base,
      id: actor.usuario.talentoId ?? '__ninguno__',
    };
    return filtroDepartamento
      ? { ...propio, departamento: filtroDepartamento }
      : propio;
  }

  // CEO, RRHH
  return filtroDepartamento
    ? { ...base, departamento: filtroDepartamento }
    : base;
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
  filtroDepartamento?: string,
): Prisma.TalentoWhereInput {
  return { ...talentoScopeWhere(actor, filtroDepartamento), estado: 'activo' };
}

/**
 * Devuelve `null` cuando el actor ve toda la empresa sin ningún filtro que
 * aplicar (nada que restringir), o el array de talentoId permitidos en
 * cualquier otro caso — incluso vacío, para no filtrar "sin filtro". Un
 * `filtroDepartamento` fuerza siempre a resolver la lista, sin importar el
 * rol, porque hasta CEO/RRHH necesitan acotarse a un departamento puntual.
 */
export async function resolverAlcanceTalentoIds(
  actor: Actor,
  prisma: PrismaService,
  filtroDepartamento?: string,
): Promise<string[] | null> {
  const rolAcotado =
    actor.type === 'usuario' &&
    (actor.usuario.rol === 'MANAGER' ||
      actor.usuario.rol === 'GERENTE_GENERAL' ||
      actor.usuario.rol === 'TALENTO');

  if (!rolAcotado && !filtroDepartamento) return null;

  const talentos = await prisma.talento.findMany({
    where: talentoScopeWhere(actor, filtroDepartamento),
    select: { id: true },
  });
  return talentos.map((t) => t.id);
}
