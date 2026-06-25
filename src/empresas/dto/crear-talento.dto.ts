import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearTalentoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombreCompleto!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  rol!: string;
}
