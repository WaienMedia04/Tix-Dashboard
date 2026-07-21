import { IsOptional, IsString } from 'class-validator';

export class ActualizarDepartamentoGestionadoDto {
  /** String vacío o ausente = quitar el departamento asignado. */
  @IsString()
  @IsOptional()
  departamentoGestionado?: string;
}
