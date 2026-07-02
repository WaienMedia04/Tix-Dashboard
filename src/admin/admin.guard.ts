import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const token = req.headers['x-admin-token'];
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
      throw new UnauthorizedException('Acceso de administrador requerido');
    }
    return true;
  }
}
