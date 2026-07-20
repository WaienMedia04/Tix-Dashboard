import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CrearEstampaDefinicionDto } from './dto/crear-estampa-definicion.dto';
import { ActualizarEstampaDefinicionDto } from './dto/actualizar-estampa-definicion.dto';
import { OtorgarEstampaDto } from './dto/otorgar-estampa.dto';

const SELECT_ESTAMPA_DEFINICION = {
  id: true,
  nombre: true,
  imagenUrl: true,
  forma: true,
  activo: true,
  createdAt: true,
  creadoPor: { select: { nombre: true } },
} as const;

function serializar(definicion: {
  id: string;
  nombre: string;
  imagenUrl: string;
  forma: string;
  activo: boolean;
  createdAt: Date;
  creadoPor: { nombre: string };
}) {
  return {
    id: definicion.id,
    nombre: definicion.nombre,
    imagenUrl: definicion.imagenUrl,
    forma: definicion.forma,
    activo: definicion.activo,
    creadoPorNombre: definicion.creadoPor.nombre,
    createdAt: definicion.createdAt,
  };
}

@Injectable()
export class EstampasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  private async resolverEmpresa(slug: string, actor: Actor) {
    const empresa = await this.prisma.empresa.findUnique({ where: { slug } });
    if (!empresa || empresa.id !== actor.empresaId) {
      throw new NotFoundException(`Empresa "${slug}" no encontrada`);
    }
    return empresa;
  }

  async listar(slug: string, actor: Actor) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const definiciones = await this.prisma.estampaDefinicion.findMany({
      where: { empresaId: empresa.id },
      select: SELECT_ESTAMPA_DEFINICION,
      orderBy: { createdAt: 'desc' },
    });

    return definiciones.map(serializar);
  }

  async crear(slug: string, actor: Actor, dto: CrearEstampaDefinicionDto) {
    const empresa = await this.resolverEmpresa(slug, actor);
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }

    const definicion = await this.prisma.estampaDefinicion.create({
      data: {
        empresaId: empresa.id,
        nombre: dto.nombre.trim(),
        imagenUrl: dto.imagenUrl,
        forma: dto.forma,
        creadoPorUsuarioId: actor.usuario.id,
      },
      select: SELECT_ESTAMPA_DEFINICION,
    });

    return serializar(definicion);
  }

  async actualizar(
    slug: string,
    actor: Actor,
    id: string,
    dto: ActualizarEstampaDefinicionDto,
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const definicion = await this.prisma.estampaDefinicion.findUnique({
      where: { id },
    });
    if (!definicion || definicion.empresaId !== empresa.id) {
      throw new NotFoundException('Estampa no encontrada');
    }

    const actualizada = await this.prisma.estampaDefinicion.update({
      where: { id },
      data: {
        ...(dto.activo !== undefined && { activo: dto.activo }),
      },
      select: SELECT_ESTAMPA_DEFINICION,
    });

    return serializar(actualizada);
  }

  async eliminar(slug: string, actor: Actor, id: string) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const definicion = await this.prisma.estampaDefinicion.findUnique({
      where: { id },
    });
    if (!definicion || definicion.empresaId !== empresa.id) {
      throw new NotFoundException('Estampa no encontrada');
    }

    // Cascade en el schema: al borrar la definición se borran también todas
    // las EstampaOtorgada asociadas (desaparece del mural de quien la tenía).
    await this.prisma.estampaDefinicion.delete({ where: { id } });

    return { id };
  }

  async otorgar(
    slug: string,
    actor: Actor,
    id: string,
    dto: OtorgarEstampaDto,
  ) {
    const empresa = await this.resolverEmpresa(slug, actor);
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }

    const definicion = await this.prisma.estampaDefinicion.findUnique({
      where: { id },
    });
    if (!definicion || definicion.empresaId !== empresa.id) {
      throw new NotFoundException('Estampa no encontrada');
    }

    const talentoIds = [...new Set(dto.talentoIds)];
    const talentos = await this.prisma.talento.findMany({
      where: { id: { in: talentoIds }, empresaId: empresa.id },
      select: { id: true },
    });
    if (talentos.length !== talentoIds.length) {
      throw new NotFoundException('Uno o más empleados no fueron encontrados');
    }

    const mensaje = dto.mensaje?.trim() || null;
    await this.prisma.estampaOtorgada.createMany({
      data: talentoIds.map((talentoId) => ({
        empresaId: empresa.id,
        talentoId,
        estampaDefinicionId: id,
        otorgadoPorUsuarioId: actor.usuario.id,
        mensaje,
      })),
    });

    await this.notificaciones.crearPersonalMasivo({
      empresaId: empresa.id,
      talentoIds,
      tipo: 'ESTAMPA_RECIBIDA',
      titulo: '🎁 Nueva estampa',
      mensaje: `¡Te regalaron la estampa "${definicion.nombre}"!`,
      enlace: '/mi-mural',
    });

    return { otorgadas: talentoIds.length };
  }
}
