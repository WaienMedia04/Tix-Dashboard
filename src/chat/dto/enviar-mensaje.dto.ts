import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class EnviarMensajeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  texto!: string;

  /** Si es true, el mensaje se marca como "chisme": se destaca en el hilo y hace parpadear el botón flotante de los demás participantes. */
  @IsBoolean()
  @IsOptional()
  esChisme?: boolean;
}
