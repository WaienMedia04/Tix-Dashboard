import {
  IsArray,
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
export type RolInvitableDesdeEmpresa =
  | 'TALENTO'
  | 'MANAGER'
  | 'GERENTE_GENERAL';

export class CrearUsuarioEmpresaDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsIn(['TALENTO', 'MANAGER', 'GERENTE_GENERAL'])
  rol!: RolInvitableDesdeEmpresa;

  @IsString()
  @IsOptional()
  talentoId?: string;

  /** Solo tiene efecto cuando rol es MANAGER. */
  @IsString()
  @IsOptional()
  departamentoGestionado?: string;

  /** Solo tiene efecto cuando rol es GERENTE_GENERAL. */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  departamentosSupervisados?: string[];
}
