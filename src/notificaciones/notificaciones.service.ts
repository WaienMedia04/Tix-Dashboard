import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';

const LIMITE_LISTADO = 50;

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolverEmpresa(slug: string, actor: Actor) {
    const empresa = await this.prisma.empresa.findUnique({ where: { slug } });
    if (!empresa || empresa.id !== actor.empresaId) {
      throw new NotFoundException(`Empresa "${slug}" no encontrada`);
    }
    return empresa;
  }

  /** Solo usuarios humanos tienen bandeja de notificaciones (necesitan un id para el estado de lectura). */
  private exigirUsuario(actor: Actor) {
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }
    return actor.usuario;
  }

  /** Condición de visibilidad: personales del propio talento, o avisos generales para su rol. */
  private whereVisible(
    empresaId: string,
    talentoId: string | null,
    rol: Rol,
  ): Prisma.NotificacionWhereInput {
    const condiciones: Prisma.NotificacionWhereInput[] = [
      { personal: false, rolesDestino: { isEmpty: true } },
      { personal: false, rolesDestino: { has: rol } },
    ];
    if (talentoId) {
      condiciones.push({ personal: true, talentoId });
    }
    return { empresaId, OR: condiciones };
  }

  /**
   * Genera (si no existen todavía) las notificaciones de "hoy es el
   * cumpleaños de X" para los talentos activos que cumplen años hoy.
   * Idempotente: se puede llamar en cada listado/contador sin duplicar.
   */
  private async asegurarCumpleanosDeHoy(empresaId: string): Promise<void> {
    const hoyISO = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
    }).format(new Date());
    const [, mesHoyStr, diaHoyStr] = hoyISO.split('-');
    const mesHoy = Number(mesHoyStr);
    const diaHoy = Number(diaHoyStr);
    const inicioDeHoy = new Date(`${hoyISO}T00:00:00.000-04:00`);

    const cumpleaneros = await this.prisma.talento.findMany({
      where: { empresaId, estado: 'activo', fechaNacimiento: { not: null } },
      select: { id: true, nombreCompleto: true, fechaNacimiento: true },
    });

    const deHoy = cumpleaneros.filter(
      (t) =>
        t.fechaNacimiento!.getUTCMonth() + 1 === mesHoy &&
        t.fechaNacimiento!.getUTCDate() === diaHoy,
    );
    if (deHoy.length === 0) return;

    const yaCreadas = await this.prisma.notificacion.findMany({
      where: {
        empresaId,
        tipo: 'CUMPLEANOS',
        talentoId: { in: deHoy.map((t) => t.id) },
        createdAt: { gte: inicioDeHoy },
      },
      select: { talentoId: true },
    });
    const idsConNotificacion = new Set(yaCreadas.map((n) => n.talentoId));
    const faltantes = deHoy.filter((t) => !idsConNotificacion.has(t.id));
    if (faltantes.length === 0) return;

    await this.prisma.notificacion.createMany({
      data: faltantes.map((t) => ({
        empresaId,
        tipo: 'CUMPLEANOS' as const,
        titulo: '🎂 Cumpleaños',
        mensaje: `¡Hoy es el cumpleaños de ${t.nombreCompleto}!`,
        personal: false,
        rolesDestino: [],
        talentoId: t.id,
        enlace: '/cumpleanos',
      })),
    });
  }

  async listar(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresa = await this.resolverEmpresa(slug, actor);
    await this.asegurarCumpleanosDeHoy(empresa.id);

    const notificaciones = await this.prisma.notificacion.findMany({
      where: this.whereVisible(empresa.id, usuario.talentoId, usuario.rol),
      orderBy: { createdAt: 'desc' },
      take: LIMITE_LISTADO,
      include: {
        lecturas: { where: { usuarioId: usuario.id }, select: { id: true } },
      },
    });

    return notificaciones.map((n) => ({
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      enlace: n.enlace,
      createdAt: n.createdAt,
      leida: n.lecturas.length > 0,
    }));
  }

  async contador(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresa = await this.resolverEmpresa(slug, actor);
    await this.asegurarCumpleanosDeHoy(empresa.id);

    const noLeidas = await this.prisma.notificacion.count({
      where: {
        ...this.whereVisible(empresa.id, usuario.talentoId, usuario.rol),
        lecturas: { none: { usuarioId: usuario.id } },
      },
    });

    return { noLeidas };
  }

  async marcarLeida(slug: string, actor: Actor, id: string) {
    const usuario = this.exigirUsuario(actor);
    const empresa = await this.resolverEmpresa(slug, actor);

    const notificacion = await this.prisma.notificacion.findFirst({
      where: {
        id,
        ...this.whereVisible(empresa.id, usuario.talentoId, usuario.rol),
      },
      select: { id: true },
    });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    await this.prisma.notificacionLectura.upsert({
      where: {
        notificacionId_usuarioId: { notificacionId: id, usuarioId: usuario.id },
      },
      create: { notificacionId: id, usuarioId: usuario.id },
      update: {},
    });

    return { ok: true };
  }

  async marcarTodasLeidas(slug: string, actor: Actor) {
    const usuario = this.exigirUsuario(actor);
    const empresa = await this.resolverEmpresa(slug, actor);

    const pendientes = await this.prisma.notificacion.findMany({
      where: {
        ...this.whereVisible(empresa.id, usuario.talentoId, usuario.rol),
        lecturas: { none: { usuarioId: usuario.id } },
      },
      select: { id: true },
    });
    if (pendientes.length === 0) return { ok: true };

    await this.prisma.notificacionLectura.createMany({
      data: pendientes.map((n) => ({
        notificacionId: n.id,
        usuarioId: usuario.id,
      })),
      skipDuplicates: true,
    });

    return { ok: true };
  }

  /** Notificación personal — solo la ve el talento que la recibe (ej. estampa regalada). */
  async crearPersonal(params: {
    empresaId: string;
    talentoId: string;
    tipo: 'ESTAMPA_RECIBIDA';
    titulo: string;
    mensaje: string;
    enlace?: string;
  }) {
    await this.prisma.notificacion.create({
      data: {
        empresaId: params.empresaId,
        talentoId: params.talentoId,
        tipo: params.tipo,
        titulo: params.titulo,
        mensaje: params.mensaje,
        enlace: params.enlace,
        personal: true,
        rolesDestino: [],
      },
    });
  }

  /** Aviso general — lo ve cualquiera con uno de `roles` (vacío = todos los roles). */
  async crearBroadcast(params: {
    empresaId: string;
    tipo: 'AUSENCIA_REGISTRADA' | 'NOVEDAD_PUBLICADA' | 'CV_LISTO_PARA_REVISAR';
    titulo: string;
    mensaje: string;
    roles: Rol[];
    talentoId?: string;
    enlace?: string;
  }) {
    await this.prisma.notificacion.create({
      data: {
        empresaId: params.empresaId,
        talentoId: params.talentoId,
        tipo: params.tipo,
        titulo: params.titulo,
        mensaje: params.mensaje,
        enlace: params.enlace,
        personal: false,
        rolesDestino: params.roles,
      },
    });
  }
}
