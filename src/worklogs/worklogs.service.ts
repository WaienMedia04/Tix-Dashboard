import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorklogDto } from './dto/create-worklog.dto';

@Injectable()
export class WorklogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorklogDto) {
    const empresa = await this.prisma.empresa.findUnique({ where: { slug: dto.empresaSlug } });
    if (!empresa) {
      throw new NotFoundException(`Empresa "${dto.empresaSlug}" no encontrada`);
    }

    const talento = await this.prisma.talento.findFirst({
      where: {
        empresaId: empresa.id,
        nombreCompleto: { equals: dto.talentoNombre.trim(), mode: 'insensitive' },
      },
    });
    if (!talento) {
      throw new NotFoundException(
        `Talento "${dto.talentoNombre}" no encontrado en la empresa "${dto.empresaSlug}"`,
      );
    }

    // TODO: filtrar/escribir por empresaId es manual porque todavia no hay RLS en Postgres.
    return this.prisma.worklog.create({
      data: {
        empresaId: empresa.id,
        talentoId: talento.id,
        fecha: new Date(dto.fecha),
        dia: dto.dia ?? null,
        semana: dto.semana ?? null,
        actividadesRealizadas: dto.actividadesRealizadas ?? null,
        capacitacion: dto.capacitacion ?? null,
        queSeEjecuto: dto.queSeEjecuto ?? null,
        detallesRelevantes: dto.detallesRelevantes ?? null,
        informeAvances: dto.informeAvances ?? null,
        objetivoDia: dto.objetivoDia ?? null,
        estadoEnvio: dto.estadoEnvio ?? '✅ Enviada',
        horaEnvio: dto.horaEnvio ?? null,
        puntajeIA: dto.puntajeIA ?? null,
        calificacionCeo: dto.calificacionCeo ?? null,
        notasTix: dto.notasTix ?? null,
      },
    });
  }
}
