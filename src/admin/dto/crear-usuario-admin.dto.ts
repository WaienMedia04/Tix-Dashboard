import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Rol } from '@prisma/client';

export class CrearUsuarioAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsIn(['CEO', 'RRHH', 'GERENTE_GENERAL', 'MANAGER', 'TALENTO'])
  rol!: Rol;

  @IsString()
  @IsOptional()
  talentoId?: string;
}
