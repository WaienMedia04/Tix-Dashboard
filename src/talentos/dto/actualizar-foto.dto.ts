import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ActualizarFotoDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  fotoUrl!: string;
}
