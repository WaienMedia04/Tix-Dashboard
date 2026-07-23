import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearTimeCapsulaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  mensaje!: string;

  /** Debe ser una fecha futura — se valida en el servicio. */
  @IsDateString()
  fechaApertura!: string;
}
