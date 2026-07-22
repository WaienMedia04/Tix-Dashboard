import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearEncuestaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  pregunta!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  opciones!: string[];
}
