import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgresoService } from '../progreso/progreso.service';

export interface PremioCofre {
  xp: number;
  monedas: number;
}

export interface EstadoCofre extends PremioCofre {
  yaAbierto: boolean;
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

  async estadoHoy(talentoId: string): Promise<EstadoCofre> {
    const hoy = this.hoyISO();
    const apertura = await this.prisma.talentoCofreApertura.findUnique({
      where: { talentoId_fecha: { talentoId, fecha: hoy } },
    });
    return {
      yaAbierto: !!apertura,
      xp: apertura?.xp ?? 0,
      monedas: apertura?.monedas ?? 0,
    };
  }

  async abrir(empresaId: string, talentoId: string): Promise<EstadoCofre> {
    const hoy = this.hoyISO();
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
        const existente =
          await this.prisma.talentoCofreApertura.findUniqueOrThrow({
            where: { talentoId_fecha: { talentoId, fecha: hoy } },
          });
        return {
          yaAbierto: true,
          xp: existente.xp,
          monedas: existente.monedas,
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

    return { yaAbierto: false, xp: apertura.xp, monedas: apertura.monedas };
  }
}
