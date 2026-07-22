import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { esAusenciaAutorizada } from '../empresas/estado.util';
import { ActualizarPerfilMuralDto } from './dto/actualizar-perfil-mural.dto';
import { CrearNotaDto } from './dto/crear-nota.dto';
import { EnviarNotaDto } from './dto/enviar-nota.dto';
import { ActualizarNotaDto } from './dto/actualizar-nota.dto';
import { ActualizarPosicionEstampaDto } from './dto/actualizar-posicion-estampa.dto';

const LIMITE_DIAS_RACHA = 400;

/** Suma (o resta) días a una fecha ISO (YYYY-MM-DD) trabajando siempre en UTC — mismo criterio con el que se guarda `Worklog.fecha`. */
function sumarDiasISO(iso: string, delta: number): string {
  const fecha = new Date(`${iso}T00:00:00.000Z`);
  fecha.setUTCDate(fecha.getUTCDate() + delta);
  return fecha.toISOString().slice(0, 10);
}

const SELECT_PERFIL = {
  apodo: true,
  meGusta: true,
  noMeGusta: true,
  cancionFavorita: true,
  superpoder: true,
  personalidades: true,
  estado: true,
  fondoId: true,
} as const;

const PERFIL_POR_DEFECTO = {
  apodo: null,
  meGusta: null,
  noMeGusta: null,
  cancionFavorita: null,
  superpoder: null,
  personalidades: [] as string[],
  estado: null,
  fondoId: 'corcho',
};

/** Recorta a 5, recorta espacios y descarta vacíos — misma limpieza al crear y al actualizar. */
function limpiarPersonalidades(personalidades: string[]): string[] {
  return personalidades
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .slice(0, 5);
}

const SELECT_NOTA = {
  id: true,
  texto: true,
  color: true,
  posX: true,
  posY: true,
  rotacion: true,
  zIndex: true,
  escala: true,
  enviadaPor: { select: { nombre: true } },
} as const;

function serializarNota(nota: {
  id: string;
  texto: string;
  color: string;
  posX: number;
  posY: number;
  rotacion: number;
  zIndex: number;
  escala: number;
  enviadaPor: { nombre: string } | null;
}) {
  return {
    id: nota.id,
    texto: nota.texto,
    color: nota.color,
    posX: nota.posX,
    posY: nota.posY,
    rotacion: nota.rotacion,
    zIndex: nota.zIndex,
    escala: nota.escala,
    enviadaPorNombre: nota.enviadaPor?.nombre ?? null,
  };
}

const SELECT_ESTAMPA_OTORGADA = {
  id: true,
  mensaje: true,
  posX: true,
  posY: true,
  zIndex: true,
  enMural: true,
  createdAt: true,
  estampaDefinicion: {
    select: { id: true, nombre: true, imagenUrl: true, forma: true },
  },
} as const;

function serializarEstampaOtorgada(otorgada: {
  id: string;
  mensaje: string | null;
  posX: number;
  posY: number;
  zIndex: number;
  enMural: boolean;
  createdAt: Date;
  estampaDefinicion: {
    id: string;
    nombre: string;
    imagenUrl: string;
    forma: string;
  };
}) {
  return {
    id: otorgada.id,
    estampaDefinicionId: otorgada.estampaDefinicion.id,
    nombre: otorgada.estampaDefinicion.nombre,
    imagenUrl: otorgada.estampaDefinicion.imagenUrl,
    forma: otorgada.estampaDefinicion.forma,
    mensaje: otorgada.mensaje,
    posX: otorgada.posX,
    posY: otorgada.posY,
    zIndex: otorgada.zIndex,
    enMural: otorgada.enMural,
    createdAt: otorgada.createdAt,
  };
}

/**
 * Autoservicio del propio mural — sin @Roles: aplica a TALENTO, MANAGER, y
 * a un CEO/RRHH que tenga un Talento vinculado. Cada método deriva el
 * talentoId del actor autenticado, nunca de un parámetro del cliente.
 */
