import { Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async me(usuario: Usuario) {
    const [empresa, talento] = await Promise.all([
      this.prisma.empresa.findUnique({
        where: { id: usuario.empresaId },
        select: { slug: true, nombre: true },
      }),
      usuario.talentoId
        ? this.prisma.talento.findUnique({
            where: { id: usuario.talentoId },
            select: { fotoUrl: true },
          })
        : null,
    ]);
    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        talentoId: usuario.talentoId,
        fotoUrl: talento?.fotoUrl ?? null,
        passwordEstablecida: usuario.passwordEstablecida,
        departamentoGestionado: usuario.departamentoGestionado,
        departamentosSupervisados: usuario.departamentosSupervisados,
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
