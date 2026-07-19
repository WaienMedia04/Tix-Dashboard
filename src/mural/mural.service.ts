import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { ActualizarPerfilMuralDto } from './dto/actualizar-perfil-mural.dto';
import { CrearNotaDto } from './dto/crear-nota.dto';
import { ActualizarNotaDto } from './dto/actualizar-nota.dto';
import { ActualizarPosicionEstampaDto } from './dto/actualizar-posicion-estampa.dto';

const SELECT_PERFIL = {
  apodo: true,
  meGusta: true,
  noMeGusta: true,
  cancionFavorita: true,
  superpoder: true,
  fondoId: true,
} as const;

const PERFIL_POR_DEFECTO = {
  apodo: null,
  meGusta: null,
  noMeGusta: null,
  cancionFavorita: null,
  superpoder: null,
  fondoId: 'aurora',
};

const SELECT_NOTA = {
  id: true,
  texto: true,
  color: true,
  posX: true,
  posY: true,
  rotacion: true,
  zIndex: true,
} as const;

const SELECT_ESTAMPA_OTORGADA = {
  id: true,
  mensaje: true,
  posX: true,
  posY: true,
  zIndex: true,
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
  constructor(private readonly prisma: PrismaService) {}

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

  private async construirRespuestaMural(talentoId: string, empresaId: string) {
    const [talento, empresa, perfil, notas, estampasRecibidas] =
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
          where: { talentoId },
          select: SELECT_ESTAMPA_OTORGADA,
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    return {
      perfil: perfil ?? PERFIL_POR_DEFECTO,
      notas,
      estampasRecibidas: estampasRecibidas.map(serializarEstampaOtorgada),
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
        ...(dto.fondoId !== undefined && { fondoId: dto.fondoId }),
      },
      select: SELECT_PERFIL,
    });
  }

  async crearNota(actor: Actor, dto: CrearNotaDto) {
    const { talentoId, empresaId } = this.exigirTalentoId(actor);

    return this.prisma.muralNotaAdhesiva.create({
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

    return this.prisma.muralNotaAdhesiva.update({
      where: { id: notaId },
      data: {
        ...(dto.texto !== undefined && { texto: dto.texto.trim() }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.posX !== undefined && { posX: dto.posX }),
        ...(dto.posY !== undefined && { posY: dto.posY }),
        ...(dto.rotacion !== undefined && { rotacion: dto.rotacion }),
        ...(dto.zIndex !== undefined && { zIndex: dto.zIndex }),
      },
      select: SELECT_NOTA,
    });
  }

  async borrarNota(actor: Actor, notaId: string) {
    await this.resolverNotaPropia(actor, notaId);
    await this.prisma.muralNotaAdhesiva.delete({ where: { id: notaId } });
    return { id: notaId };
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
      },
      select: SELECT_ESTAMPA_OTORGADA,
    });

    return serializarEstampaOtorgada(actualizada);
  }
}
