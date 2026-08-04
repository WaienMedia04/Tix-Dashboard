import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class EncargadoDepartamentoDto {
  @IsString()
  @MaxLength(150)
  nombre!: string;

  @IsString()
  @MaxLength(150)
  departamento!: string;
}

export class CrearSolicitudImplementacionDto {
  // Fase 1 — Empresa
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  empresaNombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  giroNegocio?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  cantidadEmpleados?: number;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  // Fase 2 — Estructura organizacional
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  departamentos?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rolesMultiples?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  ceoNombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  rrhhNombre?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => EncargadoDepartamentoDto)
  encargadosPorDepartamento?: EncargadoDepartamentoDto[];

  // Fase 3 — Roster
  @IsOptional()
  @IsString()
  rosterArchivoUrl?: string;

  // Fase 4 — Vacantes con IA
  @IsBoolean()
  quiereVacantesIA!: boolean;

  // Fase 5 — Bitácoras / agente TIX
  @IsIn(['grupo', 'privado'])
  canalBitacoras!: 'grupo' | 'privado';

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombreGrupo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  horaCheckin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  horaCheckout?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsString({ each: true })
  diasLaborales?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  receptorAlertas?: string;

  // Fase 6 — Cómo miden el desempeño
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  buenDiaTrabajo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  medicionPorRol?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  queCalificaBajo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  interesaCumplimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  baseTalentoDelMes?: string;

  // Fase 7 — Contacto
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  contactoNombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  contactoCargo?: string;

  @IsEmail()
  contactoCorreo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactoTelefono?: string;
}
