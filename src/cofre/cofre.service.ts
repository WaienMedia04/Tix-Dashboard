import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgresoService } from '../progreso/progreso.service';

export interface PremioCofre {
  xp: number;
  monedas: number;
}

export interface EstadoCofre extends PremioCofre {
  yaAbierto: boolean;
  /** Actividades de hoy en pizarra/bitácora, tope en `meta`. */
  progreso: number;
  /** Actividades necesarias en el día para desbloquear el cofre. */
  meta: number;
  /** true si ya se puede abrir (progreso >= meta) — independiente de `yaAbierto`. */
  desbloqueado: boolean;
}

/** Rangos de premio por rareza — probabilidad acumulada de arriba hacia abajo. */
const TABLA_PREMIOS: {
  probabilidad: number;
  xp: [number, number];
  monedas: [number, number];
}[] = [
  { probabilidad: 0.05, xp: [80, 120], monedas: [60, 100] }, // legendario
  { probabilidad: 0.15, xp: [45, 70], monedas: [35, 50] }, // épico
  { probabilidad: 0.4, xp: [25, 40], monedas: [20, 30] }, // raro
  { probabilidad: 1, xp: [10, 20], monedas: [10, 15] }, // común
];

/**
 * Tipos de TalentoProgresoEvento que cuentan como "actividad" para llenar la
 * barra del cofre — todo lo que pasa en la pizarra o en las bitácoras
 * (deliberadamente NO incluye 'cofre_diario': abrir el cofre no cuenta como
 * actividad para el cofre de mañana).
 */
const ACTIVIDADES_COFRE = [
  'bitacora_enviada',
  'post_compartido',
  'comentario_publicado',
  'trivia_ganada',
  'reconocimiento_recibido',
  'reconocimiento_rapido_recibido',
  'idea_aprobada',
];

/** Actividades necesarias en el día para desbloquear el cofre. */
const META_ACTIVIDADES = 4;

function entero(rango: [number, number]): number {
  const [min, max] = rango;
  return min + Math.floor(Math.random() * (max - min + 1));
}

@Injectable()
export class CofreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progreso: ProgresoService,
  ) {}

  /** Fecha de hoy (YYYY-MM-DD) en la zona horaria de República Dominicana — mismo criterio que WorklogsService.hoyISO(). */
  private hoyISO(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
    }).format(new Date());
  }

  /** Medianoche de hoy en República Dominicana (UTC-4 todo el año, sin horario de verano) como instante UTC real. */
  private inicioDeHoyUTC(): Date {
    return new Date(`${this.hoyISO()}T00:00:00-04:00`);
  }

  private sortearPremio(): PremioCofre {
    const r = Math.random();
    let acumulado = 0;
    for (const tier of TABLA_PREMIOS) {
      acumulado += tier.probabilidad;
      if (r < acumulado || tier === TABLA_PREMIOS[TABLA_PREMIOS.length - 1]) {
        return { xp: entero(tier.xp), monedas: entero(tier.monedas) };
      }
    }
    const ultimo = TABLA_PREMIOS[TABLA_PREMIOS.length - 1];
    return { xp: entero(ultimo.xp), monedas: entero(ultimo.monedas) };
  }

  /** Cuántas actividades de hoy (pizarra/bitácora) ya hizo el talento, sin tope. */
  private async actividadHoy(talentoId: string): Promise<number> {
    const progreso = await this.prisma.talentoProgreso.findUnique({
      where: { talentoId },
      select: { id: true },
    });
    if (!progreso) return 0;

    return this.prisma.talentoProgresoEvento.count({
      where: {
        progresoId: progreso.id,
        tipo: { in: ACTIVIDADES_COFRE },
        createdAt: { gte: this.inicioDeHoyUTC() },
      },
    });
  }

  async estadoHoy(talentoId: string): Promise<EstadoCofre> {
    const hoy = this.hoyISO();
    const [apertura, actividad] = await Promise.all([
      this.prisma.talentoCofreApertura.findUnique({
        where: { talentoId_fecha: { talentoId, fecha: hoy } },
      }),
      this.actividadHoy(talentoId),
    ]);
    const progreso = Math.min(actividad, META_ACTIVIDADES);

    return {
      yaAbierto: !!apertura,
      xp: apertura?.xp ?? 0,
      monedas: apertura?.monedas ?? 0,
      progreso,
      meta: META_ACTIVIDADES,
      desbloqueado: !!apertura || progreso >= META_ACTIVIDADES,
    };
  }

  async abrir(empresaId: string, talentoId: string): Promise<EstadoCofre> {
    const hoy = this.hoyISO();

    const yaAbierto = await this.prisma.talentoCofreApertura.findUnique({
      where: { talentoId_fecha: { talentoId, fecha: hoy } },
    });
    if (yaAbierto) {
      return {
        yaAbierto: true,
        xp: yaAbierto.xp,
        monedas: yaAbierto.monedas,
        progreso: META_ACTIVIDADES,
        meta: META_ACTIVIDADES,
        desbloqueado: true,
      };
    }

    const actividad = await this.actividadHoy(talentoId);
    if (actividad < META_ACTIVIDADES) {
      throw new BadRequestException(
        'Todavía no completas suficiente actividad hoy para desbloquear el cofre',
      );
    }

    const premio = this.sortearPremio();
    let apertura: PremioCofre;
    try {
      apertura = await this.prisma.talentoCofreApertura.create({
        data: { empresaId, talentoId, fecha: hoy, ...premio },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        // otra request en paralelo ya lo abrió — le devolvemos el mismo premio ya guardado
        const existente =
          await this.prisma.talentoCofreApertura.findUniqueOrThrow({
            where: { talentoId_fecha: { talentoId, fecha: hoy } },
          });
        return {
          yaAbierto: true,
          xp: existente.xp,
          monedas: existente.monedas,
          progreso: META_ACTIVIDADES,
          meta: META_ACTIVIDADES,
          desbloqueado: true,
        };
      }
      throw err;
    }

    await this.progreso.otorgarMonto(
      empresaId,
      talentoId,
      'cofre_diario',
      hoy,
      apertura.xp,
      apertura.monedas,
    );

    return {
      yaAbierto: false,
      xp: apertura.xp,
      monedas: apertura.monedas,
      progreso: META_ACTIVIDADES,
      meta: META_ACTIVIDADES,
      desbloqueado: true,
    };
  }
}
