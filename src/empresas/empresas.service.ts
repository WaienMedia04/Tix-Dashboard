import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.empresa.findMany({
      select: { id: true, nombre: true, slug: true, plan: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async dashboard(slug: string, codigoAcceso: string | undefined) {
    const empresa = await this.prisma.empresa.findUnique({ where: { slug } });
    if (!empresa) {
      throw new NotFoundException(`Empresa "${slug}" no encontrada`);
    }
    if (!codigoAcceso || codigoAcceso !== empresa.codigoAcceso) {
      throw new UnauthorizedException('Código de acceso inválido');
    }

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
    const enviadas = worklogs.filter((w) => w.estadoEnvio === '✅ Enviada').length;
    const porcentajeEnviadas =
      totalBitacoras === 0 ? 0 : Math.round((enviadas / totalBitacoras) * 1000) / 10;

    const rankingTalentos = talentos
      .map((t) => {
        const propios = worklogs.filter((w) => w.talentoId === t.id);
        const conPuntaje = propios.filter((w) => w.puntajeIA !== null);
        const promedio =
          conPuntaje.length === 0
            ? null
            : Math.round(
                (conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) / conPuntaje.length) * 10,
              ) / 10;
        return {
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          rol: t.rol,
          puntajeIAPromedio: promedio,
          bitacorasEnviadas: propios.filter((w) => w.estadoEnvio === '✅ Enviada').length,
          totalBitacoras: propios.length,
        };
      })
      .sort((a, b) => (b.puntajeIAPromedio ?? -1) - (a.puntajeIAPromedio ?? -1));

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
      empresa: { nombre: empresa.nombre, slug: empresa.slug, plan: empresa.plan },
      metricas: { totalBitacoras, enviadas, porcentajeEnviadas },
      rankingTalentos,
      worklogsRecientes,
    };
  }
}
