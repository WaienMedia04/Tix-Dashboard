import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearVacanteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(6000)
  descripcion!: string;

  @IsString()
  @IsOptional()
  departamento?: string;
}
