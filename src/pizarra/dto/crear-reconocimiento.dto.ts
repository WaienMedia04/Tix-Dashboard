import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearReconocimientoDto {
  @IsString()
  @IsNotEmpty()
  talentoId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  titulo!: string;

  @IsString()
  @IsOptional()
  @MaxLength(280)
  descripcion?: string;
}
