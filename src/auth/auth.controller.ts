import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SessionGuard } from './guards/session.guard';
import type { RequestConActor } from './actor.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto.email, dto.password, req, res);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() req: RequestConActor) {
    // SessionGuard solo deja pasar cuando ya resolvió actor.type === 'usuario'.
    const actor = req.actor as Extract<
      RequestConActor['actor'],
      { type: 'usuario' }
    >;
    return this.authService.me(actor.usuario);
  }

  @Post('logout')
  @UseGuards(SessionGuard)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }
}
