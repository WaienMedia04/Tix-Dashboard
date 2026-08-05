import type { PeriodoMision } from './misiones.constant';

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de República Dominicana — mismo criterio que WorklogsService.hoyISO(). */
function hoyISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
  }).format(new Date());
}

function sumarDiasISO(iso: string, delta: number): string {
  const fecha = new Date(`${iso}T00:00:00.000Z`);
  fecha.setUTCDate(fecha.getUTCDate() + delta);
  return fecha.toISOString().slice(0, 10);
}

/** RD (América/Santo Domingo) no tiene horario de verano: su medianoche siempre cae a las 04:00 UTC del mismo día. */
function inicioDiaUTC(fechaISO: string): Date {
  return new Date(`${fechaISO}T04:00:00.000Z`);
}

export interface VentanaPeriodo {
  /** Identifica la instancia del período — dedupe key para TalentoMisionReclamada. */
  periodoId: string;
  /** Desde cuándo (inclusive) cuentan los eventos de progreso para esta instancia. */
  desde: Date;
}

/** Calcula la instancia actual del período (diaria/semanal/mensual) — semanal empieza en lunes. */
export function ventanaPeriodo(periodo: PeriodoMision): VentanaPeriodo {
  const hoy = hoyISO();

  if (periodo === 'diaria') {
    return { periodoId: hoy, desde: inicioDiaUTC(hoy) };
  }

  if (periodo === 'semanal') {
    const [anio, mes, dia] = hoy.split('-').map(Number);
    const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay(); // 0=domingo..6=sábado
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const lunes = sumarDiasISO(hoy, -diasDesdeLunes);
    return { periodoId: lunes, desde: inicioDiaUTC(lunes) };
  }

  const primerDiaMes = `${hoy.slice(0, 7)}-01`;
  return { periodoId: hoy.slice(0, 7), desde: inicioDiaUTC(primerDiaMes) };
}
