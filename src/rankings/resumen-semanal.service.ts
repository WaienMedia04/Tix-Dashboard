import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgresoService } from '../progreso/progreso.service';
import { calcularRachas } from '../mural/racha.util';

export interface ObjetivoSemanal {
  id: string;
  etiqueta: string;
  actual: number;
  meta: number;
  completado: boolean;
}

export interface ResumenSemanal {
  bitacoras: number;
  xpGanada: number;
  monedasGanadas: number;
  reconocimientosRecibidos: number;
  ideasCompartidas: number;
  comentarios: number;
  racha: number;
  nivel: number;
  nombreNivel: string;
  objetivos: ObjetivoSemanal[];
}

/** Metas semanales fijas (doc "Actualización Mural 2.0" #10) — mismo criterio simple para toda la empresa. */
const METAS_SEMANALES = {
  bitacoras: 5,
  reconocimientos: 3,
  comentarios: 5,
};

const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class ResumenSemanalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progreso: ProgresoService,
  ) {}

  async obtener(talentoId: string): Promise<ResumenSemanal> {
    const hace7Dias = new Date(Date.now() - SIETE_DIAS_MS);

    const [info, racha, progresoRow] = await Promise.all([
      this.progreso.obtener(talentoId),
      calcularRachas(this.prisma, talentoId),
      this.prisma.talentoProgreso.findUnique({
        where: { talentoId },
        select: { id: true },
      }),
    ]);

    const conteos = {
      bitacoras: 0,
      xpGanada: 0,
      monedasGanadas: 0,
      reconocimientosRecibidos: 0,
      ideasCompartidas: 0,
      comentarios: 0,
    };

    if (progresoRow) {
      const eventos = await this.prisma.talentoProgresoEvento.findMany({
        where: { progresoId: progresoRow.id, createdAt: { gte: hace7Dias } },
        select: { tipo: true, xp: true, monedas: true },
      });
      for (const e of eventos) {
        conteos.xpGanada += e.xp;
        conteos.monedasGanadas += e.monedas;
        if (e.tipo === 'bitacora_enviada') conteos.bitacoras += 1;
        else if (
          e.tipo === 'reconocimiento_recibido' ||
          e.tipo === 'reconocimiento_rapido_recibido'
        )
          conteos.reconocimientosRecibidos += 1;
        else if (e.tipo === 'post_compartido') conteos.ideasCompartidas += 1;
        else if (e.tipo === 'comentario_publicado') conteos.comentarios += 1;
      }
    }

    const objetivos: ObjetivoSemanal[] = [
      {
        id: 'bitacoras',
        etiqueta: 'Bitácoras',
        actual: conteos.bitacoras,
        meta: METAS_SEMANALES.bitacoras,
        completado: conteos.bitacoras >= METAS_SEMANALES.bitacoras,
      },
      {
        id: 'reconocimientos',
        etiqueta: 'Reconocimientos',
        actual: conteos.reconocimientosRecibidos,
        meta: METAS_SEMANALES.reconocimientos,
        completado:
          conteos.reconocimientosRecibidos >= METAS_SEMANALES.reconocimientos,
      },
      {
        id: 'comentarios',
        etiqueta: 'Comentarios',
        actual: conteos.comentarios,
        meta: METAS_SEMANALES.comentarios,
        completado: conteos.comentarios >= METAS_SEMANALES.comentarios,
      },
    ];

    return {
      ...conteos,
      racha: racha.actual,
      nivel: info.nivel,
      nombreNivel: info.nombreNivel,
      objetivos,
    };
  }
}
