import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { RegistrarWorklogPropioDto } from '../talentos/dto/registrar-worklog-propio.dto';

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

  /** HH:mm en la zona horaria de República Dominicana (sin horario de verano). */
  private horaActualRD(): string {
    return new Intl.DateTimeFormat('es-DO', {
      timeZone: 'America/Santo_Domingo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  }

  /** Fecha de hoy (YYYY-MM-DD) en la zona horaria de República Dominicana. */
  private hoyISO(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
    }).format(new Date());
  }

  private async upsertCheckin(
    empresaId: string,
    talentoId: string,
    dto: Pick<
      CreateCheckinDto,
      'fecha' | 'dia' | 'semana' | 'tareasPlanificadas' | 'horaCheckin'
    >,
  ) {
    const fecha = new Date(dto.fecha);
    return this.prisma.worklog.upsert({
      where: { talentoId_fecha: { talentoId, fecha } },
      create: {
        empresaId,
        talentoId,
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

  private async upsertCheckout(
    empresaId: string,
    talentoId: string,
    dto: Pick<
      CreateCheckoutDto,
      | 'fecha'
      | 'dia'
      | 'semana'
      | 'actividadesRealizadas'
      | 'capacitacion'
      | 'queSeEjecuto'
      | 'detallesRelevantes'
      | 'informeAvances'
      | 'objetivoDia'
      | 'estadoEnvio'
      | 'horaEnvio'
      | 'puntajeIA'
      | 'cumplimientoTareas'
      | 'calificacionCeo'
      | 'notasTix'
    >,
  ) {
    const fecha = new Date(dto.fecha);
    return this.prisma.worklog.upsert({
      where: { talentoId_fecha: { talentoId, fecha } },
      create: {
        empresaId,
        talentoId,
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

  // TODO: filtrar/escribir por empresaId es manual porque todavia no hay RLS en Postgres.
  async checkin(dto: CreateCheckinDto) {
    const { empresa, talento } = await this.resolverTalento(
      dto.empresaSlug,
      dto.talentoNombre,
    );
    return this.upsertCheckin(empresa.id, talento.id, dto);
  }

  async checkout(dto: CreateCheckoutDto) {
    const { empresa, talento } = await this.resolverTalento(
      dto.empresaSlug,
      dto.talentoNombre,
    );
    return this.upsertCheckout(empresa.id, talento.id, dto);
  }

  /**
   * Autoservicio: el talento registra su propio checkin. Fecha y hora se
   * calculan en el servidor (siempre "ahora", nunca lo que mande el cliente)
   * para que no pueda fabricar o alterar bitácoras de otros días.
   */
  async checkinPropio(
    empresaId: string,
    talentoId: string,
    dto: RegistrarWorklogPropioDto,
  ) {
    return this.upsertCheckin(empresaId, talentoId, {
      fecha: this.hoyISO(),
      tareasPlanificadas: dto.tareasPlanificadas ?? '',
      horaCheckin: this.horaActualRD(),
    });
  }

  async checkoutPropio(
    empresaId: string,
    talentoId: string,
    dto: RegistrarWorklogPropioDto,
  ) {
    return this.upsertCheckout(empresaId, talentoId, {
      fecha: this.hoyISO(),
      actividadesRealizadas: dto.actividadesRealizadas,
      capacitacion: dto.capacitacion,
      queSeEjecuto: dto.queSeEjecuto,
      detallesRelevantes: dto.detallesRelevantes,
      informeAvances: dto.informeAvances,
      objetivoDia: dto.objetivoDia,
      estadoEnvio: '✅ Enviada',
      horaEnvio: this.horaActualRD(),
    });
  }
}
