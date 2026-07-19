import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class EditarEmpresaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsIn(['starter', 'pro', 'enterprise'])
  @IsOptional()
  plan?: string;

  @IsString()
  @IsOptional()
  codigoAcceso?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}
