import { TipoEstampaForma } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
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
}
