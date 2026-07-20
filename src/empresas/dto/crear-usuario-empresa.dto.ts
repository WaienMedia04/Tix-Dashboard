import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Roles que CEO/RRHH pueden invitar directamente desde el panel (a
 * diferencia del panel admin, que además permite dar de alta CEO/RRHH).
 */
export type RolInvitableDesdeEmpresa = 'TALENTO' | 'MANAGER';

export class CrearUsuarioEmpresaDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsIn(['TALENTO', 'MANAGER'])
  rol!: RolInvitableDesdeEmpresa;

  @IsString()
  @IsOptional()
  talentoId?: string;
}
