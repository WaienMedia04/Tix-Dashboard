import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { Actor } from '../actor.types';

/**
 * Debe ir DESPUÉS de un guard que resuelva req.actor (CompanyAccessGuard o
 * SessionGuard). Si el endpoint no tiene @Roles(...), no restringe nada.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesPermitidos || rolesPermitidos.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ actor?: Actor }>();
    const actor = req.actor;
    if (!actor) return false;

    // El tráfico de servicio (ClawLink) nunca tuvo rol y siempre tuvo acceso
    // completo por codigoAcceso — no se le empieza a exigir uno ahora.
    if (actor.type === 'servicio') return true;

    if (!rolesPermitidos.includes(actor.usuario.rol)) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }
    return true;
  }
}
