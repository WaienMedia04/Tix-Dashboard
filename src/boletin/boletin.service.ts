import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { CrearBoletinDto } from './dto/crear-boletin.dto';
import { ActualizarBoletinDto } from './dto/actualizar-boletin.dto';

const LIMITE_BOLETINES = 20;

const SELECT_BOLETIN = {
  id: true,
  tipo: true,
  titulo: true,
  contenido: true,
  imagenUrl: true,
  fechaEvento: true,
  createdAt: true,
  updatedAt: true,
  creadoPor: { select: { id: true, nombre: true } },
} as const;

/**
 * Mural informativo (noticias/eventos/blog) de la empresa — de una sola
 * vía: cualquier usuario puede leerlo, pero solo CEO/RRHH puede publicar,
 * editar o borrar.
 */
@Injectable()
export class BoletinService {
  constructor(private readonly prisma: PrismaService) {}

  private exigirUsuario(actor: Actor) {
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }
    return actor.usuario;
  }

  private exigirModerador(usuario: { rol: string }) {
    if (usuario.rol !== 'CEO' && usuario.rol !== 'RRHH') {
      throw new ForbiddenException('Solo CEO/RRHH pueden hacer esto');
    }
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

  private mapear(b: {
    id: string;
    tipo: string;
    titulo: string;
    contenido: string;
    imagenUrl: string | null;
    fechaEvento: Date | null;
    createdAt: Date;
    updatedAt: Date;
    creadoPor: { id: string; nombre: string };
  }) {
    return {
      id: b.id,
      tipo: b.tipo,
      titulo: b.titulo,
      contenido: b.contenido,
      imagenUrl: b.imagenUrl,
      fechaEvento: b.fechaEvento,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      autorNombre: b.creadoPor.nombre,
    };
  }

  async listar(
    slug: string,
    actor: Actor,
    opts: { cursorId?: string; limit?: number },
  ) {
    this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    const limit = Math.min(Math.max(opts.limit ?? LIMITE_BOLETINES, 1), 50);

    let cursorFecha: Date | undefined;
    if (opts.cursorId) {
      const referencia = await this.prisma.boletin.findUnique({
        where: { id: opts.cursorId },
        select: { createdAt: true },
      });
      if (referencia) cursorFecha = referencia.createdAt;
    }

    const boletines = await this.prisma.boletin.findMany({
      where: {
        empresaId,
        ...(cursorFecha ? { createdAt: { lt: cursorFecha } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: SELECT_BOLETIN,
    });

    return {
      data: boletines.map((b) => this.mapear(b)),
      hayMas: boletines.length === limit,
    };
  }

  /**
   * Resumen del día para el mural informativo: quién está de vacaciones,
   * con permiso o licencia médica hoy, y quién cumple años hoy. Se calcula
   * al vuelo (no se persiste) y se combina en el frontend con las
   * publicaciones reales de CEO/RRHH.
   */
  async hoy(slug: string, actor: Actor) {
    this.exigirUsuario(actor);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const hoyISO = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
    }).format(new Date());
    const hoy = new Date(`${hoyISO}T00:00:00.000Z`);
    const [, mesHoyStr, diaHoyStr] = hoyISO.split('-');
    const mesHoy = Number(mesHoyStr);
    const diaHoy = Number(diaHoyStr);

    const [ausencias, talentos] = await Promise.all([
      this.prisma.ausencia.findMany({
        where: {
          empresaId,
          fechaInicio: { lte: hoy },
          fechaFin: { gte: hoy },
        },
        select: {
          tipo: true,
          fechaFin: true,
          talento: {
            select: {
              id: true,
              nombreCompleto: true,
              fotoUrl: true,
              departamento: true,
            },
          },
        },
        orderBy: { fechaFin: 'asc' },
      }),
      this.prisma.talento.findMany({
        where: { empresaId, estado: 'activo', fechaNacimiento: { not: null } },
        select: {
          id: true,
          nombreCompleto: true,
          fotoUrl: true,
          departamento: true,
          fechaNacimiento: true,
        },
      }),
    ]);

    const cumpleanos = talentos
      .filter(
        (t) =>
          t.fechaNacimiento!.getUTCMonth() + 1 === mesHoy &&
          t.fechaNacimiento!.getUTCDate() === diaHoy,
      )
      .map((t) => ({
        talentoId: t.id,
        nombreCompleto: t.nombreCompleto,
        fotoUrl: t.fotoUrl,
        departamento: t.departamento,
      }));

    return {
      ausencias: ausencias.map((a) => ({
        talentoId: a.talento.id,
        nombreCompleto: a.talento.nombreCompleto,
        fotoUrl: a.talento.fotoUrl,
        departamento: a.talento.departamento,
        tipo: a.tipo,
        fechaFin: a.fechaFin,
      })),
      cumpleanos,
    };
  }

  async crear(slug: string, actor: Actor, dto: CrearBoletinDto) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresaId = await this.resolverEmpresaId(slug, actor);

    const boletin = await this.prisma.boletin.create({
      data: {
        empresaId,
        tipo: dto.tipo,
        titulo: dto.titulo.trim(),
        contenido: dto.contenido.trim(),
        imagenUrl: dto.imagenUrl ?? null,
        fechaEvento: dto.fechaEvento ? new Date(dto.fechaEvento) : null,
        creadoPorUsuarioId: usuario.id,
      },
      select: SELECT_BOLETIN,
    });

    return this.mapear(boletin);
  }

  private async exigirBoletin(id: string, empresaId: string) {
    const boletin = await this.prisma.boletin.findFirst({
      where: { id, empresaId },
    });
    if (!boletin) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return boletin;
  }

  async actualizar(
    slug: string,
    actor: Actor,
    id: string,
    dto: ActualizarBoletinDto,
  ) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    await this.exigirBoletin(id, empresaId);

    const boletin = await this.prisma.boletin.update({
      where: { id },
      data: {
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.contenido !== undefined && { contenido: dto.contenido.trim() }),
        ...(dto.imagenUrl !== undefined && { imagenUrl: dto.imagenUrl }),
        ...(dto.fechaEvento !== undefined && {
          fechaEvento: new Date(dto.fechaEvento),
        }),
      },
      select: SELECT_BOLETIN,
    });

    return this.mapear(boletin);
  }

  async borrar(slug: string, actor: Actor, id: string) {
    const usuario = this.exigirUsuario(actor);
    this.exigirModerador(usuario);
    const empresaId = await this.resolverEmpresaId(slug, actor);
    await this.exigirBoletin(id, empresaId);

    await this.prisma.boletin.delete({ where: { id } });
    return { ok: true };
  }
}
