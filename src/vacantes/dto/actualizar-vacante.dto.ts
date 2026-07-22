import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EstadoVacante } from '@prisma/client';

export class ActualizarVacanteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(6000)
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsEnum(EstadoVacante)
  @IsOptional()
  estado?: EstadoVacante;
}
