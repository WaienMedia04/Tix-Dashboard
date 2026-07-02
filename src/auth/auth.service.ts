import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validarCodigo(codigo: string) {
    const empresa = await this.prisma.empresa.findFirst({
      where: { codigoAcceso: codigo, activo: true },
      select: { slug: true, nombre: true },
    });

    if (!empresa) {
      throw new UnauthorizedException('Código de acceso inválido');
    }

    return empresa;
  }
}
