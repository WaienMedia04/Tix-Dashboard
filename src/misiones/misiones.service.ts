import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgresoService } from '../progreso/progreso.service';
import { MISIONES, type MisionDefinicion } from './misiones.constant';
import { ventanaPeriodo } from './misiones.util';

export interface MisionConEstado {
  id: string;
  periodo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  meta: number;
  progreso: number;
  recompensaXp: number;
  recompensaMonedas: number;
  completada: boolean;
  reclamada: boolean;
}

@Injectable()
export class MisionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progreso: ProgresoService,
  ) {}

  private buscarMision(misionId: string): MisionDefinicion {
    const mision = MISIONES.find((m) => m.id === misionId);
    if (!mision) throw new NotFoundException('Misión no encontrada');
    return mision;
  }

  private async contarProgreso(
    progresoId: string,
    mision: MisionDefinicion,
  ): Promise<number> {
    const { desde } = ventanaPeriodo(mision.periodo);
    return this.prisma.talentoProgresoEvento.count({
      where: {
        progresoId,
        tipo: { in: mision.tiposEvento },
        createdAt: { gte: desde },
      },
    });
  }

  async catalogo(talentoId: string): Promise<MisionConEstado[]> {
    const [progresoRow, reclamadas] = await Promise.all([
      this.prisma.talentoProgreso.findUnique({
        where: { talentoId },
        select: { id: true },
      }),
      this.prisma.talentoMisionReclamada.findMany({
        where: { talentoId },
        select: { misionId: true, periodoId: true },
      }),
    ]);
    const reclamadasSet = new Set(
      reclamadas.map((r) => `${r.misionId}:${r.periodoId}`),
    );

    return Promise.all(
      MISIONES.map(async (mision) => {
        const { periodoId } = ventanaPeriodo(mision.periodo);
        const progresoActual = progresoRow
          ? await this.contarProgreso(progresoRow.id, mision)
          : 0;
        return {
          id: mision.id,
          periodo: mision.periodo,
          nombre: mision.nombre,
          descripcion: mision.descripcion,
          icono: mision.icono,
          meta: mision.meta,
          progreso: Math.min(progresoActual, mision.meta),
          recompensaXp: mision.recompensaXp,
          recompensaMonedas: mision.recompensaMonedas,
          completada: progresoActual >= mision.meta,
          reclamada: reclamadasSet.has(`${mision.id}:${periodoId}`),
        };
      }),
    );
  }

  /** Idempotente: si ya se reclamó en este período, no vuelve a otorgar recompensa. */
  async reclamar(
    empresaId: string,
    talentoId: string,
    misionId: string,
  ): Promise<MisionConEstado[]> {
    const mision = this.buscarMision(misionId);
    const { periodoId } = ventanaPeriodo(mision.periodo);

    const progresoRow = await this.prisma.talentoProgreso.findUnique({
      where: { talentoId },
      select: { id: true },
    });
    const progresoActual = progresoRow
      ? await this.contarProgreso(progresoRow.id, mision)
      : 0;
    if (progresoActual < mision.meta) {
      throw new BadRequestException('Todavía no completaste esta misión');
    }

    try {
      await this.prisma.talentoMisionReclamada.create({
        data: { empresaId, talentoId, misionId, periodoId },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return this.catalogo(talentoId); // ya se había reclamado
      }
      throw err;
    }

    await this.progreso.otorgarMonto(
      empresaId,
      talentoId,
      'mision_reclamada',
      `${misionId}-${periodoId}`,
      mision.recompensaXp,
      mision.recompensaMonedas,
    );

    return this.catalogo(talentoId);
  }
}
