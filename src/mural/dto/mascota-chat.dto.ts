import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class MensajeHistorialMascotaDto {
  @IsIn(['usuario', 'mascota'])
  rol!: 'usuario' | 'mascota';

  @IsString()
  @MaxLength(1000)
  texto!: string;
}

export class MascotaChatDto {
  @IsString()
  @MaxLength(500)
  mensaje!: string;

  /** Últimos turnos de la conversación (el frontend no persiste historial en el servidor). */
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => MensajeHistorialMascotaDto)
  historial?: MensajeHistorialMascotaDto[];
}
