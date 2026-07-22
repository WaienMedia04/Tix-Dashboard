import { IsOptional, IsString } from 'class-validator';

export class AusenciasQueryDto {
  @IsOptional()
  @IsString()
  talentoId?: string;

  @IsOptional()
  @IsString()
  departamento?: string;
}
