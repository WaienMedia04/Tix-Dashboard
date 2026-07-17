import { Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async me(usuario: Usuario) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: usuario.empresaId },
      select: { slug: true, nombre: true },
    });
    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        talentoId: usuario.talentoId,
      },
      empresa,
    };
  }
}
