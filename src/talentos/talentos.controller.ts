import { Body, Controller, Headers, Param, Put, Query } from '@nestjs/common';
import { TalentosService } from './talentos.service';
import { ActualizarTalentoDto } from './dto/actualizar-talento.dto';

@Controller('talentos')
export class TalentosController {
  constructor(private readonly talentosService: TalentosService) {}

  @Put(':talentoId')
  actualizarEstado(
    @Param('talentoId') talentoId: string,
    @Body() dto: ActualizarTalentoDto,
    @Query('codigoAcceso') codigoAccesoQuery: string | undefined,
    @Headers('x-codigo-acceso') codigoAccesoHeader: string | undefined,
  ) {
    return this.talentosService.actualizarEstado(
      talentoId,
      codigoAccesoQuery ?? codigoAccesoHeader,
      dto,
    );
  }
}
