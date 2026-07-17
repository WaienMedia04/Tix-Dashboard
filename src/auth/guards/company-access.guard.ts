import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { resolverUsuarioPorBearer } from '../clerk-auth.util';
import { Actor, RequestConActor } from '../actor.types';

/**
 * Autoriza tráfico contra una empresa de dos formas, en este orden:
 *  1. Sesión humana (Authorization: Bearer <token de Clerk>, dashboard) —
 *     si es válida, exige que el usuario pertenezca a la empresa objetivo.
 *  2. codigoAcceso compartido, vía query param o header x-codigo-acceso —
 *     el mecanismo de siempre, usado por ClawLink y por cualquier request
 *     humana que todavía no haya migrado a sesión. Se comporta EXACTAMENTE
 *     igual que la validación manual que reemplaza.
 *
 * Resuelve la empresa objetivo desde `:slug` o, si no existe ese param,
 * desde `:talentoId` (para endpoints que operan directo sobre un talento).
 * Deja `req.actor` y, cuando vino por talentoId, `req.talento` ya cargado.
 */
@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestConActor>();
    const params = req.params as Record<string, string | undefined>;

    let empresa: { id: string; codigoAcceso: string } | null = null;

    if (params.slug) {
      empresa = await this.prisma.empresa.findUnique({
        where: { slug: params.slug },
        select: { id: true, codigoAcceso: true },
      });
      if (!empresa) {
        throw new NotFoundException(`Empresa "${params.slug}" no encontrada`);
      }
    } else if (params.talentoId) {
      const talento = await this.prisma.talento.findUnique({
        where: { id: params.talentoId },
        include: { empresa: { select: { id: true, codigoAcceso: true } } },
      });
      if (!talento) {
        throw new NotFoundException('Empleado no encontrado');
      }
      empresa = talento.empresa;
      req.talento = talento;
    } else {
      throw new UnauthorizedException();
    }

    const usuario = await resolverUsuarioPorBearer(req, this.prisma);
    if (usuario) {
      if (usuario.empresaId !== empresa.id) {
        throw new UnauthorizedException();
      }
      const actor: Actor = { type: 'usuario', usuario, empresaId: empresa.id };
      req.actor = actor;
      return true;
    }

    const codigo = (req.query?.codigoAcceso ??
      req.headers?.['x-codigo-acceso']) as string | undefined;
    if (codigo && codigo === empresa.codigoAcceso) {
      const actor: Actor = { type: 'servicio', empresaId: empresa.id };
      req.actor = actor;
      return true;
    }

    throw new UnauthorizedException('Código de acceso inválido');
  }
}
