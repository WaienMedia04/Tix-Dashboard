import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TipoNovedad } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { talentoScopeWhere } from '../auth/talento-scope.util';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CrearNovedadDto } from './dto/crear-novedad.dto';
import { NovedadesQueryDto } from './dto/novedades-query.dto';

const ETIQUETA_NOVEDAD: Record<TipoNovedad, string> = {
  LOGRO: '🏆 Logro',
  BUENA_ACCION: '💛 Buena acción',
  AUSENCIA: 'Ausencia',
  ERROR: '⚠️ Error',
  SITUACION: 'Situación',
};

const SELECT_NOVEDAD = {
  id: true,
  talentoId: true,
  tipo: true,
  fecha: true,
  descripcion: true,
  createdAt: true,
  talento: { select: { nombreCompleto: true, fotoUrl: true } },
  creadoPor: { select: { nombre: true } },
} as const;

function serializar(novedad: {
  id: string;
  talentoId: string;
  tipo: string;
  fecha: Date;
  descripcion: string;
  createdAt: Date;
  talento: { nombreCompleto: string; fotoUrl: string | null };
  creadoPor: { nombre: string };
}) {
  return {
    id: novedad.id,
    talentoId: novedad.talentoId,
    nombreCompleto: novedad.talento.nombreCompleto,
    fotoUrl: novedad.talento.fotoUrl,
    tipo: novedad.tipo,
    fecha: novedad.fecha,
    descripcion: novedad.descripcion,
    creadoPorNombre: novedad.creadoPor.nombre,
    createdAt: novedad.createdAt,
  };
}

@Injectable()
export class NovedadesService {
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

  async listar(slug: string, actor: Actor, query: NovedadesQueryDto) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const novedades = await this.prisma.novedad.findMany({
      where: {
        empresaId: empresa.id,
        talento: talentoScopeWhere(actor),
        ...(query.talentoId && { talentoId: query.talentoId }),
        ...(query.tipo && { tipo: query.tipo }),
      },
      select: SELECT_NOVEDAD,
      orderBy: { fecha: 'desc' },
    });

    return novedades.map(serializar);
  }

  async crear(slug: string, actor: Actor, dto: CrearNovedadDto) {
    const empresa = await this.resolverEmpresa(slug, actor);
    if (actor.type !== 'usuario') {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de usuario',
      );
    }

    const talento = await this.prisma.talento.findUnique({
      where: { id: dto.talentoId },
    });
    if (!talento || talento.empresaId !== empresa.id) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const novedad = await this.prisma.novedad.create({
      data: {
        empresaId: empresa.id,
        talentoId: dto.talentoId,
        tipo: dto.tipo,
        fecha: new Date(dto.fecha),
        descripcion: dto.descripcion.trim(),
        creadoPorUsuarioId: actor.usuario.id,
      },
      select: SELECT_NOVEDAD,
    });

    await this.notificaciones.crearBroadcast({
      empresaId: empresa.id,
      tipo: 'NOVEDAD_PUBLICADA',
      titulo: 'Nueva novedad',
      mensaje: `${ETIQUETA_NOVEDAD[dto.tipo]}: ${talento.nombreCompleto}`,
      roles: ['CEO', 'RRHH'],
      talentoId: talento.id,
      enlace: '/novedades',
    });

    return serializar(novedad);
  }
}
