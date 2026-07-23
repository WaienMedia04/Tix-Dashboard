import { PrismaService } from '../prisma/prisma.service';
import { esAusenciaAutorizada } from '../empresas/estado.util';

const LIMITE_DIAS_RACHA = 400;

/** Suma (o resta) días a una fecha ISO (YYYY-MM-DD) trabajando siempre en UTC — mismo criterio con el que se guarda `Worklog.fecha`. */
function sumarDiasISO(iso: string, delta: number): string {
  const fecha = new Date(`${iso}T00:00:00.000Z`);
  fecha.setUTCDate(fecha.getUTCDate() + delta);
  return fecha.toISOString().slice(0, 10);
}

/**
 * Racha actual (días seguidos hasta hoy o ayer, si hoy todavía no envió) y
 * mejor racha histórica — ambas acotadas a `LIMITE_DIAS_RACHA` días hacia
 * atrás para no escanear el historial completo de alguien con años de
 * antigüedad. Los días de ausencia autorizada (permiso/licencia/vacaciones)
 * no rompen ninguna racha, pero tampoco suman.
 */
export async function calcularRachas(
  prisma: PrismaService,
  talentoId: string,
): Promise<{ actual: number; mejor: number }> {
  const hoy = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
  }).format(new Date());
  const desde = sumarDiasISO(hoy, -LIMITE_DIAS_RACHA);

  const worklogs = await prisma.worklog.findMany({
    where: { talentoId, fecha: { gte: new Date(`${desde}T00:00:00.000Z`) } },
    select: { fecha: true, estadoEnvio: true },
  });

  const porFecha = new Map<string, string>();
  for (const w of worklogs) {
    porFecha.set(w.fecha.toISOString().slice(0, 10), w.estadoEnvio);
  }

  const estadoHoy = porFecha.get(hoy);
  let cursor = estadoHoy?.includes('✅') ? hoy : sumarDiasISO(hoy, -1);

  let actual = 0;
  for (let i = 0; i < LIMITE_DIAS_RACHA; i++) {
    const estado = porFecha.get(cursor);
    if (estado?.includes('✅')) {
      actual += 1;
    } else if (!estado || !esAusenciaAutorizada(estado)) {
      break;
    }
    cursor = sumarDiasISO(cursor, -1);
  }

  let mejor = 0;
  let corrida = 0;
  let cursorMejor = desde;
  for (let i = 0; i <= LIMITE_DIAS_RACHA; i++) {
    const estado = porFecha.get(cursorMejor);
    if (estado?.includes('✅')) {
      corrida += 1;
      mejor = Math.max(mejor, corrida);
    } else if (!estado || !esAusenciaAutorizada(estado)) {
      corrida = 0;
    }
    cursorMejor = sumarDiasISO(cursorMejor, 1);
  }
  mejor = Math.max(mejor, actual);

  return { actual, mejor };
}
