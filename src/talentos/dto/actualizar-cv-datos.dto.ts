import { IsArray, IsOptional, IsString } from 'class-validator';

/**
 * Edición manual de los datos que la IA extrajo del CV — RRHH corrige lo
 * que el modelo interpretó mal, sin tener que volver a subir el archivo.
 * Solo cubre los campos que de verdad vale la pena corregir a mano; el
 * resto (experiencia laboral, educación) se re-extrae subiendo el CV de
 * nuevo si hace falta.
 */
export class ActualizarCvDatosDto {
  @IsOptional()
  @IsString()
  resumenParaRRHH?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  habilidades?: string[];

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
