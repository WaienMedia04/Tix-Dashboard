import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearConversacionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  participanteIds!: string[];

  @IsBoolean()
  @IsOptional()
  esGrupo?: boolean;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(60)
  nombre?: string;
}
