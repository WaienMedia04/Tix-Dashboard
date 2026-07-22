import { IsArray, IsString } from 'class-validator';

export class ActualizarDepartamentosSupervisadosDto {
  /** Arreglo vacío = quitar todos los departamentos supervisados. */
  @IsArray()
  @IsString({ each: true })
  departamentosSupervisados!: string[];
}