@Injectable()
export class MuralService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  private exigirTalentoId(actor: Actor): {
    talentoId: string;
    empresaId: string;
  } {
    if (actor.type !== 'usuario' || !actor.usuario.talentoId) {
      throw new ForbiddenException(
        'Esta cuenta no tiene un perfil de empleado asociado',
      );
    }
    return { talentoId: actor.usuario.talentoId, empresaId: actor.empresaId };
  }

  async obtenerMural(actor: Actor) {
    const { talentoId, empresaId } = this.exigirTalentoId(actor);
    return this.construirRespuestaMural(talentoId, empresaId);
  }

  /**
   * Vista de solo lectura del mural de OTRO talento (visible para toda la
   * empresa, no solo el dueño). El llamador (EmpresasService) ya verificó
   * que `talentoId` pertenece a `empresaId` antes de llegar acá.
   */
  async obtenerMuralDeTalento(talentoId: string, empresaId: string) {
    return this.construirRespuestaMural(talentoId, empresaId);
  }

  /**
   * Días seguidos (hasta hoy o ayer, si hoy todavía no envió) con bitácora
   * enviada — los días de ausencia autorizada (permiso/licencia/vacaciones)
   * no rompen la racha, pero tampoco suman. Acotado a `LIMITE_DIAS_RACHA`
   * días hacia atrás para no escanear el historial completo de alguien con
   * años de antigüedad.
   */
  private async calcularRachaDiaria(talentoId: string): Promise<number> {
    const hoy = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
    }).format(new Date());
    const desde = sumarDiasISO(hoy, -LIMITE_DIAS_RACHA);

    const worklogs = await this.prisma.worklog.findMany({
      where: { talentoId, fecha: { gte: new Date(`${desde}T00:00:00.000Z`) } },
      select: { fecha: true, estadoEnvio: true },
    });

    const porFecha = new Map<string, string>();
    for (const w of worklogs) {
      porFecha.set(w.fecha.toISOString().slice(0, 10), w.estadoEnvio);
    }

    const estadoHoy = porFecha.get(hoy);
    let cursor = estadoHoy?.includes('✅') ? hoy : sumarDiasISO(hoy, -1);

    let racha = 0;
    for (let i = 0; i < LIMITE_DIAS_RACHA; i++) {
      const estado = porFecha.get(cursor);
      if (estado?.includes('✅')) {
        racha += 1;
      } else if (!estado || !esAusenciaAutorizada(estado)) {
        break;
      }
      cursor = sumarDiasISO(cursor, -1);
    }

    return racha;
  }

  private async construirRespuestaMural(talentoId: string, empresaId: string) {
    const [talento, empresa, perfil, notas, estampasRecibidas, racha] =
      await Promise.all([
        this.prisma.talento.findUniqueOrThrow({
          where: { id: talentoId },
          select: {
            nombreCompleto: true,
            rol: true,
            departamento: true,
            fotoUrl: true,
            carnetFotoUrl: true,
          },
        }),
        this.prisma.empresa.findUniqueOrThrow({
          where: { id: empresaId },
          select: { logoUrl: true },
        }),
        this.prisma.talentoPerfilMural.findUnique({
          where: { talentoId },
          select: SELECT_PERFIL,
        }),
        this.prisma.muralNotaAdhesiva.findMany({
          where: { talentoId },
          select: SELECT_NOTA,
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.estampaOtorgada.findMany({
          where: { talentoId, enMural: true },
          select: SELECT_ESTAMPA_OTORGADA,
          orderBy: { createdAt: 'asc' },
        }),
        this.calcularRachaDiaria(talentoId),
      ]);

    return {
      perfil: perfil ?? PERFIL_POR_DEFECTO,
      notas: notas.map(serializarNota),
      estampasRecibidas: estampasRecibidas.map(serializarEstampaOtorgada),
      racha,
      talento,
      empresa,
    };
  }

  async actualizarPerfil(actor: Actor, dto: ActualizarPerfilMuralDto) {
    const { talentoId, empresaId } = this.exigirTalentoId(actor);

    return this.prisma.talentoPerfilMural.upsert({
      where: { talentoId },
      create: {
        talentoId,
        empresaId,
        ...(dto.apodo !== undefined && { apodo: dto.apodo.trim() || null }),
        ...(dto.meGusta !== undefined && {
          meGusta: dto.meGusta.trim() || null,
        }),
        ...(dto.noMeGusta !== undefined && {
          noMeGusta: dto.noMeGusta.trim() || null,
        }),
        ...(dto.cancionFavorita !== undefined && {
          cancionFavorita: dto.cancionFavorita.trim() || null,
        }),
        ...(dto.superpoder !== undefined && {
          superpoder: dto.superpoder.trim() || null,
        }),
        ...(dto.personalidades !== undefined && {
          personalidades: limpiarPersonalidades(dto.personalidades),
        }),
        ...(dto.estado !== undefined && { estado: dto.estado.trim() || null }),
        ...(dto.fondoId !== undefined && { fondoId: dto.fondoId }),
      },
      update: {
        ...(dto.apodo !== undefined && { apodo: dto.apodo.trim() || null }),
        ...(dto.meGusta !== undefined && {
          meGusta: dto.meGusta.trim() || null,
        }),
        ...(dto.noMeGusta !== undefined && {
          noMeGusta: dto.noMeGusta.trim() || null,
        }),
        ...(dto.cancionFavorita !== undefined && {
          cancionFavorita: dto.cancionFavorita.trim() || null,
        }),
        ...(dto.superpoder !== undefined && {
          superpoder: dto.superpoder.trim() || null,
        }),
        ...(dto.personalidades !== undefined && {
          personalidades: limpiarPersonalidades(dto.personalidades),
        }),
        ...(dto.estado !== undefined && { estado: dto.estado.trim() || null }),
        ...(dto.fondoId !== undefined && { fondoId: dto.fondoId }),
      },
      select: SELECT_PERFIL,
    });
  }

  async crearNota(actor: Actor, dto: CrearNotaDto) {
    const { talentoId, empresaId } = this.exigirTalentoId(actor);

    const nota = await this.prisma.muralNotaAdhesiva.create({
      data: {
        talentoId,
        empresaId,
        texto: dto.texto.trim(),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.posX !== undefined && { posX: dto.posX }),
        ...(dto.posY !== undefined && { posY: dto.posY }),
      },
      select: SELECT_NOTA,
    });
    return serializarNota(nota);
  }

  /**
   * Un compañero le deja una nota a OTRO talento — a diferencia de
   * `crearNota`, `talentoDestinoId` no sale del actor sino de un parámetro
   * ya validado por el llamador (EmpresasService, igual que
   * `obtenerMuralDeTalento`).
   */
  async crearNotaParaOtro(
    actor: Actor,
    talentoDestinoId: string,
    empresaId: string,
    dto: EnviarNotaDto,
  ) {
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }

    const nota = await this.prisma.muralNotaAdhesiva.create({
      data: {
        talentoId: talentoDestinoId,
        empresaId,
        texto: dto.texto.trim(),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.posX !== undefined && { posX: dto.posX }),
        ...(dto.posY !== undefined && { posY: dto.posY }),
        enviadaPorUsuarioId: actor.usuario.id,
      },
      select: SELECT_NOTA,
    });

    await this.notificaciones.crearPersonal({
      empresaId,
      talentoId: talentoDestinoId,
      tipo: 'NOTA_RECIBIDA',
      titulo: '📝 Nueva nota en tu mural',
      mensaje: `${actor.usuario.nombre} te dejó una nota en tu mural.`,
      enlace: '/mi-mural',
    });

    return serializarNota(nota);
  }

  private async resolverNotaPropia(actor: Actor, notaId: string) {
    const { talentoId } = this.exigirTalentoId(actor);
    const nota = await this.prisma.muralNotaAdhesiva.findUnique({
      where: { id: notaId },
    });
    if (!nota || nota.talentoId !== talentoId) {
      throw new NotFoundException('Nota no encontrada');
    }
    return nota;
  }

  async actualizarNota(actor: Actor, notaId: string, dto: ActualizarNotaDto) {
    await this.resolverNotaPropia(actor, notaId);

    const nota = await this.prisma.muralNotaAdhesiva.update({
      where: { id: notaId },
      data: {
        ...(dto.texto !== undefined && { texto: dto.texto.trim() }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.posX !== undefined && { posX: dto.posX }),
        ...(dto.posY !== undefined && { posY: dto.posY }),
        ...(dto.rotacion !== undefined && { rotacion: dto.rotacion }),
        ...(dto.zIndex !== undefined && { zIndex: dto.zIndex }),
        ...(dto.escala !== undefined && { escala: dto.escala }),
      },
      select: SELECT_NOTA,
    });
    return serializarNota(nota);
  }

  async borrarNota(actor: Actor, notaId: string) {
    await this.resolverNotaPropia(actor, notaId);
    await this.prisma.muralNotaAdhesiva.delete({ where: { id: notaId } });
    return { id: notaId };
  }

  /** Todas las estampas que tiene el propio talento, estén o no visibles en el mural ahora mismo. */
  async listarMisEstampas(actor: Actor) {
    const { talentoId } = this.exigirTalentoId(actor);

    const estampas = await this.prisma.estampaOtorgada.findMany({
      where: { talentoId },
      select: SELECT_ESTAMPA_OTORGADA,
      orderBy: { createdAt: 'desc' },
    });

    return estampas.map(serializarEstampaOtorgada);
  }

  async actualizarPosicionEstampa(
    actor: Actor,
    estampaOtorgadaId: string,
    dto: ActualizarPosicionEstampaDto,
  ) {
    const { talentoId } = this.exigirTalentoId(actor);

    const otorgada = await this.prisma.estampaOtorgada.findUnique({
      where: { id: estampaOtorgadaId },
    });
    if (!otorgada || otorgada.talentoId !== talentoId) {
      throw new NotFoundException('Estampa no encontrada');
    }

    const actualizada = await this.prisma.estampaOtorgada.update({
      where: { id: estampaOtorgadaId },
      data: {
        ...(dto.posX !== undefined && { posX: dto.posX }),
        ...(dto.posY !== undefined && { posY: dto.posY }),
        ...(dto.zIndex !== undefined && { zIndex: dto.zIndex }),
        ...(dto.enMural !== undefined && { enMural: dto.enMural }),
      },
      select: SELECT_ESTAMPA_OTORGADA,
    });

    return serializarEstampaOtorgada(actualizada);
  }
}
