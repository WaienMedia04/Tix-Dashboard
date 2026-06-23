import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BitacorasQueryDto } from './dto/bitacoras-query.dto';

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
}
