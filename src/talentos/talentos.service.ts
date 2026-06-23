import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarTalentoDto } from './dto/actualizar-talento.dto';

@Injectable()
export class TalentosService {
  constructor(private readonly prisma: PrismaService) {}

  async actualizarEstado(
    talentoId: string,
    codigoAcceso: string | undefined,
    dto: ActualizarTalentoDto,
  ) {
    const talento = await this.prisma.talento.findUnique({
      where: { id: talentoId },
      include: { empresa: true },
    });
    if (!talento) {
      throw new NotFoundException('Empleado no encontrado');
    }
    if (!codigoAcceso || codigoAcceso !== talento.empresa.codigoAcceso) {
      throw new UnauthorizedException('Código de acceso inválido');
    }

    return this.prisma.talento.update({
      where: { id: talentoId },
      data: { estado: dto.estado },
      select: { id: true, nombreCompleto: true, rol: true, estado: true },
    });
  }
}
