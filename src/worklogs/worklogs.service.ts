import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class WorklogsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolverTalento(empresaSlug: string, talentoNombre: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { slug: empresaSlug },
    });
    if (!empresa) {
      throw new NotFoundException(`Empresa "${empresaSlug}" no encontrada`);
    }

    const talento = await this.prisma.talento.findFirst({
      where: {
        empresaId: empresa.id,
        nombreCompleto: {
          equals: talentoNombre.trim(),
          mode: 'insensitive',
        },
      },
    });
    if (!talento) {
      throw new NotFoundException(
        `Talento "${talentoNombre}" no encontrado en la empresa "${empresaSlug}"`,
      );
    }

    return { empresa, talento };
  }

  // TODO: filtrar/escribir por empresaId es manual porque todavia no hay RLS en Postgres.
  async checkin(dto: CreateCheckinDto) {
    const { empresa, talento } = await this.resolverTalento(
      dto.empresaSlug,
      dto.talentoNombre,
    );
    const fecha = new Date(dto.fecha);

    return this.prisma.worklog.upsert({
      where: { talentoId_fecha: { talentoId: talento.id, fecha } },
      create: {
        empresaId: empresa.id,
        talentoId: talento.id,
        fecha,
        dia: dto.dia ?? null,
        semana: dto.semana ?? null,
        tareasPlanificadas: dto.tareasPlanificadas,
        horaCheckin: dto.horaCheckin ?? null,
        checkinEnviado: true,
        estadoEnvio: '⏳ Pendiente',
      },
      update: {
        tareasPlanificadas: dto.tareasPlanificadas,
        horaCheckin: dto.horaCheckin ?? null,
        checkinEnviado: true,
        ...(dto.dia !== undefined && { dia: dto.dia }),
        ...(dto.semana !== undefined && { semana: dto.semana }),
      },
    });
  }

  async checkout(dto: CreateCheckoutDto) {
    const { empresa, talento } = await this.resolverTalento(
      dto.empresaSlug,
      dto.talentoNombre,
    );
    const fecha = new Date(dto.fecha);

    return this.prisma.worklog.upsert({
      where: { talentoId_fecha: { talentoId: talento.id, fecha } },
      create: {
        empresaId: empresa.id,
        talentoId: talento.id,
        fecha,
        dia: dto.dia ?? null,
        semana: dto.semana ?? null,
        checkinEnviado: false,
        actividadesRealizadas: dto.actividadesRealizadas ?? null,
        capacitacion: dto.capacitacion ?? null,
        queSeEjecuto: dto.queSeEjecuto ?? null,
        detallesRelevantes: dto.detallesRelevantes ?? null,
        informeAvances: dto.informeAvances ?? null,
        objetivoDia: dto.objetivoDia ?? null,
        estadoEnvio: dto.estadoEnvio ?? '✅ Enviada',
        horaEnvio: dto.horaEnvio ?? null,
        puntajeIA: dto.puntajeIA ?? null,
        cumplimientoTareas: dto.cumplimientoTareas ?? null,
        calificacionCeo: dto.calificacionCeo ?? null,
        notasTix: dto.notasTix ?? null,
      },
      update: {
        ...(dto.dia !== undefined && { dia: dto.dia }),
        ...(dto.semana !== undefined && { semana: dto.semana }),
        actividadesRealizadas: dto.actividadesRealizadas ?? null,
        capacitacion: dto.capacitacion ?? null,
        queSeEjecuto: dto.queSeEjecuto ?? null,
        detallesRelevantes: dto.detallesRelevantes ?? null,
        informeAvances: dto.informeAvances ?? null,
        objetivoDia: dto.objetivoDia ?? null,
        estadoEnvio: dto.estadoEnvio ?? '✅ Enviada',
        horaEnvio: dto.horaEnvio ?? null,
        puntajeIA: dto.puntajeIA ?? null,
        cumplimientoTareas: dto.cumplimientoTareas ?? null,
        calificacionCeo: dto.calificacionCeo ?? null,
        notasTix: dto.notasTix ?? null,
      },
    });
  }
}
