import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BitacorasQueryDto } from './dto/bitacoras-query.dto';
import { KpisQueryDto } from './dto/kpis-query.dto';
import { ReportesQueryDto } from './dto/reportes-query.dto';
import { CrearTalentoDto } from './dto/crear-talento.dto';
import { CrearUsuarioEmpresaDto } from './dto/crear-usuario-empresa.dto';
import { RankingsQueryDto } from './dto/rankings-query.dto';
import { ActualizarLogoEmpresaDto } from './dto/actualizar-logo-empresa.dto';
import { MuralService } from '../mural/mural.service';
import { EnviarNotaDto } from '../mural/dto/enviar-nota.dto';
import { AnalisisEjecutivoService } from './analisis-ejecutivo.service';
import { clasificarEstado, esAusenciaAutorizada } from './estado.util';
import { invitarUsuario } from '../auth/invitar-usuario.util';
import {
  cambiarCorreoUsuario,
  enviarResetPassword,
} from '../auth/gestionar-usuario.util';
import {
  rangoAnual,
  rangoMensual,
  rangoSemanal,
  type RangoFechas,
} from './periodo.util';
import { Actor } from '../auth/actor.types';
import {
  resolverAlcanceTalentoIds,
  talentoActivoScopeWhere,
  talentoScopeWhere,
} from '../auth/talento-scope.util';
import { validarDepartamentoPermitido } from './departamento.util';
import { CrearSolicitudSoporteDto } from './dto/crear-solicitud-soporte.dto';

/** Días de ausencia autorizada quedan fuera del numerador y denominador. */
function excluirAusencias<T extends { estadoEnvio: string }>(
  registros: T[],
): T[] {
  return registros.filter((w) => !esAusenciaAutorizada(w.estadoEnvio));
}

const MARCADOR_ESTADO: Record<string, string> = {
  enviada: '✅',
  no_enviada: '❌',
  permiso: '📋',
};

export interface Alerta {
  id: string;
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  severidad: 'critica' | 'advertencia' | 'positiva';
  tipo: string;
  mensaje: string;
  fecha: string;
}

