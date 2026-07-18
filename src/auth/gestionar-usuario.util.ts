import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { obtenerClienteAnon, obtenerClienteServiceRole } from './supabase-auth.util';

function resolverOrigenDashboard(): string {
  const origen = (process.env.CORS_ORIGIN ?? '').split(',')[0]?.trim();
  if (!origen) {
    throw new InternalServerErrorException(
      'CORS_ORIGIN no está configurado; no se puede armar el link',
    );
  }
  return origen;
}

/**
 * Corrige el correo de un Usuario ya existente — en Supabase (fuente de
 * verdad para el login) y en Neon (para que quede consistente en toda la
 * app). email_confirm: true porque quien hace esto es un admin/CEO/RRHH
 * corrigiendo un dato, no la propia persona reconfirmando su correo.
 */
export async function cambiarCorreoUsuario(
  prisma: PrismaService,
  usuarioId: string,
  nuevoCorreo: string,
) {
  const email = nuevoCorreo.trim().toLowerCase();

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }
  if (usuario.email === email) {
    return { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol };
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new ConflictException('Ya existe un usuario con ese correo');
  }

  const { error } = await obtenerClienteServiceRole().auth.admin.updateUserById(
    usuario.supabaseUserId,
    { email, email_confirm: true },
  );
  if (error) {
    throw new ConflictException(`No se pudo actualizar el correo: ${error.message}`);
  }

  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { email },
    select: { id: true, email: true, nombre: true, rol: true },
  });
}

/**
 * Envía el correo de restablecimiento de contraseña de Supabase — el
 * mismo mecanismo que "¿Olvidaste tu contraseña?" en el login, pero
 * disparado por un admin/CEO/RRHH en nombre del usuario.
 */
export async function enviarResetPassword(prisma: PrismaService, usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }

  const origenDashboard = resolverOrigenDashboard();
  const { error } = await obtenerClienteAnon().auth.resetPasswordForEmail(usuario.email, {
    redirectTo: `${origenDashboard}/auth/confirm`,
  });
  if (error) {
    throw new ConflictException(`No se pudo enviar el restablecimiento: ${error.message}`);
  }

  return { ok: true };
}

/**
 * Cambia el rol de un Usuario. CEO/RRHH nunca llevan talentoId (no son
 * empleados en seguimiento — ver talentoScopeWhere), así que al mover a
 * cualquiera de esos dos roles se desvincula automáticamente. TALENTO sí
 * lo exige: si el usuario no tenía uno ya, hay que indicar a cuál se
 * vincula.
 */
export async function cambiarRolUsuario(
  prisma: PrismaService,
  usuarioId: string,
  rol: Rol,
  talentoId?: string,
) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }

  if (rol === 'CEO' || rol === 'RRHH') {
    return prisma.usuario.update({
      where: { id: usuarioId },
      data: { rol, talentoId: null },
      select: { id: true, email: true, nombre: true, rol: true, talentoId: true },
    });
  }

  const talentoIdFinal = talentoId ?? usuario.talentoId ?? undefined;

  if (rol === 'TALENTO' && !talentoIdFinal) {
    throw new ConflictException('talentoId es obligatorio para el rol TALENTO');
  }

  if (talentoIdFinal) {
    const talento = await prisma.talento.findUnique({ where: { id: talentoIdFinal } });
    if (!talento || talento.empresaId !== usuario.empresaId) {
      throw new NotFoundException('Empleado no encontrado');
    }
    const otroUsuario = await prisma.usuario.findUnique({ where: { talentoId: talentoIdFinal } });
    if (otroUsuario && otroUsuario.id !== usuarioId) {
      throw new ConflictException('Ese talento ya tiene un acceso de login vinculado');
    }
  }

  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { rol, talentoId: rol === 'TALENTO' ? talentoIdFinal : (talentoId ?? usuario.talentoId) },
    select: { id: true, email: true, nombre: true, rol: true, talentoId: true },
  });
}
