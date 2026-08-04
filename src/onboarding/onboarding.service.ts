import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSolicitudImplementacionDto } from './dto/crear-solicitud-implementacion.dto';
import { ActualizarEstadoSolicitudDto } from './dto/actualizar-estado-solicitud.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearSolicitudImplementacionDto) {
    return this.prisma.solicitudImplementacion.create({
      data: {
        ...dto,
        encargadosPorDepartamento:
          dto.encargadosPorDepartamento as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async listarAdmin() {
    return this.prisma.solicitudImplementacion.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        estado: true,
        empresaNombre: true,
        contactoNombre: true,
        contactoCorreo: true,
        createdAt: true,
      },
    });
  }

  async obtenerAdmin(id: string) {
    const solicitud = await this.prisma.solicitudImplementacion.findUnique({
      where: { id },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return solicitud;
  }

  async actualizarEstadoAdmin(id: string, dto: ActualizarEstadoSolicitudDto) {
    await this.obtenerAdmin(id);
    return this.prisma.solicitudImplementacion.update({
      where: { id },
      data: { estado: dto.estado },
    });
  }
}