@Injectable()
export class EmpresasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analisisEjecutivo: AnalisisEjecutivoService,
    private readonly mural: MuralService,
  ) {}

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

  /** Logo de la empresa — cara trasera del Lanyard en Mi Mural. */
  async actualizarLogo(
    slug: string,
    actor: Actor,
    dto: ActualizarLogoEmpresaDto,
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);

    return this.prisma.empresa.update({
      where: { id: empresa.id },
      data: { logoUrl: dto.logoUrl },
      select: { slug: true, logoUrl: true },
    });
  }

  /**
   * Directorio para "Mi Mural": a diferencia de empleados() (que usa
   * talentoScopeWhere y restringe a MANAGER/TALENTO a su propio alcance),
   * este listado es intencionalmente abierto a toda la empresa — el mural
   * es un espacio social, no un dato sensible de desempeño.
   */
  async muralDirectorio(slug: string, actor: Actor) {
    const empresa = await this.resolverEmpresa(slug, actor);

    return this.prisma.talento.findMany({
      where: { empresaId: empresa.id, estado: 'activo' },
      select: { id: true, nombreCompleto: true, rol: true, fotoUrl: true },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  /** Vista de solo lectura del mural de cualquier talento de la empresa. */
  async muralDeTalento(slug: string, actor: Actor, talentoId: string) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
    });
    if (!talento || talento.empresaId !== empresa.id) {
      throw new NotFoundException('Empleado no encontrado');
    }

    return this.mural.obtenerMuralDeTalento(talento.id, empresa.id);
  }

  /** Un compañero le deja una nota a OTRO talento de la empresa. */
  async enviarNotaAMural(
    slug: string,
    actor: Actor,
    talentoId: string,
    dto: EnviarNotaDto,
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
    });
    if (!talento || talento.empresaId !== empresa.id) {
      throw new NotFoundException('Empleado no encontrado');
    }

    return this.mural.crearNotaParaOtro(actor, talento.id, empresa.id, dto);
  }

  /**
   * Cumpleaños de hoy y del resto del mes en curso — visible para toda la
   * empresa (sin @Roles), como el directorio de murales. La fecha "hoy" se
   * calcula en huso horario de RD, igual que WorklogsService.hoyISO(), para
   * no desincronizarse por el huso del servidor.
   */
  async cumpleanos(slug: string, actor: Actor) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const talentos = await this.prisma.talento.findMany({
      where: {
        empresaId: empresa.id,
        estado: 'activo',
        fechaNacimiento: { not: null },
      },
      select: {
        id: true,
        nombreCompleto: true,
        fotoUrl: true,
        departamento: true,
        rol: true,
        fechaNacimiento: true,
      },
    });

    const hoyISO = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
    }).format(new Date());
    const [, mesHoyStr, diaHoyStr] = hoyISO.split('-');
    const mesHoy = Number(mesHoyStr);
    const diaHoy = Number(diaHoyStr);

    const conMesDia = talentos.map((t) => ({
      id: t.id,
      nombreCompleto: t.nombreCompleto,
      fotoUrl: t.fotoUrl,
      departamento: t.departamento,
      rol: t.rol,
      dia: t.fechaNacimiento!.getUTCDate(),
      mes: t.fechaNacimiento!.getUTCMonth() + 1,
    }));

    const hoy = conMesDia.filter((t) => t.mes === mesHoy && t.dia === diaHoy);
    const idsHoy = new Set(hoy.map((t) => t.id));
    const esteMes = conMesDia
      .filter((t) => t.mes === mesHoy && !idsHoy.has(t.id))
      .sort((a, b) => a.dia - b.dia);

    const porMes = Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => ({
      mes,
      talentos: conMesDia
        .filter((t) => t.mes === mes)
        .sort((a, b) => a.dia - b.dia),
    }));

    return { hoy, esteMes, porMes };
  }

  async dashboard(slug: string, actor: Actor, departamento?: string) {
    const empresa = await this.resolverEmpresa(slug, actor);

    // TODO: filtrar por empresaId es manual porque todavia no hay RLS en Postgres.
    // Alcance adicional por rol (MANAGER/TALENTO ven solo su gente) via
    // talentoActivoScopeWhere — solo talentos activos entran a las métricas,
    // un inactivo no tiene sentido que "no envió bitácora".
    const [worklogsTodos, talentos] = await Promise.all([
      this.prisma.worklog.findMany({
        where: { empresaId: empresa.id },
        include: { talento: { select: { nombreCompleto: true } } },
        orderBy: { fecha: 'desc' },
      }),
      this.prisma.talento.findMany({
        where: talentoActivoScopeWhere(actor, departamento),
      }),
    ]);

    const talentoIdsVisibles = new Set(talentos.map((t) => t.id));
    const worklogs = worklogsTodos.filter((w) =>
      talentoIdsVisibles.has(w.talentoId),
    );
    // Un día de vacaciones/permiso/licencia no es una bitácora real — no debe
    // aparecer como "más reciente" ni como "última actividad" de nadie.
    const worklogsSinAusencias = excluirAusencias(worklogs);

    // "Total de bitácoras" del dashboard es del mes en curso, no histórico
    // — para eso está la página de Bitácoras (que ya soporta rango libre).
    const ahora = new Date();
    const mesActual = `${ahora.getUTCFullYear()}-${String(ahora.getUTCMonth() + 1).padStart(2, '0')}`;
    const rangoMesActual: RangoFechas = rangoMensual(mesActual);
    const worklogsMesActual = worklogs.filter(
      (w) => w.fecha >= rangoMesActual.inicio && w.fecha <= rangoMesActual.fin,
    );
    // Vacaciones/permiso/licencia no cuentan como bitácora esperada.
    const worklogsMesActualEvaluables = excluirAusencias(worklogsMesActual);

    const totalBitacoras = worklogsMesActualEvaluables.length;
    const enviadas = worklogsMesActualEvaluables.filter(
      (w) => w.estadoEnvio === '✅ Enviada',
    ).length;
    const porcentajeEnviadas =
      totalBitacoras === 0
        ? 0
        : Math.round((enviadas / totalBitacoras) * 1000) / 10;

    const rankingTalentos = talentos
      .map((t) => {
        const propios = worklogs.filter((w) => w.talentoId === t.id);
        const propiosEvaluables = excluirAusencias(propios);
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
          bitacorasEnviadas: propiosEvaluables.filter(
            (w) => w.estadoEnvio === '✅ Enviada',
          ).length,
          totalBitacoras: propiosEvaluables.length,
        };
      })
      .sort(
        (a, b) => (b.puntajeIAPromedio ?? -1) - (a.puntajeIAPromedio ?? -1),
      );

    const worklogsRecientes = worklogsSinAusencias.slice(0, 10).map((w) => ({
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
        const ultimo = worklogsSinAusencias.find((w) => w.talentoId === t.id);
        return {
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          rol: t.rol,
          fotoUrl: t.fotoUrl,
          estado: t.estado,
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
        logoUrl: empresa.logoUrl,
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

    const alcance = await resolverAlcanceTalentoIds(
      actor,
      this.prisma,
      query.departamento,
    );
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

  async empleados(slug: string, actor: Actor, departamento?: string) {
    await this.resolverEmpresa(slug, actor);

    const talentos = await this.prisma.talento.findMany({
      where: talentoScopeWhere(actor, departamento),
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
        carnetFotoUrl: talento.carnetFotoUrl,
        cedula: talento.cedula,
        correo: talento.correo,
        telefono: talento.telefono,
        fechaIngreso: talento.fechaIngreso,
        fechaNacimiento: talento.fechaNacimiento,
        cvUrl: talento.cvUrl,
        cvDatosExtraidos: talento.cvDatosExtraidos,
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
    const alcance = await resolverAlcanceTalentoIds(
      actor,
      this.prisma,
      query.departamento,
    );
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

    const hoy = new Date(
      Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()),
    );

    // TODO: filtrar por empresaId es manual porque todavia no hay RLS en Postgres.
    const [
      worklogsRangoSemanalTodos,
      worklogsPeriodoTodos,
      worklogsPeriodoAnteriorTodos,
      talentos,
      worklogsHoy,
    ] = await Promise.all([
      this.prisma.worklog.findMany({
        where: {
          empresaId: empresa.id,
          talentoId: talentoIdFiltro,
          fecha: { gte: semanas[0].inicio, lte: semanas[7].fin },
        },
        select: {
          talentoId: true,
          fecha: true,
          estadoEnvio: true,
          puntajeIA: true,
        },
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
      this.prisma.talento.findMany({
        where: talentoActivoScopeWhere(actor, query.departamento),
      }),
      this.prisma.worklog.findMany({
        where: {
          empresaId: empresa.id,
          talentoId: talentoIdFiltro,
          fecha: hoy,
        },
        select: { talentoId: true, estadoEnvio: true },
      }),
    ]);

    // talentoIdFiltro no distingue activo/inactivo (viene del alcance por
    // rol) — se vuelve a filtrar aquí contra los talentos activos ya
    // resueltos, para que ningún inactivo se cuele en los agregados.
    const talentoIdsVisibles = new Set(talentos.map((t) => t.id));
    const worklogsRangoSemanal = worklogsRangoSemanalTodos.filter((w) =>
      talentoIdsVisibles.has(w.talentoId),
    );
    const worklogsPeriodo = worklogsPeriodoTodos.filter((w) =>
      talentoIdsVisibles.has(w.talentoId),
    );
    const worklogsPeriodoAnterior = worklogsPeriodoAnteriorTodos.filter((w) =>
      talentoIdsVisibles.has(w.talentoId),
    );
    const estadoActualPorTalento = new Map(
      worklogsHoy
        .filter((w) => esAusenciaAutorizada(w.estadoEnvio))
        .map((w) => [w.talentoId, w.estadoEnvio]),
    );

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
      const enSemana = excluirAusencias(
        worklogsRangoSemanal.filter((w) => w.fecha >= inicio && w.fecha <= fin),
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
        const propiosEvaluables = excluirAusencias(propios);
        const enviadas = propiosEvaluables.filter((w) =>
          w.estadoEnvio.includes('✅'),
        ).length;
        const cumplimiento =
          propiosEvaluables.length === 0
            ? null
            : Math.round((enviadas / propiosEvaluables.length) * 1000) / 10;
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
          estadoActual: estadoActualPorTalento.get(t.id) ?? null,
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

    const worklogsPeriodoEvaluables = excluirAusencias(worklogsPeriodo);
    const enviadasPeriodo = worklogsPeriodoEvaluables.filter((w) =>
      w.estadoEnvio.includes('✅'),
    ).length;
    const porcentajeCumplimientoPromedio =
      worklogsPeriodoEvaluables.length === 0
        ? null
        : Math.round(
            (enviadasPeriodo / worklogsPeriodoEvaluables.length) * 1000,
          ) / 10;

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
    const alcance = await resolverAlcanceTalentoIds(
      actor,
      this.prisma,
      query.departamento,
    );
    const talentoIdFiltro = alcance !== null ? { in: alcance } : undefined;

    let inicio: Date;
    let fin: Date;
    let valor: string;
    if (query.periodo === 'personalizado') {
      if (!query.fechaInicio || !query.fechaFin) {
        throw new BadRequestException(
          'fechaInicio y fechaFin son requeridos para periodo personalizado',
        );
      }
      inicio = new Date(`${query.fechaInicio}T00:00:00.000Z`);
      fin = new Date(`${query.fechaFin}T23:59:59.999Z`);
      valor = `${query.fechaInicio}_${query.fechaFin}`;
    } else {
      if (!query.valor) {
        throw new BadRequestException(
          'valor es requerido para este tipo de periodo',
        );
      }
      valor = query.valor;
      ({ inicio, fin } =
        query.periodo === 'mensual'
          ? rangoMensual(query.valor)
          : query.periodo === 'semanal'
            ? rangoSemanal(query.valor)
            : rangoAnual(query.valor));
    }

    const [worklogsTodos, talentos] = await Promise.all([
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
      this.prisma.talento.findMany({
        where: talentoActivoScopeWhere(actor, query.departamento),
      }),
    ]);

    // talentoIdFiltro no distingue activo/inactivo — se re-filtra contra
    // los talentos activos ya resueltos.
    const talentoIdsVisibles = new Set(talentos.map((t) => t.id));
    const worklogs = worklogsTodos.filter((w) =>
      talentoIdsVisibles.has(w.talentoId),
    );
    const worklogsEvaluables = excluirAusencias(worklogs);

    const totalBitacoras = worklogsEvaluables.length;
    const enviadas = worklogsEvaluables.filter((w) =>
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
        const propiosEvaluables = excluirAusencias(propios);
        const propiasEnviadas = propiosEvaluables.filter((w) =>
          w.estadoEnvio.includes('✅'),
        ).length;
        const propioCumplimiento =
          propiosEvaluables.length === 0
            ? null
            : Math.round((propiasEnviadas / propiosEvaluables.length) * 1000) /
              10;
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
          totalBitacoras: propiosEvaluables.length,
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
      valor,
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

  /** Catálogo de departamentos configurado por Talentix para esta empresa. */
  async departamentos(slug: string, actor: Actor) {
    const empresa = await this.resolverEmpresa(slug, actor);
    return this.prisma.departamentoDefinicion.findMany({
      where: { empresaId: empresa.id },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async crearTalento(slug: string, actor: Actor, dto: CrearTalentoDto) {
    const empresa = await this.resolverEmpresa(slug, actor);
    await validarDepartamentoPermitido(
      this.prisma,
      empresa.id,
      dto.departamento?.trim(),
    );

    const talento = await this.prisma.talento.create({
      data: {
        empresaId: empresa.id,
        nombreCompleto: dto.nombreCompleto.trim(),
        rol: dto.rol.trim(),
        estado: 'activo',
        apellido: dto.apellido?.trim() || null,
        departamento: dto.departamento?.trim() || null,
        cedula: dto.cedula?.trim() || null,
        correo: dto.correo?.trim() || null,
        telefono: dto.telefono?.trim() || null,
        fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : null,
      },
    });

    return {
      id: talento.id,
      nombreCompleto: talento.nombreCompleto,
      apellido: talento.apellido,
      rol: talento.rol,
      departamento: talento.departamento,
      estado: talento.estado,
      fotoUrl: talento.fotoUrl,
      puntajeIAPromedio: null,
      totalBitacoras: 0,
      porcentajeCumplimiento: null,
      cumplimientoTareasPromedio: null,
    };
  }

  /**
   * CEO/RRHH invitan a su propio talento a entrar a la plataforma, igual
   * que el panel admin — pero acotado a TALENTO/MANAGER (dar de alta otro
   * CEO/RRHH sigue siendo exclusivo del panel admin).
   */
  async crearUsuario(slug: string, actor: Actor, dto: CrearUsuarioEmpresaDto) {
    const empresa = await this.resolverEmpresa(slug, actor);
    if (dto.rol === 'MANAGER') {
      await validarDepartamentoPermitido(
        this.prisma,
        empresa.id,
        dto.departamentoGestionado?.trim(),
      );
    }
    if (dto.rol === 'GERENTE_GENERAL') {
      for (const departamento of dto.departamentosSupervisados ?? []) {
        await validarDepartamentoPermitido(
          this.prisma,
          empresa.id,
          departamento.trim(),
        );
      }
    }

    if (dto.talentoId) {
      const talento = await this.prisma.talento.findUnique({
        where: { id: dto.talentoId },
      });
      if (!talento || talento.empresaId !== empresa.id) {
        throw new NotFoundException('Empleado no encontrado');
      }
    }

    const usuario = await invitarUsuario(this.prisma, {
      empresaId: empresa.id,
      email: dto.email,
      nombre: dto.nombre,
      rol: dto.rol,
      talentoId: dto.talentoId,
      departamentoGestionado: dto.departamentoGestionado,
      departamentosSupervisados: dto.departamentosSupervisados,
    });

    return { usuario, invitacionEnviada: true };
  }

  /** Accesos que CEO/RRHH pueden gestionar desde el panel: solo su propio talento. */
  async usuarios(slug: string, actor: Actor) {
    const empresa = await this.resolverEmpresa(slug, actor);
    return this.prisma.usuario.findMany({
      where: {
        empresaId: empresa.id,
        rol: { in: ['TALENTO', 'MANAGER', 'GERENTE_GENERAL'] },
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        passwordEstablecida: true,
        talentoId: true,
        departamentoGestionado: true,
        departamentosSupervisados: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  private async validarUsuarioGestionable(
    empresaId: string,
    usuarioId: string,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario || usuario.empresaId !== empresaId) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (
      usuario.rol !== 'TALENTO' &&
      usuario.rol !== 'MANAGER' &&
      usuario.rol !== 'GERENTE_GENERAL'
    ) {
      throw new ForbiddenException(
        'No puedes gestionar este acceso desde aquí',
      );
    }
    return usuario;
  }

  async cambiarCorreoUsuario(
    slug: string,
    actor: Actor,
    usuarioId: string,
    email: string,
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);
    await this.validarUsuarioGestionable(empresa.id, usuarioId);
    return cambiarCorreoUsuario(this.prisma, usuarioId, email);
  }

  async restablecerPasswordUsuario(
    slug: string,
    actor: Actor,
    usuarioId: string,
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);
    await this.validarUsuarioGestionable(empresa.id, usuarioId);
    return enviarResetPassword(this.prisma, usuarioId);
  }

  async actualizarDepartamentoGestionado(
    slug: string,
    actor: Actor,
    usuarioId: string,
    departamentoGestionado: string | null,
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);
    const usuario = await this.validarUsuarioGestionable(empresa.id, usuarioId);
    if (usuario.rol !== 'MANAGER') {
      throw new ForbiddenException(
        'Solo un usuario con rol Gerente puede tener un departamento asignado',
      );
    }
    await validarDepartamentoPermitido(
      this.prisma,
      empresa.id,
      departamentoGestionado,
    );
    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { departamentoGestionado },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        departamentoGestionado: true,
      },
    });
  }

  async actualizarDepartamentosSupervisados(
    slug: string,
    actor: Actor,
    usuarioId: string,
    departamentosSupervisados: string[],
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);
    const usuario = await this.validarUsuarioGestionable(empresa.id, usuarioId);
    if (usuario.rol !== 'GERENTE_GENERAL') {
      throw new ForbiddenException(
        'Solo un usuario con rol Gerente General puede tener departamentos supervisados',
      );
    }
    for (const departamento of departamentosSupervisados) {
      await validarDepartamentoPermitido(this.prisma, empresa.id, departamento);
    }
    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { departamentosSupervisados },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        departamentosSupervisados: true,
      },
    });
  }

  async rankings(slug: string, actor: Actor, query: RankingsQueryDto) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const periodo = query.periodo ?? 'mensual';
    let rango: RangoFechas | null = null;
    let valor: string | null = null;
    const ahora = new Date();
    if (periodo === 'mensual') {
      valor =
        query.valor ??
        `${ahora.getUTCFullYear()}-${String(ahora.getUTCMonth() + 1).padStart(2, '0')}`;
      rango = rangoMensual(valor);
    } else if (periodo === 'anual') {
      valor = query.valor ?? String(ahora.getUTCFullYear());
      rango = rangoAnual(valor);
    }

    const [talentos, worklogs] = await Promise.all([
      this.prisma.talento.findMany({
        where: talentoActivoScopeWhere(actor, query.departamento),
      }),
      this.prisma.worklog.findMany({
        where: {
          empresaId: empresa.id,
          ...(rango && { fecha: { gte: rango.inicio, lte: rango.fin } }),
        },
        select: { talentoId: true, estadoEnvio: true, puntajeIA: true },
      }),
    ]);

    function construirRanking(lista: typeof talentos) {
      return lista
        .map((t) => {
          const propios = worklogs.filter((w) => w.talentoId === t.id);
          const conPuntaje = propios.filter((w) => w.puntajeIA !== null);
          const puntajeIAPromedio =
            conPuntaje.length === 0
              ? null
              : Math.round(
                  (conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) /
                    conPuntaje.length) *
                    10,
                ) / 10;
          const propiosEvaluables = excluirAusencias(propios);
          return {
            talentoId: t.id,
            nombreCompleto: t.nombreCompleto,
            rol: t.rol,
            fotoUrl: t.fotoUrl,
            puntajeIAPromedio,
            bitacorasEnviadas: propiosEvaluables.filter((w) =>
              w.estadoEnvio.includes('✅'),
            ).length,
            totalBitacoras: propiosEvaluables.length,
          };
        })
        .sort(
          (a, b) => (b.puntajeIAPromedio ?? -1) - (a.puntajeIAPromedio ?? -1),
        );
    }

    const general = construirRanking(talentos);

    const departamentos = Array.from(
      new Set(
        talentos
          .map((t) => t.departamento)
          .filter((d): d is string => Boolean(d)),
      ),
    ).sort((a, b) => a.localeCompare(b));

    const porDepartamento = departamentos.map((departamento) => ({
      departamento,
      talentos: construirRanking(
        talentos.filter((t) => t.departamento === departamento),
      ),
    }));

    const sinDepartamentoLista = construirRanking(
      talentos.filter((t) => !t.departamento),
    );

    return {
      periodo,
      valor,
      general,
      porDepartamento,
      sinDepartamento:
        sinDepartamentoLista.length > 0 ? sinDepartamentoLista : null,
    };
  }

  /**
   * Detección automática de riesgos y reconocimientos — no hay tabla de
   * alertas ni un job periódico: se calcula al vuelo sobre las bitácoras
   * del mes en curso (más la última actividad de cada talento, sin límite
   * de mes, para detectar inactividad). Siempre refleja el estado real,
   * nunca queda desactualizada.
   */
  async alertas(slug: string, actor: Actor, departamento?: string) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const [talentos, worklogsDesc] = await Promise.all([
      this.prisma.talento.findMany({
        where: talentoActivoScopeWhere(actor, departamento),
      }),
      this.prisma.worklog.findMany({
        where: { empresaId: empresa.id },
        select: {
          talentoId: true,
          fecha: true,
          estadoEnvio: true,
          puntajeIA: true,
        },
        orderBy: { fecha: 'desc' },
      }),
    ]);

    const talentoIdsVisibles = new Set(talentos.map((t) => t.id));
    const worklogs = worklogsDesc.filter((w) =>
      talentoIdsVisibles.has(w.talentoId),
    );

    const ahora = new Date();
    const mesActual = `${ahora.getUTCFullYear()}-${String(ahora.getUTCMonth() + 1).padStart(2, '0')}`;
    const rangoMes = rangoMensual(mesActual);
    const hoyUtc = new Date(
      Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()),
    );

    const alertas: Alerta[] = [];

    for (const t of talentos) {
      // worklogs ya viene ordenado desc por fecha; filter() preserva ese orden.
      const propios = worklogs.filter((w) => w.talentoId === t.id);
      const ultimo = propios[0] ?? null;
      const diasSinActividad = ultimo
        ? Math.floor(
            (hoyUtc.getTime() -
              Date.UTC(
                ultimo.fecha.getUTCFullYear(),
                ultimo.fecha.getUTCMonth(),
                ultimo.fecha.getUTCDate(),
              )) /
              86400000,
          )
        : null;

      if (diasSinActividad === null || diasSinActividad >= 3) {
        alertas.push({
          id: `${t.id}-inactividad`,
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          fotoUrl: t.fotoUrl,
          severidad: 'critica',
          tipo: 'inactividad',
          mensaje:
            diasSinActividad === null
              ? 'Nunca ha enviado una bitácora.'
              : `${diasSinActividad} días sin enviar una bitácora.`,
          fecha: (ultimo?.fecha ?? ahora).toISOString(),
        });
      }

      const delMes = propios.filter(
        (w) => w.fecha >= rangoMes.inicio && w.fecha <= rangoMes.fin,
      );
      if (delMes.length === 0) continue;

      const delMesEvaluable = excluirAusencias(delMes);
      const enviadas = delMesEvaluable.filter((w) =>
        w.estadoEnvio.includes('✅'),
      ).length;
      const cumplimiento =
        delMesEvaluable.length === 0
          ? 100
          : Math.round((enviadas / delMesEvaluable.length) * 1000) / 10;
      const conPuntaje = delMes.filter((w) => w.puntajeIA !== null);
      const puntajeProm =
        conPuntaje.length === 0
          ? null
          : Math.round(
              (conPuntaje.reduce((sum, w) => sum + (w.puntajeIA ?? 0), 0) /
                conPuntaje.length) *
                10,
            ) / 10;
      const fechaMasReciente = delMes[0].fecha.toISOString();

      if (cumplimiento < 40) {
        alertas.push({
          id: `${t.id}-cumplimiento`,
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          fotoUrl: t.fotoUrl,
          severidad: 'critica',
          tipo: 'cumplimiento',
          mensaje: `Cumplimiento del ${cumplimiento}% este mes.`,
          fecha: fechaMasReciente,
        });
      } else if (cumplimiento < 70) {
        alertas.push({
          id: `${t.id}-cumplimiento`,
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          fotoUrl: t.fotoUrl,
          severidad: 'advertencia',
          tipo: 'cumplimiento',
          mensaje: `Cumplimiento del ${cumplimiento}% este mes.`,
          fecha: fechaMasReciente,
        });
      }

      if (puntajeProm !== null && puntajeProm < 5) {
        alertas.push({
          id: `${t.id}-puntaje`,
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          fotoUrl: t.fotoUrl,
          severidad: 'advertencia',
          tipo: 'puntaje',
          mensaje: `Puntaje IA promedio de ${puntajeProm.toFixed(1)} este mes.`,
          fecha: fechaMasReciente,
        });
      }

      if (cumplimiento === 100 && puntajeProm !== null && puntajeProm >= 8) {
        alertas.push({
          id: `${t.id}-reconocimiento`,
          talentoId: t.id,
          nombreCompleto: t.nombreCompleto,
          fotoUrl: t.fotoUrl,
          severidad: 'positiva',
          tipo: 'reconocimiento',
          mensaje: `100% de cumplimiento con puntaje IA de ${puntajeProm.toFixed(1)} este mes.`,
          fecha: fechaMasReciente,
        });
      }
    }

    const ordenSeveridad: Record<Alerta['severidad'], number> = {
      critica: 0,
      advertencia: 1,
      positiva: 2,
    };
    alertas.sort(
      (a, b) =>
        ordenSeveridad[a.severidad] - ordenSeveridad[b.severidad] ||
        (a.fecha < b.fecha ? 1 : -1),
    );

    return {
      resumen: {
        criticas: alertas.filter((a) => a.severidad === 'critica').length,
        advertencias: alertas.filter((a) => a.severidad === 'advertencia')
          .length,
        positivas: alertas.filter((a) => a.severidad === 'positiva').length,
      },
      alertas,
    };
  }

  /**
   * Reutiliza exactamente el mismo cálculo que reportes() — el análisis
   * ejecutivo es una capa de narrativa sobre los mismos números, no un
   * cálculo aparte. Si la IA falla o no está disponible, analisis queda
   * en null y el frontend muestra los datos igual, solo sin el resumen.
   */
  async reportesEjecutivos(
    slug: string,
    actor: Actor,
    query: ReportesQueryDto,
  ) {
    const datosReporte = await this.reportes(slug, actor, query);

    const analisis = await this.analisisEjecutivo.generar({
      periodo: datosReporte.periodo,
      rango: { desde: datosReporte.rangoInicio, hasta: datosReporte.rangoFin },
      resumen: datosReporte.resumen,
      porEmpleado: datosReporte.detalle,
    });

    return { ...datosReporte, analisis };
  }

  /** Solicitud de soporte (avería/sugerencia) enviada al equipo de Talentix. */
  async crearSolicitudSoporte(
    slug: string,
    actor: Actor,
    dto: CrearSolicitudSoporteDto,
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }

    const solicitud = await this.prisma.solicitudSoporte.create({
      data: {
        empresaId: empresa.id,
        usuarioId: actor.usuario.id,
        tipo: dto.tipo,
        mensaje: dto.mensaje.trim(),
      },
      select: { id: true, tipo: true, mensaje: true, createdAt: true },
    });

    return solicitud;
  }
}
