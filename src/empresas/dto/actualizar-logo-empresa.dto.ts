import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ActualizarLogoEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  logoUrl!: string;
}
