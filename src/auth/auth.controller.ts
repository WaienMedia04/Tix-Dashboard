import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AccesoDto } from './dto/acceso.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('acceso')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  acceso(@Body() dto: AccesoDto) {
    return this.authService.validarCodigo(dto.codigo);
  }
}
