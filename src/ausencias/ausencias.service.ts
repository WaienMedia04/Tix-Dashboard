import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TipoAusencia } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/actor.types';
import { talentoScopeWhere } from '../auth/talento-scope.util';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CrearAusenciaDto } from './dto/crear-ausencia.dto';
import { AusenciasQueryDto } from './dto/ausencias-query.dto';

const MARCADOR_AUSENCIA: Record<TipoAusencia, string> = {
  PERMISO: '📋 Permiso autorizado',
  LICENCIA_MEDICA: 'Licencia médica',
  VACACIONES: '🌴 Vacaciones',
};

const RANGO_MAXIMO_DIAS = 90;

const SELECT_AUSENCIA = {
  id: true,
  talentoId: true,
  tipo: true,
  fechaInicio: true,
  fechaFin: true,
  motivo: true,
  createdAt: true,
  talento: { select: { nombreCompleto: true, fotoUrl: true } },
  creadoPor: { select: { nombre: true } },
} as const;

function serializar(ausencia: {
  id: string;
  talentoId: string;
  tipo: TipoAusencia;
  fechaInicio: Date;
  fechaFin: Date;
  motivo: string | null;
  createdAt: Date;
  talento: { nombreCompleto: string; fotoUrl: string | null };
  creadoPor: { nombre: string };
}) {
  return {
    id: ausencia.id,
    talentoId: ausencia.talentoId,
    nombreCompleto: ausencia.talento.nombreCompleto,
    fotoUrl: ausencia.talento.fotoUrl,
    tipo: ausencia.tipo,
    fechaInicio: ausencia.fechaInicio,
    fechaFin: ausencia.fechaFin,
    motivo: ausencia.motivo,
    creadoPorNombre: ausencia.creadoPor.nombre,
    createdAt: ausencia.createdAt,
  };
}

/** Enumera cada fecha (UTC, medianoche) entre inicio y fin, ambos inclusive. */
function enumerarFechas(inicio: Date, fin: Date): Date[] {
  const fechas: Date[] = [];
  const cursor = new Date(inicio);
  while (cursor <= fin) {
    fechas.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return fechas;
}

@Injectable()
export class AusenciasService {
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

  async listar(slug: string, actor: Actor, query: AusenciasQueryDto) {
    const empresa = await this.resolverEmpresa(slug, actor);

    const ausencias = await this.prisma.ausencia.findMany({
      where: {
        empresaId: empresa.id,
        talento: talentoScopeWhere(actor),
        ...(query.talentoId && { talentoId: query.talentoId }),
      },
      select: SELECT_AUSENCIA,
      orderBy: { fechaInicio: 'desc' },
    });

    return ausencias.map(serializar);
  }

  async crear(slug: string, actor: Actor, dto: CrearAusenciaDto) {
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

    const fechaInicio = new Date(`${dto.fechaInicio}T00:00:00.000Z`);
    const fechaFin = new Date(`${dto.fechaFin}T00:00:00.000Z`);
    if (fechaFin < fechaInicio) {
      throw new BadRequestException(
        'fechaFin no puede ser anterior a fechaInicio',
      );
    }
    const dias = enumerarFechas(fechaInicio, fechaFin);
    if (dias.length > RANGO_MAXIMO_DIAS) {
      throw new BadRequestException(
        `El rango no puede superar ${RANGO_MAXIMO_DIAS} días`,
      );
    }

    const marcador = MARCADOR_AUSENCIA[dto.tipo];
    const fechasOmitidas: string[] = [];

    for (const fecha of dias) {
      const existente = await this.prisma.worklog.findUnique({
        where: { talentoId_fecha: { talentoId: talento.id, fecha } },
      });
      if (existente) {
        fechasOmitidas.push(fecha.toISOString().slice(0, 10));
        continue;
      }
      await this.prisma.worklog.create({
        data: {
          empresaId: empresa.id,
          talentoId: talento.id,
          fecha,
          checkinEnviado: false,
          estadoEnvio: marcador,
        },
      });
    }

    const ausencia = await this.prisma.ausencia.create({
      data: {
        empresaId: empresa.id,
        talentoId: dto.talentoId,
        tipo: dto.tipo,
        fechaInicio,
        fechaFin,
        motivo: dto.motivo?.trim() || null,
        creadoPorUsuarioId: actor.usuario.id,
      },
      select: SELECT_AUSENCIA,
    });

    await this.notificaciones.crearBroadcast({
      empresaId: empresa.id,
      tipo: 'AUSENCIA_REGISTRADA',
      titulo: '📋 Ausencia registrada',
      mensaje: `${MARCADOR_AUSENCIA[dto.tipo]}: ${talento.nombreCompleto}`,
      roles: ['CEO', 'RRHH'],
      talentoId: talento.id,
      enlace: '/empleados',
    });

    return { ausencia: serializar(ausencia), fechasOmitidas };
  }
}
