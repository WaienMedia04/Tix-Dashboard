import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { obtenerClienteServiceRole } from './supabase-auth.util';

/**
 * Crea el Usuario y le envía la invitación por correo vía Supabase Auth —
 * la persona fija su propia contraseña desde el link recibido, nunca la
 * conocemos en texto plano. Usada tanto por el panel admin (ADMIN_TOKEN)
 * como por el flujo dentro del panel para que CEO/RRHH inviten a su propio
 * talento; ambos comparten exactamente esta lógica.
 */
export async function invitarUsuario(
  prisma: PrismaService,
  params: {
    empresaId: string;
    email: string;
    nombre: string;
    rol: Rol;
    talentoId?: string;
    departamentoGestionado?: string;
  },
) {
  const email = params.email.trim().toLowerCase();

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new ConflictException('Ya existe un usuario con ese correo');
  }

  const origenDashboard = (process.env.CORS_ORIGIN ?? '').split(',')[0]?.trim();
  if (!origenDashboard) {
    throw new InternalServerErrorException(
      'CORS_ORIGIN no está configurado; no se puede armar el link de invitación',
    );
  }

  const { data, error } =
    await obtenerClienteServiceRole().auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origenDashboard}/auth/confirm`,
      data: { nombre: params.nombre.trim(), rol: params.rol },
    });
  if (error || !data?.user) {
    const detalle =
      error?.message && error.message !== '{}'
        ? error.message
        : `error ${error?.status ?? 'desconocido'} de Supabase — probablemente cupo de correos agotado o un problema temporal del proveedor`;
    throw new ConflictException(`No se pudo enviar la invitación: ${detalle}`);
  }

  return prisma.usuario.create({
    data: {
      empresaId: params.empresaId,
      email,
      nombre: params.nombre.trim(),
      rol: params.rol,
      talentoId: params.talentoId,
      departamentoGestionado:
        params.rol === 'MANAGER' ? params.departamentoGestionado : undefined,
      supabaseUserId: data.user.id,
    },
    select: {
      id: true,
      email: true,
      nombre: true,
      rol: true,
      departamentoGestionado: true,
    },
  });
}
