import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BitacorasQueryDto } from './dto/bitacoras-query.dto';
import { KpisQueryDto } from './dto/kpis-query.dto';
import { ReportesQueryDto } from './dto/reportes-query.dto';
import { CrearTalentoDto } from './dto/crear-talento.dto';
import { clasificarEstado } from './estado.util';
import { rangoMensual, rangoSemanal, type RangoFechas } from './periodo.util';
import { Actor } from '../auth/actor.types';
import {
  resolverAlcanceTalentoIds,
  talentoScopeWhere,
} from '../auth/talento-scope.util';

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

  /**
   * La autorización (¿puede este actor tocar esta empresa?) ya la resolvió
   * CompanyAccessGuard antes de llegar aquí. Esto solo busca la fila de
   * Empresa por slug — si no coincide con actor.empresaId es un bug de
   * enrutamiento, no un caso de usuario, por eso NotFoundException seco.
   */
  private async resolverEmpresa(slug: string, actor: Actor) {
    const empresa = await this.prisma.empresa.findUnique({ where: { slug } });
    if (!empresa || empresa.id !== actor.empresaId) {
      throw new NotFoundException(`Empresa "${slug}" no encontrada`);
    }
    return empresa;
  }

  async dashboard(slug: string, actor: Actor) {
    const empresa = await this.resolverEmpresa(slug, actor);

    // TODO: filtrar por empresaId es manual porque todavia no hay RLS en Postgres.
    // Alcance adicional por rol (MANAGER/TALENTO ven solo su gente) via talentoScopeWhere.
    const [worklogsTodos, talentos] = await Promise.all([
      this.prisma.worklog.findMany({
        where: { empresaId: empresa.id },
        include: { talento: { select: { nombreCompleto: true } } },
        orderBy: { fecha: 'desc' },
      }),
      this.prisma.talento.findMany({ where: talentoScopeWhere(actor) }),
    ]);

    const talentoIdsVisibles = new Set(talentos.map((t) => t.id));
    const worklogs = worklogsTodos.filter((w) =>
      talentoIdsVisibles.has(w.talentoId),
    );

    // "Total de bitácoras" del dashboard es del mes en curso, no histórico
    // — para eso está la página de Bitácoras (que ya soporta rango libre).
    const ahora = new Date();
    const mesActual = `${ahora.getUTCFullYear()}-${String(ahora.getUTCMonth() + 1).padStart(2, '0')}`;
    const rangoMesActual: RangoFechas = rangoMensual(mesActual);
    const worklogsMesActual = worklogs.filter(
      (w) => w.fecha >= rangoMesActual.inicio && w.fecha <= rangoMesActual.fin,
    );

    const totalBitacoras = worklogsMesActual.length;
    const enviadas = worklogsMesActual.filter(
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
          fotoUrl: t.fotoUrl,
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
      tareasPlanificadas: w.tareasPlanificadas,
      horaCheckin: w.horaCheckin,
      checkinEnviado: w.checkinEnviado,
      cumplimientoTareas: w.cumplimientoTareas,
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

    const empleadosActivos = talentos.filter(
      (t) => t.estado === 'activo',
    ).length;

    const hoyIso = new Date().toISOString().slice(0, 10);
    const bitacorasHoy = worklogs.filter(
      (w) => w.fecha.toISOString().slice(0, 10) === hoyIso,
    ).length;
    const checkinsHoy = worklogs.filter(
      (w) => w.fecha.toISOString().slice(0, 10) === hoyIso && w.checkinEnviado,
    ).length;
    const porcentajeCheckinHoy =
      talentos.length === 0
        ? 0
        : Math.round((checkinsHoy / talentos.length) * 1000) / 10;

    // Referencia para la semana de productividad: la fecha de la bitacora
    // mas reciente (si existe), no la fecha calendario de hoy. Asi el
    // dashboard siempre muestra la ultima semana con actividad real en
    // lugar de una semana en blanco cuando no hay registros recientes.
    const fechaReferencia = worklogs[0]?.fecha ?? new Date();
    const referenciaUtc = new Date(
      Date.UTC(
        fechaReferencia.getUTCFullYear(),
        fechaReferencia.getUTCMonth(),
        fechaReferencia.getUTCDate(),
      ),
    );
    const diaIso = referenciaUtc.getUTCDay() || 7; // 1=lunes .. 7=domingo
    const lunes = new Date(referenciaUtc);
    lunes.setUTCDate(referenciaUtc.getUTCDate() - diaIso + 1);

    const ETIQUETAS_DIA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const productividadSemanal = ETIQUETAS_DIA.map((dia, idx) => {
      const fechaDia = new Date(lunes);
      fechaDia.setUTCDate(lunes.getUTCDate() + idx);
      const isoDia = fechaDia.toISOString().slice(0, 10);
      const enviadas = worklogs.filter(
        (w) =>
          w.fecha.toISOString().slice(0, 10) === isoDia &&
          w.estadoEnvio === '✅ Enviada',
      ).length;
      return { dia, fecha: fechaDia.toISOString(), enviadas };
    });

    const actividadEquipo = talentos
      .map((t) => {
        const ultimo = worklogs.find((w) => w.talentoId === t.id);
        return {
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          rol: t.rol,
          fotoUrl: t.fotoUrl,
          fecha: ultimo?.fecha ?? null,
          estadoEnvio: ultimo?.estadoEnvio ?? null,
          puntajeIA: ultimo?.puntajeIA ?? null,
        };
      })
      .sort((a, b) => {
        if (!a.fecha && !b.fecha) return 0;
        if (!a.fecha) return 1;
        if (!b.fecha) return -1;
        return a.fecha < b.fecha ? 1 : -1;
      });

    return {
      empresa: {
        nombre: empresa.nombre,
        slug: empresa.slug,
        plan: empresa.plan,
      },
      metricas: {
        totalBitacoras,
        enviadas,
        porcentajeEnviadas,
        empleadosActivos,
        bitacorasHoy,
        checkinsHoy,
        porcentajeCheckinHoy,
      },
      productividadSemanal,
      rankingTalentos,
      worklogsRecientes,
      actividadEquipo,
    };
  }

  async bitacoras(slug: string, actor: Actor, query: BitacorasQueryDto) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    // TODO: filtrar por empresaId es manual porque todavia no hay RLS en Postgres.
    const where: Prisma.WorklogWhereInput = { empresaId: empresa.id };

    const alcance = await resolverAlcanceTalentoIds(actor, this.prisma);
    if (alcance !== null) {
      // MANAGER/TALENTO: si piden un talentoId puntual fuera de su alcance,
      // no se les revela que existe — mismo resultado que "sin datos".
      if (query.talentoId && !alcance.includes(query.talentoId)) {
        return {
          data: [],
          total: 0,
          page,
          totalPages: 1,
          resumen: {
            totalBitacoras: 0,
            porcentajeEnviadas: 0,
            puntajeProm: null,
          },
        };
      }
      where.talentoId = query.talentoId ?? { in: alcance };
    } else if (query.talentoId) {
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

  async empleados(slug: string, actor: Actor) {
    await this.resolverEmpresa(slug, actor);

    const talentos = await this.prisma.talento.findMany({
      where: talentoScopeWhere(actor),
      include: {
        worklogs: {
          select: {
            estadoEnvio: true,
            puntajeIA: true,
            cumplimientoTareas: true,
          },
        },
      },
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
      const conCumplimientoTareas = t.worklogs.filter(
        (w) => w.cumplimientoTareas !== null,
      );
      const cumplimientoTareasPromedio =
        conCumplimientoTareas.length === 0
          ? null
          : Math.round(
              conCumplimientoTareas.reduce(
                (sum, w) => sum + (w.cumplimientoTareas ?? 0),
                0,
              ) / conCumplimientoTareas.length,
            );

      return {
        id: t.id,
        nombreCompleto: t.nombreCompleto,
        apellido: t.apellido,
        rol: t.rol,
        departamento: t.departamento,
        estado: t.estado,
        fotoUrl: t.fotoUrl,
        puntajeIAPromedio,
        totalBitacoras: t.worklogs.length,
        porcentajeCumplimiento,
        cumplimientoTareasPromedio,
      };
    });
  }

  async empleadoDetalle(
    slug: string,
    actor: Actor,
    talentoId: string,
    page: number,
    limit: number,
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
    });
    if (!talento || talento.empresaId !== empresa.id) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const alcance = await resolverAlcanceTalentoIds(actor, this.prisma);
    if (alcance !== null && !alcance.includes(talento.id)) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const todos = await this.prisma.worklog.findMany({
      where: { talentoId: talento.id },
      orderBy: { fecha: 'asc' },
    });

    const serieIA = todos
      .filter((w) => w.puntajeIA !== null)
      .map((w) => ({ fecha: w.fecha, puntajeIA: w.puntajeIA }));

    const serieCumplimiento = todos
      .filter((w) => w.cumplimientoTareas !== null)
      .map((w) => ({
        fecha: w.fecha,
        cumplimientoTareas: w.cumplimientoTareas,
      }));

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
    const cumplimientoTareasPromedio =
      serieCumplimiento.length === 0
        ? null
        : Math.round(
            serieCumplimiento.reduce(
              (sum, w) => sum + (w.cumplimientoTareas ?? 0),
              0,
            ) / serieCumplimiento.length,
          );

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
        apellido: talento.apellido,
        rol: talento.rol,
        departamento: talento.departamento,
        estado: talento.estado,
        fotoUrl: talento.fotoUrl,
        cedula: talento.cedula,
        correo: talento.correo,
        telefono: talento.telefono,
        fechaIngreso: talento.fechaIngreso,
      },
      metricas: {
        puntajeIAPromedio,
        totalBitacoras: total,
        porcentajeCumplimiento,
        cumplimientoTareasPromedio,
      },
      serieIA,
      serieCumplimiento,
      historial: {
        data: pagina.map((w) => ({
          id: w.id,
          fecha: w.fecha,
          dia: w.dia,
          semana: w.semana,
          tareasPlanificadas: w.tareasPlanificadas,
          horaCheckin: w.horaCheckin,
          checkinEnviado: w.checkinEnviado,
          cumplimientoTareas: w.cumplimientoTareas,
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

  async kpis(slug: string, actor: Actor, query: KpisQueryDto) {
    const empresa = await this.resolverEmpresa(slug, actor);
    const alcance = await resolverAlcanceTalentoIds(actor, this.prisma);
    const talentoIdFiltro = alcance !== null ? { in: alcance } : undefined;

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
          talentoId: talentoIdFiltro,
          fecha: { gte: semanas[0].inicio, lte: semanas[7].fin },
        },
        select: { fecha: true, estadoEnvio: true, puntajeIA: true },
      }),
      this.prisma.worklog.findMany({
        where: {
          empresaId: empresa.id,
          talentoId: talentoIdFiltro,
          fecha: { gte: periodoInicio, lte: periodoFin },
        },
        select: {
          talentoId: true,
          estadoEnvio: true,
          puntajeIA: true,
          cumplimientoTareas: true,
        },
      }),
      this.prisma.worklog.findMany({
        where: {
          empresaId: empresa.id,
          talentoId: talentoIdFiltro,
          fecha: { gte: periodoAnteriorInicio, lte: periodoAnteriorFin },
        },
        select: { talentoId: true, puntajeIA: true },
      }),
      this.prisma.talento.findMany({ where: talentoScopeWhere(actor) }),
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
        const conCumplimientoTareas = propios.filter(
          (w) => w.cumplimientoTareas !== null,
        );
        const cumplimientoTareasProm =
          conCumplimientoTareas.length === 0
            ? null
            : Math.round(
                conCumplimientoTareas.reduce(
                  (sum, w) => sum + (w.cumplimientoTareas ?? 0),
                  0,
                ) / conCumplimientoTareas.length,
              );

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
          fotoUrl: t.fotoUrl,
          puntajeProm,
          cumplimiento,
          cumplimientoTareasProm,
          enviadas,
          tendencia,
        };
      })
      .sort((a, b) => (b.puntajeProm ?? -1) - (a.puntajeProm ?? -1));

    function promedioDeMapa(mapa: Map<string, number | null>): number | null {
      const valores = Array.from(mapa.values()).filter(
        (v): v is number => v !== null,
      );
      if (valores.length === 0) return null;
      return (
        Math.round(
          (valores.reduce((sum, v) => sum + v, 0) / valores.length) * 10,
        ) / 10
      );
    }

    const puntajeProm = promedioDeMapa(promedioActual);
    const puntajePromAnterior = promedioDeMapa(promedioAnterior);
    const variacion =
      puntajeProm !== null && puntajePromAnterior !== null
        ? Math.round((puntajeProm - puntajePromAnterior) * 10) / 10
        : null;

    const enviadasPeriodo = worklogsPeriodo.filter((w) =>
      w.estadoEnvio.includes('✅'),
    ).length;
    const porcentajeCumplimientoPromedio =
      worklogsPeriodo.length === 0
        ? null
        : Math.round((enviadasPeriodo / worklogsPeriodo.length) * 1000) / 10;

    const empleadoDestacado =
      kpisPorEmpleado.length > 0 && kpisPorEmpleado[0].puntajeProm !== null
        ? {
            nombre: kpisPorEmpleado[0].nombre,
            puntajeProm: kpisPorEmpleado[0].puntajeProm,
          }
        : null;

    const resumen = {
      puntajeProm,
      puntajePromAnterior,
      variacion,
      porcentajeCumplimientoPromedio,
      empleadosEnRiesgo: distribucionProductividad.baja,
      empleadoDestacado,
    };

    return {
      periodo,
      resumen,
      evolucionSemanal,
      bitacorasSemanal,
      distribucionEstado,
      distribucionProductividad,
      kpisPorEmpleado,
    };
  }

  async reportes(slug: string, actor: Actor, query: ReportesQueryDto) {
    const empresa = await this.resolverEmpresa(slug, actor);
    const alcance = await resolverAlcanceTalentoIds(actor, this.prisma);
    const talentoIdFiltro = alcance !== null ? { in: alcance } : undefined;

    const { inicio, fin } =
      query.periodo === 'mensual'
        ? rangoMensual(query.valor)
        : rangoSemanal(query.valor);

    const [worklogs, talentos] = await Promise.all([
      this.prisma.worklog.findMany({
        where: {
          empresaId: empresa.id,
          talentoId: talentoIdFiltro,
          fecha: { gte: inicio, lte: fin },
        },
        select: {
          talentoId: true,
          estadoEnvio: true,
          puntajeIA: true,
          cumplimientoTareas: true,
        },
      }),
      this.prisma.talento.findMany({ where: talentoScopeWhere(actor) }),
    ]);

    const totalBitacoras = worklogs.length;
    const enviadas = worklogs.filter((w) =>
      w.estadoEnvio.includes('✅'),
    ).length;
    const porcentajeEnviadas =
      totalBitacoras === 0
        ? null
        : Math.round((enviadas / totalBitacoras) * 1000) / 10;
    const conPuntaje = worklogs.filter((w) => w.puntajeIA !== null);
    const puntajeProm =
      conPuntaje.length === 0
        ? null
        : Math.round(
            (conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) /
              conPuntaje.length) *
              10,
          ) / 10;

    const detalle = talentos
      .map((t) => {
        const propios = worklogs.filter((w) => w.talentoId === t.id);
        const propiosConPuntaje = propios.filter((w) => w.puntajeIA !== null);
        const propioPuntajeProm =
          propiosConPuntaje.length === 0
            ? null
            : Math.round(
                (propiosConPuntaje.reduce(
                  (sum, w) => sum + (w.puntajeIA ?? 0),
                  0,
                ) /
                  propiosConPuntaje.length) *
                  10,
              ) / 10;
        const propiasEnviadas = propios.filter((w) =>
          w.estadoEnvio.includes('✅'),
        ).length;
        const propioCumplimiento =
          propios.length === 0
            ? null
            : Math.round((propiasEnviadas / propios.length) * 1000) / 10;
        const propiosConCumplimientoTareas = propios.filter(
          (w) => w.cumplimientoTareas !== null,
        );
        const propioCumplimientoTareasProm =
          propiosConCumplimientoTareas.length === 0
            ? null
            : Math.round(
                propiosConCumplimientoTareas.reduce(
                  (sum, w) => sum + (w.cumplimientoTareas ?? 0),
                  0,
                ) / propiosConCumplimientoTareas.length,
              );

        return {
          talentoId: t.id,
          nombre: t.nombreCompleto,
          rol: t.rol,
          puntajeProm: propioPuntajeProm,
          cumplimiento: propioCumplimiento,
          cumplimientoTareasProm: propioCumplimientoTareasProm,
          enviadas: propiasEnviadas,
          totalBitacoras: propios.length,
        };
      })
      .sort((a, b) => (b.puntajeProm ?? -1) - (a.puntajeProm ?? -1));

    const conPuntajeProm = detalle.filter((d) => d.puntajeProm !== null);
    const empleadoDelMes =
      conPuntajeProm.length === 0
        ? null
        : conPuntajeProm.reduce((mejor, actual) =>
            (actual.puntajeProm ?? -1) > (mejor.puntajeProm ?? -1)
              ? actual
              : mejor,
          );

    const conCumplimiento = detalle.filter((d) => d.cumplimiento !== null);
    const empleadoEnRiesgo =
      conCumplimiento.length === 0
        ? null
        : conCumplimiento.reduce((peor, actual) =>
            (actual.cumplimiento ?? 101) < (peor.cumplimiento ?? 101)
              ? actual
              : peor,
          );

    return {
      periodo: query.periodo,
      valor: query.valor,
      rangoInicio: inicio,
      rangoFin: fin,
      empresa: { nombre: empresa.nombre, slug: empresa.slug },
      resumen: {
        totalBitacoras,
        porcentajeEnviadas,
        puntajeProm,
        empleadoDelMes: empleadoDelMes
          ? {
              nombre: empleadoDelMes.nombre,
              puntajeProm: empleadoDelMes.puntajeProm,
            }
          : null,
        empleadoEnRiesgo: empleadoEnRiesgo
          ? {
              nombre: empleadoEnRiesgo.nombre,
              cumplimiento: empleadoEnRiesgo.cumplimiento,
            }
          : null,
      },
      detalle,
    };
  }

  async crearTalento(slug: string, actor: Actor, dto: CrearTalentoDto) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const talento = await this.prisma.talento.create({
      data: {
        empresaId: empresa.id,
        nombreCompleto: dto.nombreCompleto.trim(),
        rol: dto.rol.trim(),
        estado: 'activo',
      },
    });

    return {
      id: talento.id,
      nombreCompleto: talento.nombreCompleto,
      rol: talento.rol,
      estado: talento.estado,
      puntajeIAPromedio: null,
      totalBitacoras: 0,
      porcentajeCumplimiento: null,
      cumplimientoTareasPromedio: null,
    };
  }
}
