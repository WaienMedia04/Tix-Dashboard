import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearPostDto {
  /** Puede incluir menciones codificadas como `@[Nombre](usuarioId)`. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  texto!: string;

  /** Si es true, también aparece en "Idea del día" (doc "Actualización Mural 2.0" #12). */
  @IsBoolean()
  @IsOptional()
  esIdea?: boolean;
}
