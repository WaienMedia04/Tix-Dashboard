import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BitacorasQueryDto } from './dto/bitacoras-query.dto';
import { KpisQueryDto } from './dto/kpis-query.dto';
import { clasificarEstado } from './estado.util';

const MARCADOR_ESTADO: Record<string, string> = {
  enviada: '✅',
  no_enviada: '❌',
  permiso: '📋',
};

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.empresa.findMany({
      select: { id: true, nombre: true, slug: true, plan: true },
      orderBy: { nombre: 'asc' },
    });
  }

  private async validarAcceso(slug: string, codigoAcceso: string | undefined) {
    const empresa = await this.prisma.empresa.findUnique({ where: { slug } });
    if (!empresa) {
      throw new NotFoundException(`Empresa "${slug}" no encontrada`);
    }
    if (!codigoAcceso || codigoAcceso !== empresa.codigoAcceso) {
      throw new UnauthorizedException('Código de acceso inválido');
    }
    return empresa;
  }

  async dashboard(slug: string, codigoAcceso: string | undefined) {
    const empresa = await this.validarAcceso(slug, codigoAcceso);

    // TODO: filtrar por empresaId es manual porque todavia no hay RLS en Postgres.
    const [worklogs, talentos] = await Promise.all([
      this.prisma.worklog.findMany({
        where: { empresaId: empresa.id },
        include: { talento: { select: { nombreCompleto: true } } },
        orderBy: { fecha: 'desc' },
      }),
      this.prisma.talento.findMany({ where: { empresaId: empresa.id } }),
    ]);

    const totalBitacoras = worklogs.length;
    const enviadas = worklogs.filter(
      (w) => w.estadoEnvio === '✅ Enviada',
    ).length;
    const porcentajeEnviadas =
      totalBitacoras === 0
        ? 0
        : Math.round((enviadas / totalBitacoras) * 1000) / 10;

    const rankingTalentos = talentos
      .map((t) => {
        const propios = worklogs.filter((w) => w.talentoId === t.id);
        const conPuntaje = propios.filter((w) => w.puntajeIA !== null);
        const promedio =
          conPuntaje.length === 0
            ? null
            : Math.round(
                (conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) /
                  conPuntaje.length) *
                  10,
              ) / 10;
        return {
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          rol: t.rol,
          puntajeIAPromedio: promedio,
          bitacorasEnviadas: propios.filter(
            (w) => w.estadoEnvio === '✅ Enviada',
          ).length,
          totalBitacoras: propios.length,
        };
      })
      .sort(
        (a, b) => (b.puntajeIAPromedio ?? -1) - (a.puntajeIAPromedio ?? -1),
      );

    const worklogsRecientes = worklogs.slice(0, 10).map((w) => ({
      id: w.id,
      talento: w.talento.nombreCompleto,
      fecha: w.fecha,
      estadoEnvio: w.estadoEnvio,
      horaEnvio: w.horaEnvio,
      puntajeIA: w.puntajeIA,
      calificacionCeo: w.calificacionCeo,
      actividadesRealizadas: w.actividadesRealizadas,
      queSeEjecuto: w.queSeEjecuto,
      detallesRelevantes: w.detallesRelevantes,
      informeAvances: w.informeAvances,
      objetivoDia: w.objetivoDia,
      notasTix: w.notasTix,
    }));

    return {
      empresa: {
        nombre: empresa.nombre,
        slug: empresa.slug,
        plan: empresa.plan,
      },
      metricas: { totalBitacoras, enviadas, porcentajeEnviadas },
      rankingTalentos,
      worklogsRecientes,
    };
  }

  async bitacoras(
    slug: string,
    codigoAcceso: string | undefined,
    query: BitacorasQueryDto,
  ) {
    const empresa = await this.validarAcceso(slug, codigoAcceso);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    // TODO: filtrar por empresaId es manual porque todavia no hay RLS en Postgres.
    const where: Prisma.WorklogWhereInput = { empresaId: empresa.id };

    if (query.talentoId) {
      where.talentoId = query.talentoId;
    }
    if (query.estado) {
      where.estadoEnvio = { contains: MARCADOR_ESTADO[query.estado] };
    }
    if (query.fechaInicio || query.fechaFin) {
      where.fecha = {};
      if (query.fechaInicio) {
        where.fecha.gte = new Date(`${query.fechaInicio}T00:00:00.000Z`);
      }
      if (query.fechaFin) {
        where.fecha.lte = new Date(`${query.fechaFin}T23:59:59.999Z`);
      }
    }

    const [data, total, enviadas, agregados] = await Promise.all([
      this.prisma.worklog.findMany({
        where,
        include: {
          talento: { select: { id: true, nombreCompleto: true, rol: true } },
        },
        orderBy: { fecha: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.worklog.count({ where }),
      this.prisma.worklog.count({
        where: { AND: [where, { estadoEnvio: { contains: '✅' } }] },
      }),
      this.prisma.worklog.aggregate({ where, _avg: { puntajeIA: true } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const porcentajeEnviadas =
      total === 0 ? 0 : Math.round((enviadas / total) * 1000) / 10;
    const puntajeProm =
      agregados._avg.puntajeIA === null
        ? null
        : Math.round(agregados._avg.puntajeIA * 10) / 10;

    return {
      data,
      total,
      page,
      totalPages,
      resumen: { totalBitacoras: total, porcentajeEnviadas, puntajeProm },
    };
  }

  async empleados(slug: string, codigoAcceso: string | undefined) {
    const empresa = await this.validarAcceso(slug, codigoAcceso);

    const talentos = await this.prisma.talento.findMany({
      where: { empresaId: empresa.id },
      include: { worklogs: { select: { estadoEnvio: true, puntajeIA: true } } },
      orderBy: { nombreCompleto: 'asc' },
    });

    return talentos.map((t) => {
      const conPuntaje = t.worklogs.filter((w) => w.puntajeIA !== null);
      const puntajeIAPromedio =
        conPuntaje.length === 0
          ? null
          : Math.round(
              (conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) /
                conPuntaje.length) *
                10,
            ) / 10;
      const enviadas = t.worklogs.filter((w) =>
        w.estadoEnvio.includes('✅'),
      ).length;
      const porcentajeCumplimiento =
        t.worklogs.length === 0
          ? null
          : Math.round((enviadas / t.worklogs.length) * 1000) / 10;

      return {
        id: t.id,
        nombreCompleto: t.nombreCompleto,
        rol: t.rol,
        estado: t.estado,
        puntajeIAPromedio,
        totalBitacoras: t.worklogs.length,
        porcentajeCumplimiento,
      };
    });
  }

  async empleadoDetalle(
    slug: string,
    codigoAcceso: string | undefined,
    talentoId: string,
    page: number,
    limit: number,
  ) {
    const empresa = await this.validarAcceso(slug, codigoAcceso);

    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
    });
    if (!talento || talento.empresaId !== empresa.id) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const todos = await this.prisma.worklog.findMany({
      where: { talentoId: talento.id },
      orderBy: { fecha: 'asc' },
    });

    const serieIA = todos
      .filter((w) => w.puntajeIA !== null)
      .map((w) => ({ fecha: w.fecha, puntajeIA: w.puntajeIA }));

    const conPuntaje = serieIA;
    const puntajeIAPromedio =
      conPuntaje.length === 0
        ? null
        : Math.round(
            (conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) /
              conPuntaje.length) *
              10,
          ) / 10;
    const enviadas = todos.filter((w) => w.estadoEnvio.includes('✅')).length;
    const porcentajeCumplimiento =
      todos.length === 0
        ? null
        : Math.round((enviadas / todos.length) * 1000) / 10;

    const ordenDesc = [...todos].reverse();
    const total = ordenDesc.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pagina = ordenDesc.slice(
      (page - 1) * limit,
      (page - 1) * limit + limit,
    );

    return {
      talento: {
        id: talento.id,
        nombreCompleto: talento.nombreCompleto,
        rol: talento.rol,
        estado: talento.estado,
      },
      metricas: {
        puntajeIAPromedio,
        totalBitacoras: total,
        porcentajeCumplimiento,
      },
      serieIA,
      historial: {
        data: pagina.map((w) => ({
          id: w.id,
          fecha: w.fecha,
          dia: w.dia,
          semana: w.semana,
          estadoEnvio: w.estadoEnvio,
          horaEnvio: w.horaEnvio,
          puntajeIA: w.puntajeIA,
          calificacionCeo: w.calificacionCeo,
          actividadesRealizadas: w.actividadesRealizadas,
          capacitacion: w.capacitacion,
          queSeEjecuto: w.queSeEjecuto,
          detallesRelevantes: w.detallesRelevantes,
          informeAvances: w.informeAvances,
          objetivoDia: w.objetivoDia,
          notasTix: w.notasTix,
          talento: {
            id: talento.id,
            nombreCompleto: talento.nombreCompleto,
            rol: talento.rol,
          },
        })),
        total,
        page,
        totalPages,
      },
    };
  }

  async kpis(
    slug: string,
    codigoAcceso: string | undefined,
    query: KpisQueryDto,
  ) {
    const empresa = await this.validarAcceso(slug, codigoAcceso);

    const ahora = new Date();
    const periodo =
      query.periodo ??
      `${ahora.getUTCFullYear()}-${String(ahora.getUTCMonth() + 1).padStart(2, '0')}`;
    const [anioStr, mesStr] = periodo.split('-');
    const anio = Number(anioStr);
    const mes = Number(mesStr);

    const periodoInicio = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0, 0));
    const periodoFin = new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999));

    const mesAnteriorRef = new Date(Date.UTC(anio, mes - 2, 1));
    const periodoAnteriorInicio = new Date(
      Date.UTC(
        mesAnteriorRef.getUTCFullYear(),
        mesAnteriorRef.getUTCMonth(),
        1,
        0,
        0,
        0,
        0,
      ),
    );
    const periodoAnteriorFin = new Date(
      Date.UTC(
        mesAnteriorRef.getUTCFullYear(),
        mesAnteriorRef.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    );

    function mondayOf(fecha: Date): Date {
      const copia = new Date(fecha);
      const dia = copia.getUTCDay();
      const diff = dia === 0 ? -6 : 1 - dia;
      copia.setUTCDate(copia.getUTCDate() + diff);
      copia.setUTCHours(0, 0, 0, 0);
      return copia;
    }

    const ultimaSemanaInicio = mondayOf(periodoFin);
    const semanas: { inicio: Date; fin: Date }[] = [];
    for (let i = 7; i >= 0; i--) {
      const inicio = new Date(ultimaSemanaInicio);
      inicio.setUTCDate(inicio.getUTCDate() - i * 7);
      const fin = new Date(inicio);
      fin.setUTCDate(fin.getUTCDate() + 6);
      fin.setUTCHours(23, 59, 59, 999);
      semanas.push({ inicio, fin });
    }

    // TODO: filtrar por empresaId es manual porque todavia no hay RLS en Postgres.
    const [
      worklogsRangoSemanal,
      worklogsPeriodo,
      worklogsPeriodoAnterior,
      talentos,
    ] = await Promise.all([
      this.prisma.worklog.findMany({
        where: {
          empresaId: empresa.id,
          fecha: { gte: semanas[0].inicio, lte: semanas[7].fin },
        },
        select: { fecha: true, estadoEnvio: true, puntajeIA: true },
      }),
      this.prisma.worklog.findMany({
        where: {
          empresaId: empresa.id,
          fecha: { gte: periodoInicio, lte: periodoFin },
        },
        select: { talentoId: true, estadoEnvio: true, puntajeIA: true },
      }),
      this.prisma.worklog.findMany({
        where: {
          empresaId: empresa.id,
          fecha: { gte: periodoAnteriorInicio, lte: periodoAnteriorFin },
        },
        select: { talentoId: true, puntajeIA: true },
      }),
      this.prisma.talento.findMany({ where: { empresaId: empresa.id } }),
    ]);

    const evolucionSemanal = semanas.map(({ inicio, fin }) => {
      const enSemana = worklogsRangoSemanal.filter(
        (w) => w.fecha >= inicio && w.fecha <= fin,
      );
      const conPuntaje = enSemana.filter((w) => w.puntajeIA !== null);
      const puntajeProm =
        conPuntaje.length === 0
          ? null
          : Math.round(
              (conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) /
                conPuntaje.length) *
                10,
            ) / 10;
      return { semana: inicio.toISOString().slice(0, 10), puntajeProm };
    });

    const bitacorasSemanal = semanas.map(({ inicio, fin }) => {
      const enSemana = worklogsRangoSemanal.filter(
        (w) => w.fecha >= inicio && w.fecha <= fin,
      );
      const enviadas = enSemana.filter((w) =>
        w.estadoEnvio.includes('✅'),
      ).length;
      return {
        semana: inicio.toISOString().slice(0, 10),
        enviadas,
        esperadas: enSemana.length,
      };
    });

    const distribucionMap = new Map<
      string,
      { estado: string; colorKey: string; count: number }
    >();
    for (const w of worklogsPeriodo) {
      const { label, colorKey } = clasificarEstado(w.estadoEnvio);
      const clave = `${label}|${colorKey}`;
      const actual = distribucionMap.get(clave) ?? {
        estado: label,
        colorKey,
        count: 0,
      };
      actual.count += 1;
      distribucionMap.set(clave, actual);
    }
    const distribucionEstado = Array.from(distribucionMap.values()).sort(
      (a, b) => b.count - a.count,
    );

    function promedioPorTalento(
      registros: { talentoId: string; puntajeIA: number | null }[],
    ): Map<string, number | null> {
      const mapa = new Map<string, number | null>();
      for (const t of talentos) {
        const propios = registros.filter((w) => w.talentoId === t.id);
        const conPuntaje = propios.filter((w) => w.puntajeIA !== null);
        const prom =
          conPuntaje.length === 0
            ? null
            : conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) /
              conPuntaje.length;
        mapa.set(t.id, prom);
      }
      return mapa;
    }

    const promedioActual = promedioPorTalento(worklogsPeriodo);
    const promedioAnterior = promedioPorTalento(worklogsPeriodoAnterior);

    let alta = 0;
    let media = 0;
    let baja = 0;
    let sinDatos = 0;
    for (const prom of promedioActual.values()) {
      if (prom === null) {
        sinDatos += 1;
      } else if (prom >= 8) {
        alta += 1;
      } else if (prom >= 5) {
        media += 1;
      } else {
        baja += 1;
      }
    }
    const distribucionProductividad = { alta, media, baja, sinDatos };

    const kpisPorEmpleado = talentos
      .map((t) => {
        const propios = worklogsPeriodo.filter((w) => w.talentoId === t.id);
        const conPuntaje = propios.filter((w) => w.puntajeIA !== null);
        const puntajeProm =
          conPuntaje.length === 0
            ? null
            : Math.round(
                (conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) /
                  conPuntaje.length) *
                  10,
              ) / 10;
        const enviadas = propios.filter((w) =>
          w.estadoEnvio.includes('✅'),
        ).length;
        const cumplimiento =
          propios.length === 0
            ? null
            : Math.round((enviadas / propios.length) * 1000) / 10;

        const actual = promedioActual.get(t.id) ?? null;
        const anterior = promedioAnterior.get(t.id) ?? null;
        let tendencia: 'subio' | 'bajo' | 'igual' | null = null;
        if (actual !== null && anterior !== null) {
          const diff = actual - anterior;
          tendencia = diff > 0.05 ? 'subio' : diff < -0.05 ? 'bajo' : 'igual';
        }

        return {
          talentoId: t.id,
          nombre: t.nombreCompleto,
          puntajeProm,
          cumplimiento,
          enviadas,
          tendencia,
        };
      })
      .sort((a, b) => (b.puntajeProm ?? -1) - (a.puntajeProm ?? -1));

    return {
      periodo,
      evolucionSemanal,
      bitacorasSemanal,
      distribucionEstado,
      distribucionProductividad,
      kpisPorEmpleado,
    };
  }
}
