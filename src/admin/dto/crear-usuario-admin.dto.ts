import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Rol } from '@prisma/client';

export class CrearUsuarioAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsIn(['CEO', 'RRHH', 'MANAGER', 'TALENTO'])
  rol!: Rol;

  @IsString()
  @IsOptional()
  talentoId?: string;

  /** Si se omite, se genera una temporal aleatoria y se devuelve una sola vez. */
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
