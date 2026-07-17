import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { resolverUsuarioPorBearer } from '../supabase-auth.util';
import { Actor, RequestConActor } from '../actor.types';
import { PERMITIR_SIN_ACTIVAR_KEY } from './permitir-sin-activar.decorator';

/**
 * Exige una sesión humana válida (Bearer token de Supabase). Usar en
 * endpoints que solo tiene sentido que llame un usuario logueado (ej.
 * GET /auth/me), a diferencia de CompanyAccessGuard que también acepta
 * el codigoAcceso compartido de ClawLink.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestConActor>();
    const usuario = await resolverUsuarioPorBearer(req, this.prisma);
    if (!usuario) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const permitirSinActivar = this.reflector.getAllAndOverride<boolean>(
      PERMITIR_SIN_ACTIVAR_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!usuario.passwordEstablecida && !permitirSinActivar) {
      throw new ForbiddenException('Debes activar tu cuenta antes de continuar');
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
