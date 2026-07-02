import { IsBoolean } from 'class-validator';

export class EstadoEmpresaDto {
  @IsBoolean()
  activo!: boolean;
}
