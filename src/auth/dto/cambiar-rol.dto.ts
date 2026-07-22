import { IsIn, IsOptional, IsString } from 'class-validator';
import { Rol } from '@prisma/client';

export class CambiarRolDto {
  @IsIn(['CEO', 'RRHH', 'GERENTE_GENERAL', 'MANAGER', 'TALENTO'])
  rol!: Rol;

  @IsString()
  @IsOptional()
  talentoId?: string;
}
