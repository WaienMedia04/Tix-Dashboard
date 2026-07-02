import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CrearEmpresaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  slug?: string;

  @IsString()
  @IsIn(['starter', 'pro', 'enterprise'])
  plan!: string;

  @IsString()
  @IsOptional()
  codigoAcceso?: string;
}
