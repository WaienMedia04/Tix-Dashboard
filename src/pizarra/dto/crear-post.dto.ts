import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPostDto {
  /** Puede incluir menciones codificadas como `@[Nombre](usuarioId)`. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  texto!: string;
}
