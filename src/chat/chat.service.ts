import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { CrearConversacionDto } from './dto/crear-conversacion.dto';
import { EnviarMensajeDto } from './dto/enviar-mensaje.dto';
import { AgregarParticipantesDto } from './dto/agregar-participantes.dto';

const LIMITE_MENSAJES = 50;

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /** El chat es solo para cuentas humanas (CEO/RRHH/Manager/Talento) — nunca para el tráfico de servicio de ClawLink. */
  private exigirUsuario(actor: Actor) {
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }
    return actor.usuario;
  }

  private async resolverEmpresaId(slug: string, actor: Actor): Promise<string> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!empresa || empresa.id !== actor.empresaId) {
      throw new NotFoundException(`Empresa "${slug}" no encontrada`);
    }
    return empresa.id;
  }

  private async exigirParticipante(
    conversacionId: string,
    usuarioId: string,
    empresaId: string,
  ) {
    const participante = await this.prisma.chatParticipante.findFirst({
      where: { conversacionId, usuarioId, conversacion: { empresaId } },
      include: { conversacion: true },
    });
    if (!participante) {
      throw new NotFoundException('Conversación no encontrada');
    }
    return participante;
  }

  private async contarNoLeidos(
    conversacionId: string,
    usuarioId: string,
    desde: Date | null,
  ): Promise<{ noLeidos: number; tieneChismeSinLeer: boolean }> {
    const mensajes = await this.prisma.chatMensaje.findMany({
      where: {
        conversacionId,
        autorUsuarioId: { not: usuarioId },
        ...(desde ? { createdAt: { gt: desde } } : {}),
      },
      select: { esChisme: true },
    });
    return {
      noLeidos: mensajes.length,
      tieneChismeSinLeer: mensajes.some((m) => m.esChisme),
    };
  }

  /** Devuelve una conversación ya mapeada a la forma que consume el frontend, desde el punto de vista de `usuarioId`. */
  private async mapearParaUsuario(conversacionId: string, usuarioId: string) {
    const conv = await this.prisma.chatConversacion.findUniqueOrThrow({
      where: { id: conversacionId },
      include: {
        participantes: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                rol: true,
                talento: { select: { fotoUrl: true } },
              },
            },
          },
        },
        mensajes: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const miParticipacion =
      conv.participantes.find((p) => p.usuarioId === usuarioId) ?? null;
    const { noLeidos, tieneChismeSinLeer } = await this.contarNoLeidos(
      conv.id,
      usuarioId,
      miParticipacion?.ultimaLecturaAt ?? null,
    );
    const otros = conv.participantes.filter((p) => p.usuarioId !== usuarioId);
    const ultimoMensaje = conv.mensajes[0] ?? null;

    return {
      id: conv.id,
      esGrupo: conv.esGrupo,
      nombre: conv.esGrupo
        ? conv.nombre
        : (otros[0]?.usuario.nombre ?? conv.nombre),
      fotoUrl: conv.esGrupo
        ? null
        : (otros[0]?.usuario.talento?.fotoUrl ?? null),
      participantes: conv.participantes.map((p) => ({
        id: p.usuario.id,
        nombre: p.usuario.nombre,
        rol: p.usuario.rol,
        fotoUrl: p.usuario.talento?.fotoUrl ?? null,
      })),
      ultimoMensaje: ultimoMensaje
        ? {
            texto: ultimoMensaje.texto,
            esChisme: ultimoMensaje.esChisme,
            autorUsuarioId: ultimoMensaje.autorUsuarioId,
            createdAt: ultimoMensaje.createdAt,
          }
        : null,
      noLeidos,
      tieneChismeSinLeer,
      createdAt: conv.createdAt,
    };
  }

  /** Compañeros de la empresa con los que se puede iniciar un chat o armar un grupo. */
  async directorio(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const usuarios = await this.prisma.usuario.findMany({
      where: { empresaId, activo: true, id: { not: usuario.id } },
      select: {
        id: true,
        nombre: true,
        rol: true,
        talento: { select: { fotoUrl: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    return usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      rol: u.rol,
      fotoUrl: u.talento?.fotoUrl ?? null,
    }));
  }

  async listarConversaciones(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const participaciones = await this.prisma.chatParticipante.findMany({
      where: { usuarioId: usuario.id, conversacion: { empresaId } },
      include: {
        conversacion: {
          include: {
            participantes: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    rol: true,
                    talento: { select: { fotoUrl: true } },
                  },
                },
              },
            },
            mensajes: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    const resultado = await Promise.all(
      participaciones.map(async (p) => {
        const conv = p.conversacion;
        const { noLeidos, tieneChismeSinLeer } = await this.contarNoLeidos(
          conv.id,
          usuario.id,
          p.ultimaLecturaAt,
        );
        const otros = conv.participantes.filter(
          (x) => x.usuarioId !== usuario.id,
        );
        const ultimoMensaje = conv.mensajes[0] ?? null;

        return {
          id: conv.id,
          esGrupo: conv.esGrupo,
          nombre: conv.esGrupo
            ? conv.nombre
            : (otros[0]?.usuario.nombre ?? conv.nombre),
          fotoUrl: conv.esGrupo
            ? null
            : (otros[0]?.usuario.talento?.fotoUrl ?? null),
          participantes: conv.participantes.map((x) => ({
            id: x.usuario.id,
            nombre: x.usuario.nombre,
            rol: x.usuario.rol,
            fotoUrl: x.usuario.talento?.fotoUrl ?? null,
          })),
          ultimoMensaje: ultimoMensaje
            ? {
                texto: ultimoMensaje.texto,
                esChisme: ultimoMensaje.esChisme,
                autorUsuarioId: ultimoMensaje.autorUsuarioId,
                createdAt: ultimoMensaje.createdAt,
              }
            : null,
          noLeidos,
          tieneChismeSinLeer,
          createdAt: conv.createdAt,
        };
      }),
    );

    resultado.sort((a, b) => {
      const fechaA = a.ultimoMensaje?.createdAt ?? a.createdAt;
      const fechaB = b.ultimoMensaje?.createdAt ?? b.createdAt;
      return new Date(fechaB).getTime() - new Date(fechaA).getTime();
    });
    return resultado;
  }

  /** Payload liviano para el botón flotante: solo lo que necesita para el contador y el parpadeo de chisme. */
  async resumen(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const participaciones = await this.prisma.chatParticipante.findMany({
      where: { usuarioId: usuario.id, conversacion: { empresaId } },
      select: { conversacionId: true, ultimaLecturaAt: true },
    });

    let noLeidosTotal = 0;
    let hayChismeSinLeer = false;
    await Promise.all(
      participaciones.map(async (p) => {
        const { noLeidos, tieneChismeSinLeer } = await this.contarNoLeidos(
          p.conversacionId,
          usuario.id,
          p.ultimaLecturaAt,
        );
        noLeidosTotal += noLeidos;
        if (tieneChismeSinLeer) hayChismeSinLeer = true;
      }),
    );

    return { noLeidosTotal, hayChismeSinLeer };
  }

  async crearConversacion(
    slug: string,
    actor: Actor,
    dto: CrearConversacionDto,
  ) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const idsUnicos = Array.from(new Set(dto.participanteIds)).filter(
      (id) => id !== usuario.id,
    );
    if (idsUnicos.length === 0) {
      throw new BadRequestException(
        'Selecciona al menos un compañero para iniciar el chat',
      );
    }

    const participantesValidos = await this.prisma.usuario.findMany({
      where: { id: { in: idsUnicos }, empresaId, activo: true },
      select: { id: true },
    });
    if (participantesValidos.length !== idsUnicos.length) {
      throw new NotFoundException(
        'Uno o más participantes no fueron encontrados',
      );
    }

    const esGrupo = dto.esGrupo === true || idsUnicos.length > 1;

    if (esGrupo) {
      if (!dto.nombre?.trim()) {
        throw new BadRequestException('Los grupos necesitan un nombre');
      }
      const conversacion = await this.prisma.chatConversacion.create({
        data: {
          empresaId,
          esGrupo: true,
          nombre: dto.nombre.trim(),
          creadoPorUsuarioId: usuario.id,
          participantes: {
            create: [usuario.id, ...idsUnicos].map((id) => ({ usuarioId: id })),
          },
        },
      });
      return this.mapearParaUsuario(conversacion.id, usuario.id);
    }

    // Chat 1 a 1: si ya existe, lo reutiliza en vez de crear un duplicado.
    const existente = await this.prisma.chatConversacion.findFirst({
      where: {
        empresaId,
        esGrupo: false,
        AND: [
          { participantes: { some: { usuarioId: usuario.id } } },
          { participantes: { some: { usuarioId: idsUnicos[0] } } },
        ],
      },
      select: { id: true, participantes: { select: { usuarioId: true } } },
    });
    if (existente && existente.participantes.length === 2) {
      return this.mapearParaUsuario(existente.id, usuario.id);
    }

    const conversacion = await this.prisma.chatConversacion.create({
      data: {
        empresaId,
        esGrupo: false,
        creadoPorUsuarioId: usuario.id,
        participantes: {
          create: [usuario.id, idsUnicos[0]].map((id) => ({ usuarioId: id })),
        },
      },
    });
    return this.mapearParaUsuario(conversacion.id, usuario.id);
  }

  async listarMensajes(
    slug: string,
    actor: Actor,
    conversacionId: string,
    opts: { antesDeId?: string; limit?: number },
  ) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const participante = await this.exigirParticipante(
      conversacionId,
      usuario.id,
      empresaId,
    );

    const limit = Math.min(Math.max(opts.limit ?? LIMITE_MENSAJES, 1), 100);
    let cursor: Date | null = null;
    if (opts.antesDeId) {
      const referencia = await this.prisma.chatMensaje.findUnique({
        where: { id: opts.antesDeId },
        select: { createdAt: true, conversacionId: true },
      });
      if (referencia && referencia.conversacionId === conversacionId) {
        cursor = referencia.createdAt;
      }
    }

    const mensajes = await this.prisma.chatMensaje.findMany({
      where: {
        conversacionId,
        ...(cursor ? { createdAt: { lt: cursor } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            talento: { select: { fotoUrl: true } },
          },
        },
      },
    });

    // Solo marca como leído cuando se pide la página más reciente (sin cursor de "antes de").
    if (!opts.antesDeId) {
      await this.prisma.chatParticipante.update({
        where: { id: participante.id },
        data: { ultimaLecturaAt: new Date() },
      });
    }

    return {
      data: mensajes
        .slice()
        .reverse()
        .map((m) => ({
          id: m.id,
          texto: m.texto,
          esChisme: m.esChisme,
          autorUsuarioId: m.autorUsuarioId,
          autorNombre: m.autor.nombre,
          autorFotoUrl: m.autor.talento?.fotoUrl ?? null,
          propio: m.autorUsuarioId === usuario.id,
          createdAt: m.createdAt,
        })),
      hayMas: mensajes.length === limit,
    };
  }

  async enviarMensaje(
    slug: string,
    actor: Actor,
    conversacionId: string,
    dto: EnviarMensajeDto,
  ) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    await this.exigirParticipante(conversacionId, usuario.id, empresaId);

    const mensaje = await this.prisma.chatMensaje.create({
      data: {
        conversacionId,
        autorUsuarioId: usuario.id,
        texto: dto.texto.trim(),
        esChisme: dto.esChisme === true,
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            talento: { select: { fotoUrl: true } },
          },
        },
      },
    });

    return {
      id: mensaje.id,
      texto: mensaje.texto,
      esChisme: mensaje.esChisme,
      autorUsuarioId: mensaje.autorUsuarioId,
      autorNombre: mensaje.autor.nombre,
      autorFotoUrl: mensaje.autor.talento?.fotoUrl ?? null,
      propio: true,
      createdAt: mensaje.createdAt,
    };
  }

  async agregarParticipantes(
    slug: string,
    actor: Actor,
    conversacionId: string,
    dto: AgregarParticipantesDto,
  ) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const participante = await this.exigirParticipante(
      conversacionId,
      usuario.id,
      empresaId,
    );

    if (!participante.conversacion.esGrupo) {
      throw new BadRequestException(
        'Solo se pueden agregar participantes a un grupo',
      );
    }

    const idsUnicos = Array.from(new Set(dto.participanteIds));
    const validos = await this.prisma.usuario.findMany({
      where: { id: { in: idsUnicos }, empresaId, activo: true },
      select: { id: true },
    });
    if (validos.length !== idsUnicos.length) {
      throw new NotFoundException(
        'Uno o más participantes no fueron encontrados',
      );
    }

    await this.prisma.chatParticipante.createMany({
      data: idsUnicos.map((id) => ({ conversacionId, usuarioId: id })),
      skipDuplicates: true,
    });

    return this.mapearParaUsuario(conversacionId, usuario.id);
  }

  /**
   * "Eliminar chat" / "Salir del grupo": ambos casos son lo mismo por
   * debajo — borrar la fila de ChatParticipante de este usuario. En un 1 a 1
   * eso saca la conversación de su lista sin afectar al otro participante
   * (si ambos la eliminan, no queda nadie apuntando a ella, así que se borra
   * la conversación entera — cascada se lleva los mensajes con ella).
   */
  async eliminarConversacion(
    slug: string,
    actor: Actor,
    conversacionId: string,
  ) {
    const usuario = this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const participante = await this.exigirParticipante(
      conversacionId,
      usuario.id,
      empresaId,
    );

    await this.prisma.chatParticipante.delete({
      where: { id: participante.id },
    });

    const participantesRestantes = await this.prisma.chatParticipante.count({
      where: { conversacionId },
    });
    if (participantesRestantes === 0) {
      await this.prisma.chatConversacion.delete({
        where: { id: conversacionId },
      });
    }

    return { ok: true };
  }
}
