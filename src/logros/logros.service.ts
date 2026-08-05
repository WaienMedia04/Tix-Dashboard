import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgresoService } from '../progreso/progreso.service';
import { calcularRachas } from '../mural/racha.util';
import { LOGROS, type MetricasLogro } from './logros.constant';

export interface LogroConEstado {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  meta: number;
  progreso: number;
  desbloqueado: boolean;
  desbloqueadoEn: Date | null;
}

@Injectable()
export class LogrosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progreso: ProgresoService,
  ) {}

  private async metricas(
    talentoId: string,
    usuarioId: string | null,
  ): Promise<MetricasLogro> {
    const [
      bitacoras,
      racha,
      reconocimientosDestacados,
      reconocimientosRapidos,
      comentarios,
      notasAOtros,
      ideasAprobadas,
    ] = await Promise.all([
      this.prisma.worklog.count({
        where: { talentoId, estadoEnvio: { contains: '✅' } },
      }),
      calcularRachas(this.prisma, talentoId),
      this.prisma.pizarraReconocimiento.count({ where: { talentoId } }),
      this.prisma.reconocimientoRapido.count({ where: { talentoId } }),
      usuarioId
        ? this.prisma.pizarraComentario.count({
            where: { autorUsuarioId: usuarioId },
          })
        : Promise.resolve(0),
      usuarioId
        ? this.prisma.muralNotaAdhesiva.count({
            where: {
              enviadaPorUsuarioId: usuarioId,
              talentoId: { not: talentoId },
            },
          })
        : Promise.resolve(0),
      usuarioId
        ? this.prisma.pizarraPost.count({
            where: { autorUsuarioId: usuarioId, esIdea: true, aprobada: true },
          })
        : Promise.resolve(0),
    ]);

    return {
      primer_dia: 1,
      primera_bitacora: bitacoras,
      racha_7: racha.mejor,
      racha_30: racha.mejor,
      bitacoras_100: bitacoras,
      reconocimientos_50: reconocimientosDestacados + reconocimientosRapidos,
      comentarios_100: comentarios,
      ayudaste_companero: notasAOtros,
      idea_aprobada: ideasAprobadas,
    };
  }

  /**
   * Recalcula las métricas del talento, desbloquea (y premia con XP/monedas)
   * cualquier logro recién alcanzado, y devuelve el catálogo completo con su
   * estado actual. Se llama cada vez que se ve un mural (propio o ajeno) —
   * es más simple que enganchar un chequeo en cada acción individual, y el
   * costo son solo counts indexados.
   */
  async sincronizarYObtener(
    talentoId: string,
    empresaId: string,
    usuarioId: string | null,
  ): Promise<LogroConEstado[]> {
    const [metricas, desbloqueados] = await Promise.all([
      this.metricas(talentoId, usuarioId),
      this.prisma.talentoLogro.findMany({
        where: { talentoId },
        select: { logroId: true, createdAt: true },
      }),
    ]);

    const desbloqueadosMap = new Map(
      desbloqueados.map((d) => [d.logroId, d.createdAt]),
    );

    const recienDesbloqueados = LOGROS.filter(
      (logro) =>
        !desbloqueadosMap.has(logro.id) &&
        metricas[logro.id as keyof MetricasLogro] >= logro.meta,
    );

    for (const logro of recienDesbloqueados) {
      try {
        await this.prisma.talentoLogro.create({
          data: { empresaId, talentoId, logroId: logro.id },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          continue; // otra request en paralelo ya lo desbloqueó
        }
        throw err;
      }
      await this.progreso.otorgarMonto(
        empresaId,
        talentoId,
        'logro_desbloqueado',
        logro.id,
        logro.recompensaXp,
        logro.recompensaMonedas,
      );
      desbloqueadosMap.set(logro.id, new Date());
    }

    return LOGROS.map((logro) => {
      const desbloqueadoEn = desbloqueadosMap.get(logro.id) ?? null;
      return {
        id: logro.id,
        nombre: logro.nombre,
        descripcion: logro.descripcion,
        icono: logro.icono,
        meta: logro.meta,
        progreso: Math.min(
          metricas[logro.id as keyof MetricasLogro],
          logro.meta,
        ),
        desbloqueado: desbloqueadoEn !== null,
        desbloqueadoEn,
      };
    });
  }
}
