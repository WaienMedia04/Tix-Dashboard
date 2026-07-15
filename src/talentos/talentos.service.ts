import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarTalentoDto } from './dto/actualizar-talento.dto';
import { ActualizarFotoDto } from './dto/actualizar-foto.dto';
import { ActualizarCvDto } from './dto/actualizar-cv.dto';
import { Actor } from '../auth/actor.types';
import { CvExtractionService } from './cv-extraction.service';

@Injectable()
export class TalentosService {
  private readonly logger = new Logger(TalentosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cvExtraction: CvExtractionService,
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

  async actualizarEstado(
    talentoId: string,
    actor: Actor,
    dto: ActualizarTalentoDto,
  ) {
    await this.resolverTalento(talentoId, actor);

    return this.prisma.talento.update({
      where: { id: talentoId },
      data: { estado: dto.estado },
      select: { id: true, nombreCompleto: true, rol: true, estado: true },
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
}
