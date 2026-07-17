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
        passwordEstablecida: usuario.passwordEstablecida,
      },
      empresa,
    };
  }

  /**
   * Se llama justo después de que el frontend confirma que Supabase ya
   * aceptó la nueva contraseña (updateUser({password})). A partir de acá
   * el usuario deja de estar forzado a /activar-cuenta.
   */
  async activar(usuario: Usuario) {
    if (usuario.passwordEstablecida) {
      return { ok: true };
    }
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { passwordEstablecida: true, ultimoLoginAt: new Date() },
    });
    return { ok: true };
  }
}
