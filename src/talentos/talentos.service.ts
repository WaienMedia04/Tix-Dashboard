import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarTalentoDto } from './dto/actualizar-talento.dto';
import { ActualizarFotoDto } from './dto/actualizar-foto.dto';
import { ActualizarCarnetDto } from './dto/actualizar-carnet.dto';
import { ActualizarCvDto } from './dto/actualizar-cv.dto';
import { ActualizarCvDatosDto } from './dto/actualizar-cv-datos.dto';
import {
  RegistrarWorklogPropioDto,
  TipoRegistroWorklog,
} from './dto/registrar-worklog-propio.dto';
import { Actor } from '../auth/actor.types';
import { CvExtractionService, type CvExtraido } from './cv-extraction.service';
import { WorklogsService } from '../worklogs/worklogs.service';

@Injectable()
export class TalentosService {
  private readonly logger = new Logger(TalentosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cvExtraction: CvExtractionService,
    private readonly worklogs: WorklogsService,
  ) {}

  private async resolverTalento(talentoId: string, actor: Actor) {
    // La autorización (¿pertenece este talento a la empresa del actor?) ya
    // la resolvió CompanyAccessGuard — si llegamos aquí es porque coincide.
    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
    });
    if (!talento || talento.empresaId !== actor.empresaId) {
      throw new NotFoundException('Empleado no encontrado');
    }
    return talento;
  }

  /** Actualiza cualquier subconjunto de los campos editables del talento. */
  async actualizarEstado(
    talentoId: string,
    actor: Actor,
    dto: ActualizarTalentoDto,
  ) {
    await this.resolverTalento(talentoId, actor);

    return this.prisma.talento.update({
      where: { id: talentoId },
      data: {
        ...(dto.estado !== undefined && { estado: dto.estado }),
        ...(dto.rol !== undefined && { rol: dto.rol.trim() }),
        ...(dto.apellido !== undefined && {
          apellido: dto.apellido.trim() || null,
        }),
        ...(dto.departamento !== undefined && {
          departamento: dto.departamento.trim() || null,
        }),
        ...(dto.cedula !== undefined && { cedula: dto.cedula.trim() || null }),
        ...(dto.correo !== undefined && { correo: dto.correo.trim() || null }),
        ...(dto.telefono !== undefined && {
          telefono: dto.telefono.trim() || null,
        }),
        ...(dto.fechaIngreso !== undefined && {
          fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : null,
        }),
      },
      select: {
        id: true,
        nombreCompleto: true,
        apellido: true,
        rol: true,
        departamento: true,
        estado: true,
        cedula: true,
        correo: true,
        telefono: true,
        fechaIngreso: true,
        fotoUrl: true,
      },
    });
  }

  async actualizarFoto(
    talentoId: string,
    actor: Actor,
    dto: ActualizarFotoDto,
  ) {
    await this.resolverTalento(talentoId, actor);

    return this.prisma.talento.update({
      where: { id: talentoId },
      data: { fotoUrl: dto.fotoUrl },
      select: { id: true, nombreCompleto: true, fotoUrl: true },
    });
  }

  /** Imagen de carnet para la cara frontal del Lanyard — opcional, distinta de fotoUrl. */
  async actualizarCarnet(
    talentoId: string,
    actor: Actor,
    dto: ActualizarCarnetDto,
  ) {
    await this.resolverTalento(talentoId, actor);

    return this.prisma.talento.update({
      where: { id: talentoId },
      data: {
        carnetFotoUrl:
          dto.carnetFotoUrl === undefined ? null : dto.carnetFotoUrl,
      },
      select: { id: true, nombreCompleto: true, carnetFotoUrl: true },
    });
  }

  /**
   * Persiste la URL del CV y dispara la extracción con IA en el mismo
   * request (a esta escala, unos segundos de espera son aceptables — no
   * hace falta una cola). Si la extracción falla, el CV igual queda
   * guardado; cvDatosExtraidos se deja en null para que la UI de revisión
   * (fase Configuración) muestre "revisar manualmente".
   */
  async actualizarCv(talentoId: string, actor: Actor, dto: ActualizarCvDto) {
    await this.resolverTalento(talentoId, actor);

    const extraido = await this.cvExtraction.extraerDesdeUrl(dto.cvUrl);
    if (!extraido) {
      this.logger.warn(
        `Extracción de CV no disponible para talento ${talentoId}`,
      );
    }

    return this.prisma.talento.update({
      where: { id: talentoId },
      data: { cvUrl: dto.cvUrl, cvDatosExtraidos: extraido ?? Prisma.JsonNull },
      select: {
        id: true,
        nombreCompleto: true,
        cvUrl: true,
        cvDatosExtraidos: true,
      },
    });
  }

  /**
   * Corrección manual de los datos ya extraídos — no vuelve a leer el PDF
   * ni a llamar a la IA, solo aplica los campos que RRHH decidió corregir
   * sobre el cvDatosExtraidos existente.
   */
  async actualizarCvDatos(
    talentoId: string,
    actor: Actor,
    dto: ActualizarCvDatosDto,
  ) {
    const talento = await this.resolverTalento(talentoId, actor);
    const actual = talento.cvDatosExtraidos as CvExtraido | null;
    if (!actual) {
      throw new NotFoundException(
        'Este talento todavía no tiene datos de CV extraídos',
      );
    }

    const actualizado: CvExtraido = {
      ...actual,
      resumenParaRRHH: dto.resumenParaRRHH ?? actual.resumenParaRRHH,
      habilidades: dto.habilidades ?? actual.habilidades,
      contacto: {
        correo: dto.correo ?? actual.contacto.correo,
        telefono: dto.telefono ?? actual.contacto.telefono,
      },
    };

    return this.prisma.talento.update({
      where: { id: talentoId },
      data: { cvDatosExtraidos: actualizado },
      select: {
        id: true,
        nombreCompleto: true,
        cvUrl: true,
        cvDatosExtraidos: true,
      },
    });
  }

  /**
   * Autoservicio: un usuario con rol TALENTO registra su propia bitácora
   * de hoy. RolesGuard ya garantiza el rol; aquí solo falta el talentoId
   * (siempre debería existir para un TALENTO, pero se valida por si acaso).
   */
  async registrarWorklogPropio(actor: Actor, dto: RegistrarWorklogPropioDto) {
    if (actor.type !== 'usuario' || !actor.usuario.talentoId) {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de talento',
      );
    }
    if (
      dto.tipo === TipoRegistroWorklog.CHECKIN &&
      !dto.tareasPlanificadas?.trim()
    ) {
      throw new BadRequestException(
        'tareasPlanificadas es requerido para el check-in',
      );
    }

    const { empresaId } = actor;
    const talentoId = actor.usuario.talentoId;

    if (dto.tipo === TipoRegistroWorklog.CHECKIN) {
      return this.worklogs.checkinPropio(empresaId, talentoId, dto);
    }
    return this.worklogs.checkoutPropio(empresaId, talentoId, dto);
  }
}
