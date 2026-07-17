import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { resolverUsuarioPorBearer } from '../clerk-auth.util';
import { Actor, RequestConActor } from '../actor.types';

/**
 * Exige una sesión humana válida (Authorization: Bearer <token de Clerk>).
 * Usar en endpoints que solo tiene sentido que llame un usuario logueado
 * (ej. GET /auth/me), a diferencia de CompanyAccessGuard que también acepta
 * el codigoAcceso compartido de ClawLink.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestConActor>();
    const usuario = await resolverUsuarioPorBearer(req, this.prisma);
    if (!usuario) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
    const actor: Actor = {
      type: 'usuario',
      usuario,
      empresaId: usuario.empresaId,
    };
    req.actor = actor;
    return true;
  }
}
