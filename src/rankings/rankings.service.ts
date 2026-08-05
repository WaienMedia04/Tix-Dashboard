import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularRachas } from '../mural/racha.util';
import type { CategoriaRanking, PeriodoRanking } from './rankings.constant';

export interface ItemRanking {
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  valor: number;
}

const LIMITE_TOP = 10;

function contarPorTalentoId(
  rows: { talentoId: string }[],
): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const r of rows) {
    mapa.set(r.talentoId, (mapa.get(r.talentoId) ?? 0) + 1);
  }
  return mapa;
}

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  private desdeParaPeriodo(periodo: PeriodoRanking): Date | null {
    if (periodo === 'semanal')
      return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (periodo === 'mensual')
      return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return null; // histórico: sin límite
  }

  async top(
    empresaId: string,
    categoria: CategoriaRanking,
    periodo: PeriodoRanking,
  ): Promise<ItemRanking[]> {
    const desde = this.desdeParaPeriodo(periodo);

    const mapa = await (categoria === 'racha'
      ? this.mapaRacha(empresaId)
      : categoria === 'xp'
        ? this.mapaXp(empresaId, desde)
        : categoria === 'actividad'
          ? this.mapaActividad(empresaId, desde)
          : categoria === 'bitacoras'
            ? this.mapaBitacoras(empresaId, desde)
            : categoria === 'reconocimientos'
              ? this.mapaReconocimientos(empresaId, desde)
              : this.mapaComentarios(empresaId, desde));

    if (mapa.size === 0) return [];

    const top = [...mapa.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, LIMITE_TOP);

    const talentos = await this.prisma.talento.findMany({
      where: { id: { in: top.map(([id]) => id) }, empresaId },
      select: { id: true, nombreCompleto: true, fotoUrl: true },
    });
    const talentosPorId = new Map(talentos.map((t) => [t.id, t]));

    return top
      .filter(([id]) => talentosPorId.has(id))
      .map(([id, valor]) => {
        const t = talentosPorId.get(id)!;
        return {
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          fotoUrl: t.fotoUrl,
          valor,
        };
      });
  }

  /** Suma de XP ganada por talento (vía el ledger de progreso, que ya no depende del total corriente). */
  private async mapaXp(
    empresaId: string,
    desde: Date | null,
  ): Promise<Map<string, number>> {
    const eventos = await this.prisma.talentoProgresoEvento.findMany({
      where: {
        ...(desde && { createdAt: { gte: desde } }),
        progreso: { empresaId },
      },
      select: { progresoId: true, xp: true },
    });
    if (eventos.length === 0) return new Map();

    const xpPorProgreso = new Map<string, number>();
    for (const e of eventos) {
      xpPorProgreso.set(
        e.progresoId,
        (xpPorProgreso.get(e.progresoId) ?? 0) + e.xp,
      );
    }
    const progresos = await this.prisma.talentoProgreso.findMany({
      where: { id: { in: [...xpPorProgreso.keys()] } },
      select: { id: true, talentoId: true },
    });
    const mapa = new Map<string, number>();
    for (const p of progresos)
      mapa.set(p.talentoId, xpPorProgreso.get(p.id) ?? 0);
    return mapa;
  }

  /** Cantidad de acciones registradas (cualquier tipo) — proxy de "empleado más activo". */
  private async mapaActividad(
    empresaId: string,
    desde: Date | null,
  ): Promise<Map<string, number>> {
    const eventos = await this.prisma.talentoProgresoEvento.findMany({
      where: {
        ...(desde && { createdAt: { gte: desde } }),
        progreso: { empresaId },
      },
      select: { progresoId: true },
    });
    if (eventos.length === 0) return new Map();

    const cantidadPorProgreso = new Map<string, number>();
    for (const e of eventos) {
      cantidadPorProgreso.set(
        e.progresoId,
        (cantidadPorProgreso.get(e.progresoId) ?? 0) + 1,
      );
    }
    const progresos = await this.prisma.talentoProgreso.findMany({
      where: { id: { in: [...cantidadPorProgreso.keys()] } },
      select: { id: true, talentoId: true },
    });
    const mapa = new Map<string, number>();
    for (const p of progresos)
      mapa.set(p.talentoId, cantidadPorProgreso.get(p.id) ?? 0);
    return mapa;
  }

  private async mapaBitacoras(
    empresaId: string,
    desde: Date | null,
  ): Promise<Map<string, number>> {
    const rows = await this.prisma.worklog.findMany({
      where: {
        empresaId,
        estadoEnvio: { contains: '✅' },
        ...(desde && { fecha: { gte: desde } }),
      },
      select: { talentoId: true },
    });
    return contarPorTalentoId(rows);
  }

  private async mapaReconocimientos(
    empresaId: string,
    desde: Date | null,
  ): Promise<Map<string, number>> {
    const [destacados, rapidos] = await Promise.all([
      this.prisma.pizarraReconocimiento.findMany({
        where: { empresaId, ...(desde && { createdAt: { gte: desde } }) },
        select: { talentoId: true },
      }),
      this.prisma.reconocimientoRapido.findMany({
        where: { empresaId, ...(desde && { createdAt: { gte: desde } }) },
        select: { talentoId: true },
      }),
    ]);
    return contarPorTalentoId([...destacados, ...rapidos]);
  }

  private async mapaComentarios(
    empresaId: string,
    desde: Date | null,
  ): Promise<Map<string, number>> {
    const rows = await this.prisma.pizarraComentario.findMany({
      where: {
        post: { empresaId },
        ...(desde && { createdAt: { gte: desde } }),
      },
      select: { autor: { select: { talentoId: true } } },
    });
    const mapa = new Map<string, number>();
    for (const r of rows) {
      if (!r.autor.talentoId) continue;
      mapa.set(r.autor.talentoId, (mapa.get(r.autor.talentoId) ?? 0) + 1);
    }
    return mapa;
  }

  /** Racha no se filtra por período — siempre es la racha actual en curso. */
  private async mapaRacha(empresaId: string): Promise<Map<string, number>> {
    const talentos = await this.prisma.talento.findMany({
      where: { empresaId, estado: 'activo' },
      select: { id: true },
    });
    const rachas = await Promise.all(
      talentos.map(async (t) => ({
        talentoId: t.id,
        actual: (await calcularRachas(this.prisma, t.id)).actual,
      })),
    );
    const mapa = new Map<string, number>();
    for (const r of rachas) {
      if (r.actual > 0) mapa.set(r.talentoId, r.actual);
    }
    return mapa;
  }
}
