import { TipoEstampaForma } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearEstampaDefinicionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imagenUrl!: string;

  @IsEnum(TipoEstampaForma)
  forma!: TipoEstampaForma;

  /** Si se omite, la estampa solo se puede regalar (RRHH/CEO) — no aparece en la Tienda. */
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(20000)
  precio?: number;
}
