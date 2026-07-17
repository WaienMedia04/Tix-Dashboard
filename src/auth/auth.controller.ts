import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionGuard } from './guards/session.guard';
import { PermitirSinActivar } from './guards/permitir-sin-activar.decorator';
import type { RequestConActor } from './actor.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @PermitirSinActivar()
  @UseGuards(SessionGuard)
  me(@Req() req: RequestConActor) {
    // SessionGuard solo deja pasar cuando ya resolvió actor.type === 'usuario'.
    const actor = req.actor as Extract<
      RequestConActor['actor'],
      { type: 'usuario' }
    >;
    return this.authService.me(actor.usuario);
  }

  @Post('activar')
  @PermitirSinActivar()
  @UseGuards(SessionGuard)
  activar(@Req() req: RequestConActor) {
    const actor = req.actor as Extract<
      RequestConActor['actor'],
      { type: 'usuario' }
    >;
    return this.authService.activar(actor.usuario);
  }
}
